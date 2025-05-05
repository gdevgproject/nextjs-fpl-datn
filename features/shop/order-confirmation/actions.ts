"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils/error-utils";

// Hủy đơn hàng
export async function cancelOrder(orderId: number) {
    const supabase = await getSupabaseServerClient();

    try {
        // Lấy thông tin session để kiểm tra user_id
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            return createErrorResponse("Bạn cần đăng nhập để thực hiện hành động này", "unauthorized");
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
            return createErrorResponse("Đơn hàng không tồn tại hoặc không thuộc về bạn", "not_found");
        }

        // Kiểm tra xem đơn hàng có thể hủy không (chỉ hủy được khi đang ở trạng thái Pending hoặc Processing)
        if (orderData.order_status_id !== 1 && orderData.order_status_id !== 2) {
            return createErrorResponse(
                `Không thể hủy đơn hàng ở trạng thái ${orderData.order_status?.name}. Chỉ có thể hủy đơn hàng ở trạng thái Pending hoặc Processing.`,
                "invalid_status"
            );
        }

        // Cập nhật trạng thái đơn hàng thành Cancelled (id = 5)
        const { error: updateError } = await supabase.from("orders").update({ order_status_id: 5 }).eq("id", orderId).eq("user_id", userId);

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

// Hủy đơn hàng bằng access token (dành cho khách vãng lai)
export async function cancelOrderByToken(token: string, reason: string) {
    try {
        if (!token) {
            return createErrorResponse("Token không hợp lệ", "invalid_token");
        }

        if (!reason || reason.trim() === "") {
            return createErrorResponse("Vui lòng cung cấp lý do hủy đơn hàng", "reason_required");
        }

        // Sử dụng service role client để truy cập đơn hàng qua token
        const serviceClient = await createServiceRoleClient();

        // Lấy thông tin đơn hàng từ token
        const { data: orderData, error: orderError } = await serviceClient
            .from("orders")
            .select("id, order_status_id, order_status:order_statuses(name), payment_status, payment_method_id, user_id")
            .eq("access_token", token)
            .single();

        if (orderError || !orderData) {
            return createErrorResponse("Không tìm thấy đơn hàng với mã tra cứu này", "not_found");
        }

        // Kiểm tra xem đơn hàng có thể hủy hay không
        // Chỉ hủy được khi đang ở trạng thái "Chờ xác nhận" hoặc "Đã xác nhận"
        if (orderData.order_status_id !== 1 && orderData.order_status_id !== 2) {
            return createErrorResponse(
                `Không thể hủy đơn hàng ở trạng thái ${orderData.order_status?.name}. Chỉ có thể hủy đơn hàng ở trạng thái Chờ xác nhận hoặc Đã xác nhận.`,
                "invalid_status"
            );
        }

        // Kiểm tra nếu đã thanh toán online
        const isCOD = orderData.payment_method_id === 1; // ID 1 là COD theo seed data
        if (orderData.payment_status === "Paid" && !isCOD) {
            return createErrorResponse("Đơn hàng đã thanh toán online không thể hủy trực tiếp. Vui lòng liên hệ hỗ trợ.", "already_paid");
        }

        // Kiểm tra xem người dùng hiện tại có phải là user_id của đơn hàng không
        // Nếu là, sử dụng cancelOrderByUser thay vì gọi trực tiếp vào đây
        const supabase = await getSupabaseServerClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.id && orderData.user_id === session.user.id) {
            // Đây là người dùng đã đăng nhập đang cố gắng hủy đơn hàng của họ thông qua token
            // Chuyển sang cancelOrderByUser để xử lý đúng
            return await cancelOrderByUser(orderData.id, reason);
        }

        // Đây mới thực sự là khách vãng lai (không đăng nhập hoặc đăng nhập nhưng không phải chủ đơn hàng)
        const { error: updateError } = await serviceClient
            .from("orders")
            .update({
                order_status_id: 7, // "Đã hủy"
                cancellation_reason: reason,
                cancelled_by: "user", // Mặc dù là guest nhưng vẫn gán 'user' để phân biệt với 'admin'
                cancelled_by_user_id: null, // Không có user_id vì là khách vãng lai
            })
            .eq("id", orderData.id);

        if (updateError) {
            return createErrorResponse(updateError.message);
        }

        // Ghi log hoạt động - KHÔNG sử dụng trigger tự động của database
        // Mà ghi log rõ ràng từ server action
        try {
            await serviceClient.from("admin_activity_log").insert({
                admin_user_id: null,
                activity_type: "ORDER_CANCELLED_BY_GUEST",
                description: `Đơn hàng #${orderData.id} đã bị hủy bởi khách vãng lai`,
                entity_type: "order",
                entity_id: orderData.id.toString(),
                details: { reason, token },
            });
        } catch (logError) {
            console.error("Error logging activity:", logError);
            // Không trả về lỗi vì việc ghi log không quan trọng bằng việc hủy đơn hàng
        }

        revalidatePath(`/tra-cuu-don-hang?token=${token}`);

        return createSuccessResponse({
            message: "Đơn hàng đã được hủy thành công",
            orderId: orderData.id,
        });
    } catch (error) {
        return createErrorResponse(error);
    }
}

