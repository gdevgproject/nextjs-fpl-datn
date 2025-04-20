"use server";

import { revalidatePath } from "next/cache";
import {
  createServiceRoleClient,
  getSupabaseServerClient,
} from "@/lib/supabase/server";
import type { Address } from "@/features/shop/account/types";
import type { CartItem, GuestCheckoutInfo } from "@/features/shop/cart/types";

/**
 * Type definition for the Place Order response
 */
interface PlaceOrderResponse {
  success: boolean;
  orderId?: number;
  accessToken?: string;
  error?: string;
}

/**
 * Secured server action for placing orders that handles both authenticated and guest users.
 * Uses a service role client to bypass RLS for full transaction integrity.
 */
export async function securedPlaceOrder({
  shippingAddress,
  paymentMethodId,
  deliveryNotes,
  discountId,
  cartItems,
  subtotal,
  discountAmount,
  shippingFee,
  total,
  guestInfo,
}: {
  shippingAddress: Address;
  paymentMethodId: number;
  deliveryNotes?: string;
  discountId?: number;
  cartItems: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  guestInfo?: GuestCheckoutInfo | null;
}): Promise<PlaceOrderResponse> {
  // Create regular Supabase client for user session check only
  const regularSupabase = await getSupabaseServerClient();

  // Create service role client for transaction operations (bypasses RLS)
  // Fix: Make sure to await the async function to get the actual client instance
  const supabase = await createServiceRoleClient();

  console.log(
    "Starting order placement process with",
    cartItems.length,
    "items"
  );

  try {
    // Get user session if available
    const {
      data: { session },
    } = await regularSupabase.auth.getSession();
    const userId = session?.user?.id;

    console.log("Session check complete. User authenticated:", !!userId);

    // PRE-COMMIT VALIDATION: Verify current product variant data
    console.log("Performing pre-commit validation...");

    // Extract variant IDs, supporting both variantId (camelCase) and variant_id (snake_case)
    const variantIds = cartItems
      .map((item) => {
        // Kiểm tra xem trường nào tồn tại và có giá trị hợp lệ
        if (typeof item.variantId === "number") return item.variantId;
        if (typeof (item as any).variant_id === "number")
          return (item as any).variant_id;
        console.error("Invalid cart item:", item);
        return null;
      })
      .filter(Boolean);

    if (variantIds.length !== cartItems.length) {
      console.error(
        "Some cart items have invalid variant ID format",
        cartItems
      );
      return {
        success: false,
        error: "Lỗi định dạng giỏ hàng. Vui lòng làm mới trang và thử lại.",
      };
    }

    // Fetch the latest data for all variants being ordered
    const { data: latestVariantsRaw, error: variantsError } = await supabase
      .from("product_variants")
      .select(
        `
        id, 
        volume_ml,
        price, 
        sale_price, 
        stock_quantity, 
        deleted_at,
        products(
          id, 
          name, 
          deleted_at
        )
      `
      )
      .in("id", variantIds);

    if (variantsError || !latestVariantsRaw) {
      console.error("Error fetching latest variant data:", variantsError);
      return {
        success: false,
        error: "Không thể xác minh thông tin sản phẩm. Vui lòng thử lại sau.",
      };
    }

    // Chuyển đổi cấu trúc dữ liệu Supabase trả về sang định dạng an toàn hơn
    const latestVariants = latestVariantsRaw.map((variant) => ({
      id: variant.id,
      volume_ml: variant.volume_ml,
      price: variant.price,
      sale_price: variant.sale_price,
      stock_quantity: variant.stock_quantity,
      deleted_at: variant.deleted_at,
      products: variant.products as unknown as {
        id: number;
        name: string;
        deleted_at: string | null;
      },
    }));

    // Validate the variants
    const unavailableVariants: { id: number; reason: string }[] = [];
    const priceChangedVariants: {
      id: number;
      oldPrice: number;
      newPrice: number;
    }[] = [];

    for (const item of cartItems) {
      // Sử dụng variantId hoặc variant_id nếu cái trước không tồn tại
      const itemVariantId = item.variantId || (item as any).variant_id;
      const currentVariant = latestVariants.find((v) => v.id === itemVariantId);

      // Check if variant exists and is not deleted
      if (!currentVariant) {
        console.error(`Variant ID ${itemVariantId} not found in database`);
        unavailableVariants.push({
          id: itemVariantId,
          reason: "Sản phẩm không còn tồn tại trong hệ thống.",
        });
        continue;
      }

      if (currentVariant.deleted_at) {
        unavailableVariants.push({
          id: itemVariantId,
          reason: "Sản phẩm đã bị xóa khỏi hệ thống.",
        });
        continue;
      }

      // Check if product is deleted
      if (currentVariant.products.deleted_at) {
        unavailableVariants.push({
          id: itemVariantId,
          reason: `Sản phẩm "${currentVariant.products.name}" không còn kinh doanh.`,
        });
        continue;
      }

      // Check stock quantity
      if (currentVariant.stock_quantity < item.quantity) {
        unavailableVariants.push({
          id: itemVariantId,
          reason: `Chỉ còn ${currentVariant.stock_quantity} sản phẩm "${currentVariant.products.name}" trong kho.`,
        });
        continue;
      }

      // Check price changes only for product salePrice changes, skip if voucher applied
      if (!discountId) {
        const clientPrice = item.product?.salePrice ?? item.product?.price ?? 0;
        const currentPrice = currentVariant.sale_price ?? currentVariant.price;
        // Compare prices with tolerance for rounding differences
        const priceDiff = Math.abs(clientPrice - currentPrice);
        if (priceDiff > 0.01) {
          priceChangedVariants.push({
            id: itemVariantId,
            oldPrice: clientPrice,
            newPrice: currentPrice,
          });
        }
      }
    }

    // Handle validation failures
    if (unavailableVariants.length > 0) {
      console.error("Unavailable variants detected:", unavailableVariants);
      return {
        success: false,
        error: `Một số sản phẩm không khả dụng: ${unavailableVariants
          .map((v) => v.reason)
          .join("; ")}`,
      };
    }

    if (priceChangedVariants.length > 0) {
      console.error("Price changes detected:", priceChangedVariants);
      return {
        success: false,
        error:
          "Giá của một số sản phẩm đã thay đổi. Vui lòng làm mới trang để cập nhật giỏ hàng.",
      };
    }

    // Validate discount if provided
    if (discountId) {
      const { data: discount, error: discountError } = await supabase
        .from("discounts")
        .select("*")
        .eq("id", discountId)
        .single();

      if (discountError || !discount) {
        console.error("Discount validation error:", discountError);
        return {
          success: false,
          error: "Mã giảm giá không hợp lệ hoặc đã hết hạn.",
        };
      }

      // Check discount validity
      const now = new Date();
      if (
        !discount.is_active ||
        (discount.start_date && new Date(discount.start_date) > now) ||
        (discount.end_date && new Date(discount.end_date) < now) ||
        (discount.remaining_uses !== null && discount.remaining_uses <= 0) ||
        (discount.min_order_value && subtotal < discount.min_order_value)
      ) {
        return {
          success: false,
          error: "Mã giảm giá không hợp lệ hoặc không thỏa điều kiện áp dụng.",
        };
      }
    }

    // Fetch the Pending order status ID
    const { data: statusList, error: statusError } = await supabase
      .from("order_statuses")
      .select("id, name");

    if (statusError) {
      console.error("Error fetching order statuses:", statusError);
      return {
        success: false,
        error: "Lỗi hệ thống: Không thể xác định trạng thái đơn hàng.",
      };
    }

    // Look for Pending status using various possible names
    let pendingStatus = statusList.find((status) =>
      ["Pending", "Chờ xử lý", "Đang chờ", "Mới", "Chờ xác nhận"].includes(
        status.name
      )
    );

    if (!pendingStatus) {
      console.error("Could not find a valid initial order status", statusList);
      // If no matching status found, use the first available status as fallback
      if (statusList.length === 0) {
        return {
          success: false,
          error:
            "Lỗi hệ thống: Không có trạng thái đơn hàng nào được định nghĩa.",
        };
      }
      // Use the first status as fallback
      pendingStatus = statusList[0];
    }

    const orderStatusId = pendingStatus.id;
    console.log(
      "Using order status ID:",
      orderStatusId,
      "Name:",
      pendingStatus.name
    );

    // Start transaction - all operations will be atomic
    // The transaction block guarantees that either ALL operations succeed, or NONE do
    console.log("Starting transaction...");
    console.log(
      "Order details - subtotal:",
      subtotal,
      "discountAmount:",
      discountAmount,
      "total:",
      total
    );

    let orderId: number | undefined;

    // Calculate precise subtotal from actual product data
    // This ensures we use the most accurate prices directly from the database
    const preciseSubtotal = latestVariants.reduce((sum, variant) => {
      const cartItem = cartItems.find((item) => {
        const itemVariantId = item.variantId || (item as any).variant_id;
        return itemVariantId === variant.id;
      });

      if (!cartItem) return sum;

      // Use the same price calculation as in the cart
      const price = variant.sale_price ?? variant.price;
      return sum + price * cartItem.quantity;
    }, 0);

    console.log(
      "Calculated precise subtotal from DB product prices:",
      preciseSubtotal
    );
    console.log("Client-provided subtotal:", subtotal);
    console.log("Difference:", Math.abs(preciseSubtotal - subtotal));

    // Calculate numeric values for order details (using the precise subtotal)
    const numericSubtotal = Number(
      parseFloat(preciseSubtotal.toString()).toFixed(2)
    );
    // Discount will be calculated by the database trigger, we'll just pass a placeholder
    const numericDiscountAmount = Number(
      parseFloat((discountAmount || 0).toString()).toFixed(2)
    );
    const numericShippingFee = Number(
      parseFloat(shippingFee.toString()).toFixed(2)
    );
    // Let database calculate the final total based on its discount logic
    const calculatedTotal = Number(
      (numericSubtotal + numericShippingFee).toFixed(2)
    );

    // Log chi tiết các giá trị TRƯỚC KHI INSERT vào DATABASE
    console.log("=============================================");
    console.log("PRE-INSERT DATABASE VALUES (securedPlaceOrder):", {
      subtotal_amount: numericSubtotal,
      subtotal_type: typeof numericSubtotal,
      discount_amount: numericDiscountAmount,
      discount_type: typeof numericDiscountAmount,
      discount_id: discountId,
      discount_id_type: typeof discountId,
      shipping_fee: numericShippingFee,
      shipping_type: typeof numericShippingFee,
      calculated_total: calculatedTotal,
      total_type: typeof calculatedTotal,
    });

    // Double-check discount validity directly from database before insertion
    if (discountId) {
      const { data: discount, error: discountError } = await supabase
        .from("discounts")
        .select(
          `
          id, code, is_active, 
          start_date, end_date, 
          remaining_uses, min_order_value, 
          discount_percentage, max_discount_amount
        `
        )
        .eq("id", discountId)
        .single();

      if (!discountError && discount) {
        console.log("DISCOUNT DETAILS FROM DATABASE:", discount);
        console.log("CHECKING MIN ORDER VALUE:", {
          "Min required": discount.min_order_value,
          "Actual subtotal": numericSubtotal,
          "Is valid": discount.min_order_value <= numericSubtotal,
        });
      }
    }
    console.log("=============================================");

    // Step 1: Insert order record
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId || null,
        // Guest information (only if user is not authenticated)
        guest_name: !userId && guestInfo ? guestInfo.name : null,
        guest_email: !userId && guestInfo ? guestInfo.email : null,
        guest_phone: !userId && guestInfo ? guestInfo.phone : null,
        // Address information
        recipient_name: shippingAddress.recipient_name,
        recipient_phone: shippingAddress.recipient_phone, // Sửa từ phone_number sang recipient_phone
        province_city: shippingAddress.province_city,
        district: shippingAddress.district,
        ward: shippingAddress.ward,
        street_address: shippingAddress.street_address,
        // Order details
        delivery_notes: deliveryNotes || null,
        payment_method_id: paymentMethodId,
        payment_status: "Pending",
        order_status_id: orderStatusId,
        discount_id: discountId || null,
        subtotal_amount: numericSubtotal, // Dùng subtotal đã tính lại từ giá sản phẩm trong DB
        // KHÔNG cố gắng đặt discount_amount - để database trigger tính toán
        // Đặt giá trị 0 (mặc định) để database trigger có thể ghi đè
        discount_amount: 0,
        shipping_fee: numericShippingFee,
        // Không đặt total_amount - để database trigger tính toán
        // Đặt giá trị tạm thời để thỏa mãn ràng buộc NOT NULL
        total_amount: numericSubtotal + numericShippingFee,
      })
      .select("id, access_token")
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error(`Không thể tạo đơn hàng: ${orderError.message}`);
    }

    orderId = newOrder.id;
    console.log("Created order with ID:", orderId);

    // Step 2: Insert order items
    for (const item of cartItems) {
      const itemVariantId = item.variantId || (item as any).variant_id;
      // Fetch variant details from our already validated data
      const variant = latestVariants.find((v) => v.id === itemVariantId)!;

      // Sử dụng giá từ item.product thay vì từ database để đảm bảo nhất quán với giá đã hiển thị
      // cho người dùng tại frontend
      const unitPrice =
        item.product?.salePrice ??
        item.product?.price ??
        variant.sale_price ??
        variant.price;

      // Insert order item
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: orderId,
        variant_id: itemVariantId,
        product_name: variant.products.name,
        variant_volume_ml: variant.volume_ml,
        quantity: item.quantity,
        unit_price_at_order: unitPrice,
      });

      if (itemError) {
        console.error("Error creating order item:", itemError);
        throw new Error(
          `Không thể thêm sản phẩm vào đơn hàng: ${itemError.message}`
        );
      }
    }

    console.log("Created all order items");

    // Step 3: Create payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: orderId,
      payment_date: new Date().toISOString(),
      payment_method_id: paymentMethodId,
      amount: calculatedTotal,
      status: "Pending",
    });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      throw new Error(
        `Không thể tạo bản ghi thanh toán: ${paymentError.message}`
      );
    }

    console.log("Created payment record");

    // Step 4: Clear only selected items from user's cart if authenticated
    if (userId) {
      const { data: cart, error: cartError } = await supabase
        .from("shopping_carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!cartError && cart) {
        // Chỉ xóa những variant_id có trong danh sách sản phẩm đã chọn để thanh toán
        const variantIds = cartItems
          .map((item) =>
            typeof item.variantId === "number"
              ? item.variantId
              : (item as any).variant_id
          )
          .filter(Boolean);

        if (variantIds.length > 0) {
          await supabase
            .from("cart_items")
            .delete()
            .eq("cart_id", cart.id)
            .in("variant_id", variantIds);
          console.log("Cleared selected items from user's cart");
        }
      }
    }

    // Transaction complete successfully
    console.log("Order placement transaction completed successfully");

    // Revalidate relevant paths
    revalidatePath("/gio-hang");
    revalidatePath("/thanh-toan");
    revalidatePath(`/xac-nhan-don-hang?id=${orderId}`);
    revalidatePath("/tai-khoan/don-hang");
    revalidatePath("/api/cart");

    return {
      success: true,
      orderId,
      accessToken: !userId ? newOrder.access_token : undefined, // Only return access_token for guest users
    };
  } catch (error) {
    console.error("Fatal error during order placement:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.",
    };
  }
}
