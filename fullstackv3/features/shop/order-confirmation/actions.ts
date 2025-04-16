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
    const supabase = await getSupabaseServerClient();
    let order: any;
    let access_token: string | null = null;

    // Helper to get product info for each item
    async function enrichOrderItems(serviceClient: any, items: any[]) {
      const variantIds = items.map((item) => item.variant_id).filter(Boolean);
      if (!variantIds.length) return items;

      // Lấy tất cả variant (kể cả đã xóa mềm), nếu không còn bản ghi thì fallback snapshot
      const { data: variants } = await serviceClient
        .from("product_variants")
        .select(
          `
            id,
            price,
            sale_price,
            deleted_at,
            product:products(
              id,
              name,
              slug,
              deleted_at,
              images:product_images(image_url, is_main)
            )
          `
        )
        .in("id", variantIds);

      const variantMap = new Map();
      (variants || []).forEach((v) => variantMap.set(v.id, v));

      return items.map((item) => {
        const variant = variantMap.get(item.variant_id);
        // Nếu còn bản ghi variant và product (dù đã xóa mềm), luôn ưu tiên hiển thị thông tin hiện tại
        if (variant && variant.product) {
          const productImages = variant.product.images || [];
          const mainImage =
            productImages.find((img) => img.is_main) || productImages[0];
          const originalPrice = Number(variant.price);
          const salePrice =
            variant.sale_price !== null && variant.sale_price !== undefined
              ? Number(variant.sale_price)
              : null;
          const finalPrice =
            salePrice !== null && salePrice < originalPrice
              ? salePrice
              : originalPrice;
          return {
            id: item.id,
            product_name: variant.product.name,
            variant_attributes: `${item.variant_volume_ml}ml`,
            quantity: item.quantity,
            price: finalPrice,
            original_price: originalPrice,
            sale_price: salePrice,
            product_image: mainImage?.image_url || null,
            is_deleted: !!(variant.deleted_at || variant.product.deleted_at),
          };
        }
        // Nếu không còn bản ghi (bị xóa hoàn toàn), fallback về snapshot
        return {
          id: item.id,
          product_name: item.product_name,
          variant_attributes: `${item.variant_volume_ml}ml`,
          quantity: item.quantity,
          price: Number(item.unit_price_at_order),
          original_price: Number(item.unit_price_at_order),
          sale_price: null,
          product_image: null,
          is_deleted: true,
        };
      });
    }

    if (isToken) {
      const serviceClient = await createServiceRoleClient();
      const { data: orderData, error: orderError } = await serviceClient
        .from("orders")
        .select(
          `
          id,
          access_token,
          created_at,
          order_date,
          guest_name,
          guest_email,
          guest_phone,
          recipient_name,
          recipient_phone,
          province_city,
          district,
          ward,
          street_address,
          delivery_notes,
          payment_status,
          payment_method_id,
          subtotal_amount,
          discount_amount,
          shipping_fee,
          total_amount,
          order_status:order_statuses(name),
          status_id:order_status_id
        `
        )
        .eq("access_token", orderIdOrToken)
        .single();

      if (orderError || !orderData) {
        return {
          success: false,
          error: "Không tìm thấy đơn hàng với mã tra cứu này",
          data: null,
        };
      }
      order = orderData;
      access_token = order.access_token || orderIdOrToken;

      let payment_method_name = "Không xác định";
      if (order.payment_method_id) {
        const { data: pm } = await serviceClient
          .from("payment_methods")
          .select("name")
          .eq("id", order.payment_method_id)
          .single();
        if (pm?.name) payment_method_name = pm.name;
      }

      const { data: items, error: itemsError } = await serviceClient
        .from("order_items")
        .select(
          `
          id,
          variant_id,
          product_name,
          variant_volume_ml,
          quantity,
          unit_price_at_order
        `
        )
        .eq("order_id", order.id);

      if (itemsError) throw itemsError;

      const enrichedItems = await enrichOrderItems(serviceClient, items);

      let totalOriginal = 0;
      let totalDiscountProduct = 0;
      let totalFinal = 0;
      enrichedItems.forEach((item) => {
        totalOriginal += item.original_price * item.quantity;
        totalFinal += item.price * item.quantity;
        totalDiscountProduct +=
          (item.original_price - item.price) * item.quantity;
      });

      const shippingAddress = `${order.recipient_name}, ${order.recipient_phone}, ${order.street_address}, ${order.ward}, ${order.district}, ${order.province_city}`;

      const customerName = order.guest_name || order.recipient_name;
      const customerEmail = order.guest_email || "";
      const customerPhone = order.guest_phone || order.recipient_phone;

      return {
        success: true,
        data: {
          id: order.id,
          order_number: order.id,
          created_at: order.created_at || order.order_date,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_address: shippingAddress,
          delivery_notes: order.delivery_notes,
          payment_method: payment_method_name,
          payment_status: order.payment_status,
          shipping_method: "Giao hàng tiêu chuẩn",
          subtotal: totalOriginal,
          discount_product: totalDiscountProduct,
          discount: order.discount_amount,
          shipping_fee: order.shipping_fee,
          total: order.total_amount,
          total_final: order.total_amount,
          status: order.order_status?.name || "Đang xử lý",
          items: enrichedItems,
          access_token: access_token,
        },
        error: null,
      };
    } else {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        return {
          success: false,
          error: "Bạn cần đăng nhập để xem đơn hàng",
          data: null,
        };
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          `
          id,
          access_token,
          created_at,
          order_date,
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
          payment_method_id,
          subtotal_amount,
          discount_amount,
          shipping_fee,
          total_amount,
          order_status:order_statuses(name),
          status_id:order_status_id
        `
        )
        .eq("id", orderIdOrToken)
        .eq("user_id", userId)
        .single();

      if (orderError || !orderData) {
        return {
          success: false,
          error: "Đơn hàng không tồn tại hoặc không thuộc về bạn",
          data: null,
        };
      }
      order = orderData;
      access_token = order.access_token || null;

      let payment_method_name = "Không xác định";
      if (order.payment_method_id) {
        const { data: pm } = await supabase
          .from("payment_methods")
          .select("name")
          .eq("id", order.payment_method_id)
          .single();
        if (pm?.name) payment_method_name = pm.name;
      }

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select(
          `
          id,
          variant_id,
          product_name,
          variant_volume_ml,
          quantity,
          unit_price_at_order
        `
        )
        .eq("order_id", orderIdOrToken);

      if (itemsError) throw itemsError;

      const enrichedItems = await enrichOrderItems(supabase, items);

      let totalOriginal = 0;
      let totalDiscountProduct = 0;
      let totalFinal = 0;
      enrichedItems.forEach((item) => {
        totalOriginal += item.original_price * item.quantity;
        totalFinal += item.price * item.quantity;
        totalDiscountProduct +=
          (item.original_price - item.price) * item.quantity;
      });

      const shippingAddress = `${order.recipient_name}, ${order.recipient_phone}, ${order.street_address}, ${order.ward}, ${order.district}, ${order.province_city}`;

      const customerName = order.guest_name || order.recipient_name;
      const customerEmail = order.guest_email || "";
      const customerPhone = order.guest_phone || order.recipient_phone;

      return {
        success: true,
        data: {
          id: order.id,
          order_number: order.id,
          created_at: order.created_at || order.order_date,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_address: shippingAddress,
          delivery_notes: order.delivery_notes,
          payment_method: payment_method_name,
          payment_status: order.payment_status,
          shipping_method: "Giao hàng tiêu chuẩn",
          subtotal: totalOriginal,
          discount_product: totalDiscountProduct,
          discount: order.discount_amount,
          shipping_fee: order.shipping_fee,
          total: order.total_amount,
          total_final: order.total_amount,
          status: order.order_status?.name || "Đang xử lý",
          items: enrichedItems,
          access_token: access_token,
        },
        error: null,
      };
    }
  } catch (error) {
    console.error("Error fetching order details:", error);
    return {
      success: false,
      data: null,
      error: "Không thể tải thông tin đơn hàng",
    };
  }
}