// Hủy đơn hàng cho người dùng đã đăng nhập
export async function cancelOrderByUser(orderId: number, reason: string) {
    const supabase = await getSupabaseServerClient();

    try {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            return createErrorResponse("Bạn cần đăng nhập để thực hiện hành động này", "unauthorized");
        }

        if (!reason || reason.trim() === "") {
            return createErrorResponse("Vui lòng cung cấp lý do hủy đơn hàng", "reason_required");
        }

        const userId = session.user.id;

        // Kiểm tra xem đơn hàng có thuộc về người dùng không
        const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .select("id, order_status_id, order_status:order_statuses(name), payment_status, payment_method_id")
            .eq("id", orderId)
            .eq("user_id", userId)
            .single();

        if (orderError || !orderData) {
            return createErrorResponse("Đơn hàng không tồn tại hoặc không thuộc về bạn", "not_found");
        }

        // Kiểm tra xem đơn hàng có thể hủy không - Chỉ có thể hủy đơn ở trạng thái "Chờ xác nhận" hoặc "Đã xác nhận"
        // Không thể hủy đơn hàng ở trạng thái: Đang giao, Đã giao, Đã hoàn thành, Đã hủy
        const nonCancellableStatuses = ["Đang giao", "Đã giao", "Đã hoàn thành", "Đã hủy"];

        if (nonCancellableStatuses.includes(orderData.order_status?.name)) {
            return createErrorResponse(
                `Không thể hủy đơn hàng ở trạng thái ${orderData.order_status?.name}.`,
                "invalid_status"
            );
        }

        // Kiểm tra nếu đã thanh toán online
        const isCOD = orderData.payment_method_id === 1; // ID 1 là COD theo seed data
        if (orderData.payment_status === "Paid" && !isCOD) {
            return createErrorResponse("Đơn hàng đã thanh toán online không thể hủy trực tiếp. Vui lòng liên hệ hỗ trợ.", "already_paid");
        }

        // Sử dụng service role client để đảm bảo quyền ghi log
        const serviceClient = await createServiceRoleClient();

        // Cập nhật trạng thái đơn hàng thành "Đã hủy" (id = 7 theo seed data)
        // Không sử dụng trường không tồn tại trong schema
        const { error: updateError } = await serviceClient
            .from("orders")
            .update({
                order_status_id: 7,
                cancellation_reason: reason,
                cancelled_by: "user",
                cancelled_by_user_id: userId,
            })
            .eq("id", orderId)
            .eq("user_id", userId);

        if (updateError) {
            return createErrorResponse(updateError.message);
        }

        // Ghi log hoạt động bằng service client để đảm bảo quyền
        try {
            await serviceClient.from("admin_activity_log").insert({
                admin_user_id: null,
                activity_type: "ORDER_CANCELLED_BY_AUTHENTICATED_USER",
                description: `Đơn hàng #${orderId} đã bị hủy bởi người dùng đã đăng nhập`,
                entity_type: "order",
                entity_id: orderId.toString(),
                details: {
                    cancelled_by_user_id: userId,
                    reason,
                    is_authenticated: true,
                },
            });
        } catch (logError) {
            console.error("Error logging activity:", logError);
            // Không trả về lỗi vì việc ghi log không quan trọng bằng việc hủy đơn hàng
        }

        revalidatePath(`/tai-khoan/don-hang/${orderId}`);
        revalidatePath("/tai-khoan/don-hang");
        revalidatePath(`/tra-cuu-don-hang?orderId=${orderId}`);

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
            const variantIds = items.map((item: any) => item.variant_id).filter(Boolean);
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

            type ProductImage = { image_url: string; is_main: boolean };
            type Product = {
                id: number;
                name: string;
                slug: string;
                deleted_at: string | null;
                images?: ProductImage[];
            };
            type Variant = {
                id: number;
                price: number;
                sale_price: number | null;
                deleted_at: string | null;
                product?: Product;
            };

            const variantMap = new Map<number, Variant>();
            (variants || []).forEach((v: Variant) => variantMap.set(v.id, v));

            return items.map((item: any) => {
                const variant = variantMap.get(item.variant_id);
                // Nếu còn bản ghi variant và product (dù đã xóa mềm), luôn ưu tiên hiển thị thông tin hiện tại
                if (variant && variant.product) {
                    const productImages = Array.isArray(variant.product.images) ? variant.product.images : [];
                    const mainImage = productImages.find((img: ProductImage) => img.is_main) || productImages[0];
                    const originalPrice = Number(variant.price);
                    const salePrice = variant.sale_price !== null && variant.sale_price !== undefined ? Number(variant.sale_price) : null;
                    const finalPrice = salePrice !== null && salePrice < originalPrice ? salePrice : originalPrice;
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
          status_id:order_status_id,
          discount_id
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
                const { data: pm } = await serviceClient.from("payment_methods").select("name").eq("id", order.payment_method_id).single();
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
                totalDiscountProduct += (item.original_price - item.price) * item.quantity;
            });

            // Lấy thông tin mã giảm giá nếu có
            let discount_code = null;
            if (order.discount_id) {
                const { data: discountData } = await serviceClient.from("discounts").select("code").eq("id", order.discount_id).single();
                if (discountData) {
                    discount_code = discountData.code;
                }
            }

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
                    discount_code: discount_code,
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
          status_id:order_status_id,
          discount_id
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
                const { data: pm } = await supabase.from("payment_methods").select("name").eq("id", order.payment_method_id).single();
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
                totalDiscountProduct += (item.original_price - item.price) * item.quantity;
            });

            // Lấy thông tin mã giảm giá nếu có
            let discount_code = null;
            if (order.discount_id) {
                const { data: discountData } = await supabase from("discounts").select("code").eq("id", order.discount_id).single();
                if (discountData) {
                    discount_code = discountData.code;
                }
            }

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
                    discount_code: discount_code,
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

