"use server";

import { revalidatePath } from "next/cache";
import {
  createServiceRoleClient,
  getSupabaseServerClient,
} from "@/lib/supabase/server";
import type { Address } from "@/features/shop/account/types";
import type { CartItem, GuestCheckoutInfo } from "@/features/shop/cart/types";
import { sendOrderEmail } from "@/lib/utils/send-mail";
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
  discountAmount: clientDiscountAmount, // Client's discount amount
  shippingFee: clientShippingFee, // Client's shipping fee
  total: clientTotal, // Client's total
  guestInfo,
}: {
  shippingAddress: Address;
  paymentMethodId: number;
  deliveryNotes?: string;
  discountId?: number | null; // Allow null explicitly
  cartItems: CartItem[];
  subtotal: number; // Client's calculated subtotal (will be verified)
  discountAmount: number; // Client's discount amount
  shippingFee: number; // Client's shipping fee
  total: number; // Client's total
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
  console.log("Client provided discount amount:", clientDiscountAmount);
  console.log("Client provided shipping fee:", clientShippingFee);
  console.log("Client provided total:", clientTotal);
  console.log("Discount ID:", discountId);

  try {
    // 1. Get User Session (if any)
    const {
      data: { session },
    } = await regularSupabase.auth.getSession();
    const userId = session?.user?.id;
    console.log("User authenticated:", !!userId);

    // 1.1 Get shop settings for default shipping fee
    const { data: shopSettings, error: shopSettingsError } = await supabase
      .from("shop_settings")
      .select("default_shipping_fee")
      .eq("id", 1)
      .single();

    if (shopSettingsError) {
      console.error("Error fetching shop settings:", shopSettingsError);
      // Continue with default values if shop settings can't be fetched
    }

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

      // Validate that item price hasn't changed
      // Lấy giá từ client, xem xét cả camelCase và snake_case
      const clientPrice =
        item.product?.salePrice ??
        item.product?.sale_price ??
        item.product?.price ??
        0;
      const dbPrice = currentVariant.sale_price ?? currentVariant.price;

      if (clientPrice === 0) {
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

    // 4. Server-Side Subtotal and Price Verification
    // Calculate subtotal based on actual DB prices (not client prices)
    let serverSubtotal = 0;
    let saleDiscount = 0;

    for (const item of cartItems) {
      const itemVariantId = item.variantId ?? (item as any).variant_id;
      const variant = latestVariants.find((v) => v.id === itemVariantId)!;

      // Calculate original price and sale discount
      const originalPrice = variant.price;
      const salePrice = variant.sale_price ?? originalPrice;

      // Add to total sale discount
      if (salePrice < originalPrice) {
        saleDiscount += (originalPrice - salePrice) * item.quantity;
      }

      // Add to server subtotal (based on actual sale prices)
      serverSubtotal += salePrice * item.quantity;
    }

    // Format numbers consistently
    const numericSubtotal = Number(
      parseFloat(serverSubtotal.toString()).toFixed(2)
    );

    // Verify that client's subtotal matches our calculation (with tolerance)
    const subtotalDiscrepancy = Math.abs(numericSubtotal - clientSubtotal);
    if (subtotalDiscrepancy > 1) {
      // Allow 1 VND tolerance for rounding
      console.error(
        `Subtotal calculation mismatch: Client=${clientSubtotal}, Server=${numericSubtotal}. Difference=${subtotalDiscrepancy}`
      );
      return {
        success: false,
        error:
          "Tổng giỏ hàng không khớp với giá hiện tại. Vui lòng làm mới giỏ hàng.",
      };
    }

    // 5. Determine shipping fee (server-side)
    // Use shop settings default_shipping_fee instead of relying on client's value
    const serverShippingFee = shopSettings?.default_shipping_fee ?? 0;
    const numericShippingFee = Number(
      parseFloat(serverShippingFee.toString()).toFixed(2)
    );

    console.log("Server determined shipping fee:", numericShippingFee);
    console.log(
      "Original price (before sale discount):",
      numericSubtotal + saleDiscount
    );
    console.log("Sale discount (product discounts):", saleDiscount);
    console.log("Subtotal after sale discount:", numericSubtotal);

    // 6. Discount Validation and Calculation
    let dbDiscount: Database["public"]["Tables"]["discounts"]["Row"] | null =
      null;
    let calculatedDiscountAmount = 0;

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

      // Check conditions critical for the discount
      const now = new Date();
      if (!dbDiscount || !dbDiscount.is_active)
        return { success: false, error: "Mã giảm giá không hoạt động." };
      if (dbDiscount.start_date && new Date(dbDiscount.start_date) > now)
        return { success: false, error: "Mã giảm giá chưa tới ngày sử dụng." };
      if (dbDiscount.end_date && new Date(dbDiscount.end_date) < now)
        return { success: false, error: "Mã giảm giá đã hết hạn." };
      if (dbDiscount.remaining_uses !== null && dbDiscount.remaining_uses <= 0)
        return { success: false, error: "Mã giảm giá đã hết lượt sử dụng." };
      // Check min_order_value against verified server subtotal
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

      // Tính toán giá trị giảm giá (logic tương tự như trigger)
      if (dbDiscount.discount_percentage) {
        // Mã giảm giá theo phần trăm
        calculatedDiscountAmount =
          numericSubtotal * (dbDiscount.discount_percentage / 100);

        // Áp dụng giới hạn max_discount_amount nếu có
        if (
          dbDiscount.max_discount_amount &&
          calculatedDiscountAmount > dbDiscount.max_discount_amount
        ) {
          calculatedDiscountAmount = dbDiscount.max_discount_amount;
        }
      } else if (dbDiscount.max_discount_amount) {
        // Mã giảm giá cố định
        calculatedDiscountAmount = dbDiscount.max_discount_amount;

        // Đảm bảo số tiền giảm giá không vượt quá subtotal
        if (calculatedDiscountAmount > numericSubtotal) {
          calculatedDiscountAmount = numericSubtotal;
        }
      }

      // Format discount amount consistently
      calculatedDiscountAmount = Number(
        parseFloat(calculatedDiscountAmount.toString()).toFixed(2)
      );

      // Kiểm tra xem giá trị giảm giá tính toán có gần bằng giá trị client gửi lên không
      const discountDiscrepancy = Math.abs(
        calculatedDiscountAmount - clientDiscountAmount
      );
      if (discountDiscrepancy > 1) {
        // Cho phép sai số 1 VND
        console.error(
          `DISCOUNT DISCREPANCY DETECTED: Server=${calculatedDiscountAmount}, Client=${clientDiscountAmount}, Difference=${discountDiscrepancy}`
        );
        return {
          success: false,
          error: `Số tiền giảm giá không hợp lệ. Vui lòng làm mới giỏ hàng.`,
        };
      }

      console.log("Pre-commit discount validation passed.");
      console.log(
        "Server calculated discount amount:",
        calculatedDiscountAmount
      );
    }

    // 7. Get Initial Order Status ID
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

    // 8. Calculate Final Total
    // Tổng tiền = subtotal - discount + shipping_fee
    const numericTotal =
      Math.max(0, numericSubtotal - calculatedDiscountAmount) +
      numericShippingFee;

    console.log("Voucher discount amount:", calculatedDiscountAmount);
    console.log("Server calculated total:", numericTotal);
    console.log("Client total:", clientTotal);

    // Compare with client total for validation
    const totalDiscrepancy = Math.abs(numericTotal - clientTotal);
    if (totalDiscrepancy > 500) {
      // Allow larger tolerance (500đ) for differences in calculation
      console.error(
        `TOTAL DISCREPANCY DETECTED: Server=${numericTotal}, Client=${clientTotal}, Difference=${totalDiscrepancy}`
      );
      return {
        success: false,
        error: `Tổng tiền đơn hàng không chính xác. Vui lòng làm mới giỏ hàng và thử lại.`,
      };
    }

    // 9. Database Operations
    console.log("Starting database transaction...");
    console.log("=============================================");
    console.log("PRE-INSERT DATABASE VALUES:", {
      user_id: userId || null,
      payment_method_id: paymentMethodId,
      order_status_id: orderStatusId,
      discount_id: discountId || null,
      subtotal_amount: numericSubtotal,
      discount_amount: calculatedDiscountAmount,
      shipping_fee: numericShippingFee,
      total_amount: numericTotal,
    });

    if (dbDiscount) {
      console.log("DISCOUNT DETAILS:", {
        id: dbDiscount.id,
        code: dbDiscount.code,
        is_active: dbDiscount.is_active,
        percentage: dbDiscount.discount_percentage,
        max_amount: dbDiscount.max_discount_amount,
        min_value: dbDiscount.min_order_value,
      });
    }
    console.log("=============================================");

    // Step 9.1: Insert Order Record with pre-calculated values
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
        subtotal_amount: numericSubtotal,
        discount_amount: calculatedDiscountAmount,
        shipping_fee: numericShippingFee,
        total_amount: numericTotal,
      })
      .select("id, access_token, discount_amount, total_amount")
      .single();

    if (orderError) {
      console.error("DATABASE ERROR creating order:", orderError);
      return {
        success: false,
        error: `Không thể tạo đơn hàng: ${orderError.message}`,
      };
    }

    const orderId = newOrder.id;
    console.log("Order created successfully with ID:", orderId);
    console.log("--- POST-INSERT VALUES ---");
    console.log("DB discount_amount:", newOrder.discount_amount);
    console.log("DB total_amount:", newOrder.total_amount);
    console.log("---------------------------");

    // Step 9.2: Update remaining uses for discount if applicable
    if (discountId && dbDiscount && dbDiscount.remaining_uses !== null) {
      const { error: discountUpdateError } = await supabase
        .from("discounts")
        .update({ remaining_uses: dbDiscount.remaining_uses - 1 })
        .eq("id", discountId);

      if (discountUpdateError) {
        console.error(
          "Error updating discount remaining uses:",
          discountUpdateError
        );
        // Don't fail the order just because of discount update error
        // But log it for monitoring
      } else {
        console.log(
          `Updated discount ID ${discountId} remaining uses: ${
            dbDiscount.remaining_uses
          } -> ${dbDiscount.remaining_uses - 1}`
        );
      }
    }

    // Step 9.3: Insert Order Items
    for (const item of cartItems) {
      const itemVariantId = item.variantId ?? (item as any).variant_id;
      const variant = latestVariants.find((v) => v.id === itemVariantId)!;

      // Use variant price from database (already validated matches client price)
      const unitPrice = variant.sale_price ?? variant.price;

      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: orderId,
        variant_id: itemVariantId,
        product_name: variant.products.name,
        variant_volume_ml: variant.volume_ml,
        quantity: item.quantity,
        unit_price_at_order: Number(unitPrice.toFixed(2)),
      });

      if (itemError) {
        console.error(
          `DATABASE ERROR creating order item for variant ${itemVariantId}:`,
          itemError
        );
        // Since we can't easily rollback without transactions, at least try to update order status to indicate problem
        await supabase
          .from("orders")
          .update({
            order_status_id: 9999,
            notes: "Order creation error: Items not fully added",
          })
          .eq("id", orderId);

        throw new Error(
          `Không thể thêm sản phẩm "${variant.products.name}" vào đơn hàng: ${itemError.message}`
        );
      }
    }
    console.log("Order items created successfully.");

    // Step 9.4: Create Initial Payment Record
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: orderId,
      payment_date: new Date().toISOString(),
      payment_method_id: paymentMethodId,
      amount: Number(numericTotal.toFixed(2)), // Use calculated total
      status: "Pending", // Initial status
    });

    if (paymentError) {
      console.error("DATABASE ERROR creating payment record:", paymentError);
      throw new Error(
        `Không thể tạo bản ghi thanh toán: ${paymentError.message}`
      );
    }
    console.log("Initial payment record created.");

    // Step 9.5: Clear Cart Items (Only for authenticated users)
    if (userId) {
      const { data: cart, error: cartError } = await supabase
        .from("shopping_carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (cartError) {
        console.error("Error fetching user cart for clearing:", cartError);
      } else if (cart) {
        const { error: deleteError } = await supabase
          .from("cart_items")
          .delete()
          .eq("cart_id", cart.id)
          .in("variant_id", variantIds);

        if (deleteError) {
          console.error("Error clearing cart items:", deleteError);
        } else {
          console.log("Cleared ordered items from user's cart.");
        }
      }
    }

    // 10. Revalidate Paths
    console.log("Revalidating paths...");
    // Transaction complete successfully
    console.log("Order placement transaction completed successfully");

    // Gửi email xác nhận đơn hàng cho khách
    try {
      let customerEmail = userId ? session.user.email : guestInfo?.email;
      if (customerEmail) {
        let subject = `Xác nhận đơn hàng #${orderId}`;
        let html = `<p>Cảm ơn bạn đã đặt hàng tại shop!</p>`;
        html += `<p>Mã đơn hàng: <b>${orderId}</b></p>`;
        if (!userId && newOrder.access_token) {
          html += `<p>Mã tra cứu đơn hàng (token): <b>${newOrder.access_token}</b></p>`;
        }
        await sendOrderEmail({ to: customerEmail, subject, html });
      }
    } catch (e) {
      console.error("Gửi email xác nhận đơn hàng thất bại:", e);
    }

    // Revalidate relevant paths
    revalidatePath("/gio-hang");
    revalidatePath("/thanh-toan");

    if (userId) {
      revalidatePath(`/tai-khoan/don-hang/${orderId}`);
      revalidatePath("/tai-khoan/don-hang");
    } else {
      revalidatePath(`/xac-nhan-don-hang`);
    }
    revalidatePath("/api/cart");

    console.log("Order placement successful.");
    return {
      success: true,
      orderId,
      accessToken: !userId ? newOrder.access_token : undefined,
    };
  } catch (error: any) {
    console.error("FATAL ERROR during order placement:", error);
    const message = error.message || "Đã xảy ra lỗi không mong muốn.";
    return {
      success: false,
      error: message.startsWith("Không thể")
        ? message
        : "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.",
    };
  }
}
