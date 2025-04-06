"use server";

import { revalidatePath } from "next/cache";
import {
  getSupabaseServerClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/error-utils";

// Hủy đơn hàng
export async function cancelOrder(orderId: number) {
  const supabase = await getSupabaseServerClient();

  try {
    // Lấy thông tin session để kiểm tra user_id
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse(
        "Bạn cần đăng nhập để thực hiện hành động này",
        "unauthorized"
      );
    }

    const userId = session.user.id;

    // Kiểm tra xem đơn hàng có thuộc về người dùng không
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id, order_status_id, order_status:order_statuses(name)")
      .eq("id", orderId)
      .eq("user_id", userId)
      .single();

    if (orderError || !orderData) {
      return createErrorResponse(
        "Đơn hàng không tồn tại hoặc không thuộc về bạn",
        "not_found"
      );
    }

    // Kiểm tra xem đơn hàng có thể hủy không (chỉ hủy được khi đang ở trạng thái Pending hoặc Processing)
    if (orderData.order_status_id !== 1 && orderData.order_status_id !== 2) {
      return createErrorResponse(
        `Không thể hủy đơn hàng ở trạng thái ${orderData.order_status?.name}. Chỉ có thể hủy đơn hàng ở trạng thái Pending hoặc Processing.`,
        "invalid_status"
      );
    }

    // Cập nhật trạng thái đơn hàng thành Cancelled (id = 5)
    const { error: updateError } = await supabase
      .from("orders")
      .update({ order_status_id: 5 })
      .eq("id", orderId)
      .eq("user_id", userId);

    if (updateError) {
      return createErrorResponse(updateError.message);
    }

    // Ghi log hoạt động (nếu cần)
    try {
      await supabase.from("admin_activity_log").insert({
        admin_user_id: null, // Null vì đây là hành động của người dùng
        activity_type: "ORDER_CANCELLED_BY_USER",
        description: `Đơn hàng #${orderId} đã bị hủy bởi người dùng`,
        entity_type: "order",
        entity_id: orderId.toString(),
        details: { cancelled_by_user_id: userId },
      });
    } catch (logError) {
      console.error("Error logging activity:", logError);
      // Không trả về lỗi vì việc ghi log không quan trọng bằng việc hủy đơn hàng
    }

    revalidatePath(`/tai-khoan/don-hang/${orderId}`);
    revalidatePath("/tai-khoan/don-hang");

    return createSuccessResponse({
      message: "Đơn hàng đã được hủy thành công",
      orderId: orderId,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * Get order details by ID or access token
 * This is a server action that supports both authenticated users and guest orders
 * Security features:
 * - For authenticated users: Only allows viewing own orders
 * - For guest users: Requires valid access token
 */
export async function getOrderDetails(orderIdOrToken: string, isToken = false) {
  try {
    // Get the server Supabase client
    const supabase = await getSupabaseServerClient();
    let order;

    if (isToken) {
      // For guest orders with access token, use service role client to bypass RLS
      const serviceClient = await createServiceRoleClient();

      // Use the secure get_order_details_by_token RPC function
      const { data, error: tokenError } = await serviceClient.rpc(
        "get_order_details_by_token",
        { p_token: orderIdOrToken }
      );

      if (tokenError) throw tokenError;
      order = data.order;

      // Get order items separately
      const { data: items, error: itemsError } = await serviceClient
        .from("order_items")
        .select(
          `
          id,
          product_name,
          variant_volume_ml,
          quantity,
          unit_price_at_order,
          variant:product_variants(
            id,
            product:products(
              id,
              images:product_images(image_url, is_main)
            )
          )
        `
        )
        .eq("order_id", order.id);

      if (itemsError) throw itemsError;
      order.items = items;
    } else {
      // For authenticated users, check session and ensure they can only view their own orders
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // If no session found, user is not authenticated
      if (!userId) {
        return {
          success: false,
          error: "Bạn cần đăng nhập để xem đơn hàng",
          data: null,
        };
      }

      // Get order with security check (only their own orders)
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          `
          id,
          created_at,
          recipient_name,
          recipient_phone,
          guest_name,
          guest_email,
          guest_phone,
          province_city,
          district,
          ward,
          street_address,
          delivery_notes,
          payment_status,
          subtotal_amount,
          discount_amount,
          shipping_fee,
          total_amount,
          order_status:order_statuses(id, name),
          payment_method:payment_methods(id, name, description)
        `
        )
        .eq("id", orderIdOrToken)
        .eq("user_id", userId) // Critical security check: only allow viewing own orders
        .single();

      if (orderError) {
        return {
          success: false,
          error: "Đơn hàng không tồn tại hoặc không thuộc về bạn",
          data: null,
        };
      }

      order = orderData;

      // Get order items
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select(
          `
          id,
          product_name,
          variant_volume_ml,
          quantity,
          unit_price_at_order,
          variant:product_variants(
            id,
            product:products(
              id,
              images:product_images(image_url, is_main)
            )
          )
        `
        )
        .eq("order_id", orderIdOrToken);

      if (itemsError) throw itemsError;
      order.items = items;
    }

    // Format the items to include product image
    const formattedItems = order.items.map((item) => {
      // Find main image or use first available
      const productImages = item.variant?.product?.images || [];
      const mainImage =
        productImages.find((img) => img.is_main) || productImages[0];

      return {
        id: item.id,
        product_name: item.product_name,
        variant_attributes: `${item.variant_volume_ml}ml`,
        quantity: item.quantity,
        price: item.unit_price_at_order,
        product_image: mainImage?.image_url || null,
      };
    });

    // Format shipping address
    const shippingAddress = `${order.recipient_name}, ${order.recipient_phone}, ${order.street_address}, ${order.ward}, ${order.district}, ${order.province_city}`;

    // Format customer information
    const customerName = order.guest_name || order.recipient_name;
    const customerEmail = order.guest_email || "";
    const customerPhone = order.guest_phone || order.recipient_phone;

    return {
      success: true,
      data: {
        id: order.id,
        order_number: order.id,
        created_at: order.created_at,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        delivery_notes: order.delivery_notes,
        payment_method: order.payment_method?.name || "Không xác định",
        payment_status: order.payment_status,
        shipping_method: "Giao hàng tiêu chuẩn",
        subtotal: order.subtotal_amount,
        discount: order.discount_amount,
        shipping_fee: order.shipping_fee,
        total: order.total_amount,
        status: order.order_status?.name || "Đang xử lý",
        items: formattedItems,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching order details:", error);
    return {
      success: false,
      data: null,
      error: "Không thể tải thông tin đơn hàng",
    };
  }
}
