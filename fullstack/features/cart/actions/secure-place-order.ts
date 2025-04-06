"use server";

import { revalidatePath } from "next/cache";
import {
  createServiceRoleClient,
  getSupabaseServerClient,
} from "@/lib/supabase/server";
import type { Address } from "@/features/account/types";
import type { CartItem, GuestCheckoutInfo } from "../types";

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
  const supabase = createServiceRoleClient();

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
    const variantIds = cartItems.map((item) => item.variant_id);

    // Fetch the latest data for all variants being ordered
    const { data: latestVariants, error: variantsError } = await supabase
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

    if (variantsError) {
      console.error("Error fetching latest variant data:", variantsError);
      return {
        success: false,
        error: "Không thể xác minh thông tin sản phẩm. Vui lòng thử lại sau.",
      };
    }

    // Validate the variants
    const unavailableVariants: { id: number; reason: string }[] = [];
    const priceChangedVariants: {
      id: number;
      oldPrice: number;
      newPrice: number;
    }[] = [];

    for (const item of cartItems) {
      const currentVariant = latestVariants.find(
        (v) => v.id === item.variant_id
      );

      // Check if variant exists and is not deleted
      if (!currentVariant || currentVariant.deleted_at) {
        unavailableVariants.push({
          id: item.variant_id,
          reason: "Sản phẩm không còn tồn tại trong hệ thống.",
        });
        continue;
      }

      // Check if product is deleted
      if (currentVariant.products.deleted_at) {
        unavailableVariants.push({
          id: item.variant_id,
          reason: `Sản phẩm "${currentVariant.products.name}" không còn kinh doanh.`,
        });
        continue;
      }

      // Check stock quantity
      if (currentVariant.stock_quantity < item.quantity) {
        unavailableVariants.push({
          id: item.variant_id,
          reason: `Chỉ còn ${currentVariant.stock_quantity} sản phẩm "${currentVariant.products.name}" trong kho.`,
        });
        continue;
      }

      // Check price changes (using the effective price - sale price if available, otherwise regular price)
      const clientPrice = item.product?.sale_price || item.product?.price;
      const currentPrice = currentVariant.sale_price || currentVariant.price;

      if (clientPrice !== currentPrice) {
        priceChangedVariants.push({
          id: item.variant_id,
          oldPrice: clientPrice,
          newPrice: currentPrice,
        });
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

    let orderId: number | undefined;

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
        recipient_phone: shippingAddress.phone,
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
        subtotal_amount: subtotal,
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        total_amount: total,
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
      // Fetch variant details from our already validated data
      const variant = latestVariants.find((v) => v.id === item.variant_id)!;

      // Calculate unit price (use sale_price if available)
      const unitPrice =
        variant.sale_price !== null ? variant.sale_price : variant.price;

      // Insert order item
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: orderId,
        variant_id: item.variant_id,
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
      amount: total,
      status: "Pending",
    });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      throw new Error(
        `Không thể tạo bản ghi thanh toán: ${paymentError.message}`
      );
    }

    console.log("Created payment record");

    // Step 4: Clear user's cart if authenticated
    if (userId) {
      const { data: cart, error: cartError } = await supabase
        .from("shopping_carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!cartError && cart) {
        await supabase.from("cart_items").delete().eq("cart_id", cart.id);

        console.log("Cleared user's cart");
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
