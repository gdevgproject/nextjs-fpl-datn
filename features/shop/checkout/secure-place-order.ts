"use server";

import { revalidatePath } from "next/cache";
import {
  createServiceRoleClient,
  getSupabaseServerClient,
} from "@/lib/supabase/server";
import type { Address } from "@/features/shop/account/types";
import type { CartItem, GuestCheckoutInfo } from "@/features/shop/cart/types";
import { Database } from "@/lib/types/database.types"; // Import generated types

// Define specific types for better clarity
type OrderVariant = Database["public"]["Tables"]["product_variants"]["Row"] & {
  products: Pick<
    Database["public"]["Tables"]["products"]["Row"],
    "id" | "name" | "deleted_at"
  >;
};

interface PlaceOrderResponse {
  success: boolean;
  orderId?: number;
  accessToken?: string; // Only for guest users
  error?: string;
}

/**
 * Secured server action for placing orders that handles both authenticated and guest users.
 * Uses a service role client to bypass RLS for necessary operations, relying on internal validation
 * and database triggers/constraints for security and data integrity.
 *
 * IMPORTANT: This function implements strict pre-commit validation to ensure the prices shown
 * to users in the UI match exactly what they will pay, rejecting orders if prices have changed.
 *
 * NOTE: This action relies HEAVILY on database triggers (`calculate_order_total`, `validate_discount_code`)
 * defined in schema.txt to correctly calculate final amounts and validate discounts.
 * Ensure those triggers are active and the data in the `discounts` table is correct.
 */