// Xác nhận đã nhận hàng (chuyển sang trạng thái "Đã hoàn thành")
export async function confirmOrderReceived(orderId: number) {
    const supabase = await getSupabaseServerClient();

    try {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            return createErrorResponse("Bạn cần đăng nhập để thực hiện hành động này", "unauthorized");
        }

        const userId = session.user.id;

        // Lấy service client để có quyền đầy đủ
        const serviceClient = await createServiceRoleClient();

        // Kiểm tra xem đơn hàng có thuộc về người dùng không
        const { data: orderData, error: orderError } = await serviceClient
            .from("orders")
            .select("id, order_status_id, order_status:order_statuses(name), payment_status, payment_method_id")
            .eq("id", orderId)
            .eq("user_id", userId)
            .single();

        if (orderError || !orderData) {
            return createErrorResponse("Đơn hàng không tồn tại hoặc không thuộc về bạn", "not_found");
        }

        // Chỉ có thể xác nhận khi đơn hàng ở trạng thái "Đã giao"
        if (orderData.order_status?.name !== "Đã giao") {
            return createErrorResponse(`Chỉ có thể xác nhận đã nhận hàng khi trạng thái đơn hàng là "Đã giao".`, "invalid_status");
        }

        // Lấy ID trạng thái "Đã hoàn thành"
        const { data: completedStatus, error: statusError } = await serviceClient.from("order_statuses").select("id").eq("name", "Đã hoàn thành").single();

        if (statusError || !completedStatus) {
            return createErrorResponse("Không thể xác định trạng thái đơn hàng", "status_error");
        }

        // Cập nhật trạng thái đơn hàng thành "Đã hoàn thành"
        const { error: updateError } = await serviceClient
            .from("orders")
            .update({
                order_status_id: completedStatus.id,
                completed_at: new Date().toISOString(), // Thêm thời gian hoàn thành
            })
            .eq("id", orderId)
            .eq("user_id", userId);

        if (updateError) {
            return createErrorResponse(updateError.message);
        }

        // Ghi log hoạt động
        try {
            await serviceClient.from("admin_activity_log").insert({
                admin_user_id: null,
                activity_type: "ORDER_COMPLETED_BY_USER",
                description: `Đơn hàng #${orderId} đã được xác nhận nhận hàng bởi người dùng`,
                entity_type: "order",
                entity_id: orderId.toString(),
                details: {
                    confirmed_by_user_id: userId,
                    previous_status: orderData.order_status?.name,
                },
            });
        } catch (logError) {
            console.error("Error logging activity:", logError);
            // Không trả về lỗi vì việc ghi log không quan trọng bằng việc xác nhận đơn hàng
        }

        // Revalidate các đường dẫn liên quan
        revalidatePath(`/tai-khoan/don-hang/${orderId}`);
        revalidatePath("/tai-khoan/don-hang");
        revalidatePath(`/tra-cuu-don-hang?orderId=${orderId}`);

        return createSuccessResponse({
            message: "Cảm ơn bạn đã xác nhận đã nhận hàng",
            orderId: orderId,
        });
    } catch (error) {
        return createErrorResponse(error);
    }
}