export async function securedPlaceOrder({
  shippingAddress,
  paymentMethodId,
  deliveryNotes,
  discountId,
  cartItems,
  subtotal: clientSubtotal, // Client's calculated subtotal
  shippingFee, // Shipping fee from client
  guestInfo,
}: {
  shippingAddress: Address;
  paymentMethodId: number;
  deliveryNotes?: string;
  discountId?: number | null; // Allow null explicitly
  cartItems: CartItem[];
  subtotal: number; // Client's calculated subtotal (will be verified)
  shippingFee: number;
  guestInfo?: GuestCheckoutInfo | null;
}): Promise<PlaceOrderResponse> {
  // Input Validation
  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Giỏ hàng trống." };
  }
  if (!shippingAddress) {
    return { success: false, error: "Thiếu địa chỉ giao hàng." };
  }
  if (!paymentMethodId) {
    return { success: false, error: "Thiếu phương thức thanh toán." };
  }

  const regularSupabase = await getSupabaseServerClient();
  const supabase = await createServiceRoleClient(); // Use service role for the transaction

  console.log(
    `Starting order placement process for ${
      guestInfo ? "guest" : "user"
    } with ${cartItems.length} items.`
  );
  console.log("Client provided subtotal:", clientSubtotal);
  console.log("Discount ID:", discountId);

  try {
    // 1. Get User Session (if any)
    const {
      data: { session },
    } = await regularSupabase.auth.getSession();
    const userId = session?.user?.id;
    console.log("User authenticated:", !!userId);

    // 2. Pre-Commit Validation: Fetch latest variant data using Service Role
    console.log("Performing pre-commit validation...");

    const variantIds = cartItems
      .map((item) => {
        // Ensure robust ID extraction
        const id = item.variantId ?? (item as any).variant_id;
        if (typeof id === "number" && id > 0) {
          return id;
        }
        console.warn("Invalid variant ID in cart item:", item);
        return null;
      })
      .filter((id): id is number => id !== null); // Type guard for filtering nulls

    if (variantIds.length !== cartItems.length) {
      console.error("Cart contains items with invalid variant IDs:", cartItems);
      return {
        success: false,
        error: "Giỏ hàng chứa sản phẩm không hợp lệ. Vui lòng làm mới.",
      };
    }

    const { data: latestVariantsData, error: variantsError } = await supabase
      .from("product_variants")
      .select(
        `
        id,
        volume_ml,
        price,
        sale_price,
        stock_quantity,
        deleted_at,
        products ( id, name, deleted_at )
      `
      )
      .in("id", variantIds);

    if (variantsError || !latestVariantsData) {
      console.error("Error fetching latest variant data:", variantsError);
      return {
        success: false,
        error: "Lỗi: Không thể xác minh thông tin sản phẩm. Vui lòng thử lại.",
      };
    }

    // Cast to the specific type, ensure products is not null
    const latestVariants: OrderVariant[] = latestVariantsData
      .map((v) => {
        // Ensure the nested products object is valid before casting
        if (!v.products || typeof v.products !== "object") {
          console.error(`Variant ${v.id} is missing valid product data.`);
          return null; // Mark as invalid
        }
        return v as unknown as OrderVariant;
      })
      .filter((v): v is OrderVariant => v !== null); // Filter out invalid ones

    if (latestVariants.length !== variantIds.length) {
      // This means some variants fetched were invalid or missing product data
      console.error(
        "Mismatch fetching variant details or missing product data."
      );
      return {
        success: false,
        error:
          "Lỗi: Không thể lấy đầy đủ thông tin sản phẩm. Vui lòng thử lại.",
      };
    }

    // 3. Validate Availability & Stock
    const validationIssues: string[] = [];
    for (const item of cartItems) {
      const itemVariantId = item.variantId ?? (item as any).variant_id;
      const currentVariant = latestVariants.find((v) => v.id === itemVariantId);

      if (!currentVariant) {
        validationIssues.push(`Sản phẩm ID ${itemVariantId} không tìm thấy.`);
        continue;
      }
      if (currentVariant.deleted_at) {
        validationIssues.push(
          `Sản phẩm "${currentVariant.products.name}" (${currentVariant.volume_ml}ml) đã bị xóa.`
        );
        continue;
      }
      if (currentVariant.products.deleted_at) {
        validationIssues.push(
          `Sản phẩm "${currentVariant.products.name}" không còn kinh doanh.`
        );
        continue;
      }
      if (currentVariant.stock_quantity < item.quantity) {
        validationIssues.push(
          `"${currentVariant.products.name}" (${currentVariant.volume_ml}ml): Chỉ còn ${currentVariant.stock_quantity} trong kho.`
        );
        continue;
      }

      // NEW: Validate that item price hasn't changed
      const clientPrice = item.product?.salePrice ?? item.product?.price;
      const dbPrice = currentVariant.sale_price ?? currentVariant.price;

      if (clientPrice === undefined) {
        validationIssues.push(
          `"${currentVariant.products.name}" (${currentVariant.volume_ml}ml): Thiếu thông tin giá.`
        );
        continue;
      }

      // Allow for small rounding differences but reject if actual price changed
      const allowedDiscrepancy = 1; // 1 VND tolerance
      if (Math.abs(clientPrice - dbPrice) > allowedDiscrepancy) {
        validationIssues.push(
          `"${currentVariant.products.name}" (${
            currentVariant.volume_ml
          }ml): Giá đã thay đổi từ ${clientPrice.toLocaleString(
            "vi-VN"
          )}đ thành ${dbPrice.toLocaleString(
            "vi-VN"
          )}đ. Vui lòng làm mới giỏ hàng.`
        );
        continue;
      }
    }

    if (validationIssues.length > 0) {
      console.error("Validation failures:", validationIssues);
      return { success: false, error: validationIssues.join("; ") };
    }
    console.log("Availability, stock, and price validation passed.");

    // 4. Server-Side Subtotal Verification (Not Recalculation)
    // Calculate what the subtotal should be based on client-provided prices
    const verifiedSubtotal = cartItems.reduce((sum, item) => {
      const price = item.product?.salePrice ?? item.product?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);

    // Check if client-provided subtotal matches our calculation from client-provided prices
    // This checks for math errors on client side, not price changes
    const subtotalDiscrepancy = Math.abs(verifiedSubtotal - clientSubtotal);
    if (subtotalDiscrepancy > 1) {
      // Allow 1 VND tolerance for rounding
      console.error(
        `Subtotal calculation mismatch: Client=${clientSubtotal}, Verified=${verifiedSubtotal}. Difference=${subtotalDiscrepancy}`
      );
      return {
        success: false,
        error: "Tổng giỏ hàng không khớp. Vui lòng làm mới giỏ hàng.",
      };
    }

    // Format numbers for insertion (using verified client subtotal)
    const numericSubtotal = Number(clientSubtotal.toFixed(2));
    const numericShippingFee = Number(shippingFee.toFixed(2));

    // 5. Pre-Commit Discount Check
    let dbDiscount: Database["public"]["Tables"]["discounts"]["Row"] | null =
      null;
    if (discountId) {
      const { data: discountData, error: discountError } = await supabase
        .from("discounts")
        .select("*")
        .eq("id", discountId)
        .single();

      if (discountError || !discountData) {
        console.error("Discount validation error:", discountError);
        return { success: false, error: "Mã giảm giá không hợp lệ." };
      }
      dbDiscount = discountData; // Store for logging

      // Check conditions critical for the DB trigger's success
      const now = new Date();
      if (!dbDiscount || !dbDiscount.is_active)
        return { success: false, error: "Mã giảm giá không hoạt động." };
      if (dbDiscount.start_date && new Date(dbDiscount.start_date) > now)
        return { success: false, error: "Mã giảm giá chưa tới ngày sử dụng." };
      if (dbDiscount.end_date && new Date(dbDiscount.end_date) < now)
        return { success: false, error: "Mã giảm giá đã hết hạn." };
      if (dbDiscount.remaining_uses !== null && dbDiscount.remaining_uses <= 0)
        return { success: false, error: "Mã giảm giá đã hết lượt sử dụng." };
      // Check min_order_value against verified client subtotal (not db prices)
      if (
        dbDiscount.min_order_value &&
        numericSubtotal < dbDiscount.min_order_value
      ) {
        return {
          success: false,
          error: `Đơn hàng chưa đủ ${dbDiscount.min_order_value.toLocaleString(
            "vi-VN"
          )}đ để dùng mã này.`,
        };
      }
      console.log("Pre-commit discount validation passed.");
    }

    // 6. Get Initial Order Status ID
    const { data: initialStatus, error: statusError } = await supabase
      .from("order_statuses")
      .select("id")
      .eq("name", "Chờ xác nhận") // Use exact name from seed data
      .single();

    if (statusError || !initialStatus) {
      console.error("Error fetching 'Chờ xác nhận' order status:", statusError);
      return {
        success: false,
        error: "Lỗi hệ thống: Không thể xác định trạng thái đơn hàng.",
      };
    }
    const orderStatusId = initialStatus.id;
    console.log("Using initial order status ID:", orderStatusId);

    // 7. Database Operations (Implicit Transaction)
    console.log("Starting database transaction...");

    // Log key values JUST before insertion
    console.log("=============================================");
    console.log("PRE-INSERT DATABASE VALUES:", {
      user_id: userId || null,
      payment_method_id: paymentMethodId,
      order_status_id: orderStatusId,
      discount_id: discountId || null,
      subtotal_amount: numericSubtotal, // Using verified client subtotal
      shipping_fee: numericShippingFee,
      // These will be calculated by the DB trigger:
      // discount_amount: (Will be set by trigger, defaults to 0)
      // total_amount: (Will be set by trigger)
    });
    if (dbDiscount) {
      console.log("DISCOUNT DETAILS (for trigger context):", {
        id: dbDiscount.id,
        code: dbDiscount.code,
        is_active: dbDiscount.is_active,
        percentage: dbDiscount.discount_percentage,
        max_amount: dbDiscount.max_discount_amount,
        min_value: dbDiscount.min_order_value,
      });
    }
    console.log("=============================================");

    // Step 7.1: Insert Order Record
    // Let the database handle default for discount_amount (0)
    // Provide a temporary total_amount to satisfy NOT NULL, trigger will update it.
    const temporaryTotal = numericSubtotal + numericShippingFee; // Temporary value

    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId || null,
        guest_name: !userId && guestInfo ? guestInfo.name : null,
        guest_email: !userId && guestInfo ? guestInfo.email : null,
        guest_phone: !userId && guestInfo ? guestInfo.phone : null,
        recipient_name: shippingAddress.recipient_name,
        recipient_phone: shippingAddress.recipient_phone,
        province_city: shippingAddress.province_city,
        district: shippingAddress.district,
        ward: shippingAddress.ward,
        street_address: shippingAddress.street_address,
        delivery_notes: deliveryNotes || null,
        payment_method_id: paymentMethodId,
        payment_status: "Pending", // Default payment status
        order_status_id: orderStatusId,
        discount_id: discountId || null,
        subtotal_amount: numericSubtotal, // Use verified client subtotal
        shipping_fee: numericShippingFee,
        // discount_amount: OMITTED - Let DB default and trigger handle it
        total_amount: temporaryTotal, // Provide temporary value, trigger will overwrite
      })
      .select("id, access_token, discount_amount, total_amount") // Select amounts AFTER trigger
      .single();

    if (orderError) {
      console.error("DATABASE ERROR creating order:", orderError);
      // Check for specific errors from triggers (e.g., discount validation)
      if (orderError.message.includes("Mã giảm giá không hợp lệ")) {
        return { success: false, error: orderError.message };
      }
      if (orderError.message.includes("Đơn hàng chưa đủ giá trị tối thiểu")) {
        return { success: false, error: orderError.message };
      }
      // Add more specific error checks if needed based on trigger messages
      return {
        success: false,
        error: `Không thể tạo đơn hàng: ${orderError.message}`,
      };
    }

    const orderId = newOrder.id;
    console.log("Order created successfully with ID:", orderId);
    // Log the amounts ACTUALLY inserted (after trigger)
    console.log("--- POST-TRIGGER VALUES ---");
    console.log("DB discount_amount:", newOrder.discount_amount);
    console.log("DB total_amount:", newOrder.total_amount);
    console.log("---------------------------");

    // Step 7.2: Insert Order Items
    for (const item of cartItems) {
      const itemVariantId = item.variantId ?? (item as any).variant_id;
      const variant = latestVariants.find((v) => v.id === itemVariantId)!;

      // IMPORTANT: Use client-provided price that we already validated
      const unitPrice = item.product?.salePrice ?? item.product?.price ?? 0;

      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: orderId,
        variant_id: itemVariantId,
        product_name: variant.products.name,
        variant_volume_ml: variant.volume_ml,
        quantity: item.quantity,
        unit_price_at_order: Number(unitPrice.toFixed(2)), // Use validated client price
      });

      if (itemError) {
        console.error(
          `DATABASE ERROR creating order item for variant ${itemVariantId}:`,
          itemError
        );
        // Note: In a real transaction, this error should ideally trigger a rollback.
        // Since we are using implicit transaction, we throw to stop execution.
        throw new Error(
          `Không thể thêm sản phẩm "${variant.products.name}" vào đơn hàng: ${itemError.message}`
        );
      }
    }
    console.log("Order items created successfully.");

    // Step 7.3: Create Initial Payment Record
    // Use the FINAL total_amount returned by the database after the trigger ran.
    const finalTotalAmount = newOrder.total_amount ?? temporaryTotal; // Fallback just in case

    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: orderId,
      payment_date: new Date().toISOString(),
      payment_method_id: paymentMethodId,
      amount: Number(finalTotalAmount.toFixed(2)), // Use final amount
      status: "Pending", // Initial status
    });

    if (paymentError) {
      console.error("DATABASE ERROR creating payment record:", paymentError);
      throw new Error(
        `Không thể tạo bản ghi thanh toán: ${paymentError.message}`
      );
    }
    console.log("Initial payment record created.");

    // Step 7.4: Clear Cart Items (Only for authenticated users)
    if (userId) {
      const { data: cart, error: cartError } = await supabase
        .from("shopping_carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (cartError) {
        console.error("Error fetching user cart for clearing:", cartError);
        // Don't fail the whole order, just log the warning
      } else if (cart) {
        // Use the already validated variantIds
        const { error: deleteError } = await supabase
          .from("cart_items")
          .delete()
          .eq("cart_id", cart.id)
          .in("variant_id", variantIds); // variantIds defined earlier

        if (deleteError) {
          console.error("Error clearing cart items:", deleteError);
          // Don't fail the whole order, just log
        } else {
          console.log("Cleared ordered items from user's cart.");
        }
      }
    }

    // 8. Revalidate Paths
    console.log("Revalidating paths...");
    revalidatePath("/gio-hang");
    revalidatePath("/thanh-toan");
    // Correct path for confirmation might depend on guest/user
    if (userId) {
      revalidatePath(`/tai-khoan/don-hang/${orderId}`);
      revalidatePath("/tai-khoan/don-hang");
    } else {
      // Guest path might use access token in query
      // Revalidate a generic path or the specific confirmation path if known
      revalidatePath(`/xac-nhan-don-hang`); // Revalidate the page itself
    }
    revalidatePath("/api/cart"); // If you have an API route for cart

    console.log("Order placement successful.");
    return {
      success: true,
      orderId,
      accessToken: !userId ? newOrder.access_token : undefined,
    };
  } catch (error: any) {
    console.error("FATAL ERROR during order placement:", error);
    // Try to return a more specific error message if possible
    const message = error.message || "Đã xảy ra lỗi không mong muốn.";
    return {
      success: false,
      // Avoid exposing raw SQL errors directly to the client in production
      error: message.startsWith("Không thể") // Pass our custom errors
        ? message
        : "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.",
    };
  }
}