// Xác nhận đã nhận hàng bằng access token (dành cho khách vãng lai)
export async function confirmOrderReceivedByToken(token: string) {
    try {
        if (!token) {
            return createErrorResponse("Token không hợp lệ", "invalid_token");
        }

        // Sử dụng service role client để truy cập đơn hàng qua token
        const serviceClient = await createServiceRoleClient();

        // Lấy thông tin đơn hàng từ token
        const { data: orderData, error: orderError } = await serviceClient
            .from("orders")
            .select("id, order_status_id, order_status:order_statuses(name), payment_status, payment_method_id, user_id")
            .eq("access_token", token)
            .single();

        if (orderError || !orderData) {
            return createErrorResponse("Không tìm thấy đơn hàng với mã tra cứu này", "not_found");
        }

        // Chỉ có thể xác nhận khi đơn hàng ở trạng thái "Đã giao"
        if (orderData.order_status?.name !== "Đã giao") {
            return createErrorResponse(`Chỉ có thể xác nhận đã nhận hàng khi trạng thái đơn hàng là "Đã giao".`, "invalid_status");
        }

        // Kiểm tra xem người dùng hiện tại có phải là user_id của đơn hàng không
        const supabase = await getSupabaseServerClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.id && orderData.user_id === session.user.id) {
            // Đây là người dùng đã đăng nhập đang cố gắng xác nhận đơn hàng của họ thông qua token
            // Chuyển sang confirmOrderReceived để xử lý đúng
            return await confirmOrderReceived(orderData.id);
        }

        // Lấy ID trạng thái "Đã hoàn thành"
        const { data: completedStatus, error: statusError } = await serviceClient.from("order_statuses").select("id").eq("name", "Đã hoàn thành").single();

        if (statusError || !completedStatus) {
            return createErrorResponse("Không thể xác định trạng thái đơn hàng", "status_error");
        }

        // Cập nhật trạng thái đơn hàng thành "Đã hoàn thành"
        const { error: updateError } = await serviceClient
            .from("orders")
            .update({
                order_status_id: completedStatus.id,
                completed_at: new Date().toISOString(), // Thêm thời gian hoàn thành
            })
            .eq("id", orderData.id);

        if (updateError) {
            return createErrorResponse(updateError.message);
        }

        // Ghi log hoạt động
        try {
            await serviceClient.from("admin_activity_log").insert({
                admin_user_id: null,
                activity_type: "ORDER_COMPLETED_BY_GUEST",
                description: `Đơn hàng #${orderData.id} đã được xác nhận nhận hàng bởi khách vãng lai`,
                entity_type: "order",
                entity_id: orderData.id.toString(),
                details: { token },
            });
        } catch (logError) {
            console.error("Error logging activity:", logError);
        }

        revalidatePath(`/tra-cuu-don-hang?token=${token}`);

        return createSuccessResponse({
            message: "Cảm ơn bạn đã xác nhận đã nhận hàng",
            orderId: orderData.id,
        });
    } catch (error) {
        return createErrorResponse(error);
    }
}
