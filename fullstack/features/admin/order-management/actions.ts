"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/error-utils";
import { getUserRoleFromMetadata } from "@/lib/utils/auth-utils";
import type {
  OrderFilter,
  PaginatedOrders,
  OrderDetails,
  OrderStats,
} from "./types";
import type { PaymentStatus } from "@/features/orders/types";

/**
 * Get a paginated list of orders with filtering and sorting
 */
export async function getOrdersList(
  filter: OrderFilter
): Promise<{ data?: PaginatedOrders; error?: string }> {
  try {
    // Verify user is staff or admin
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse("Unauthorized", "unauthorized");
    }

    const role = getUserRoleFromMetadata(session.user);
    if (role !== "admin" && role !== "staff") {
      return createErrorResponse("Forbidden", "forbidden");
    }

    // Default values
    const {
      page = 1,
      pageSize = 10,
      orderStatusId,
      paymentStatus,
      startDate,
      endDate,
      search,
      sortBy = "orderDate",
      sortOrder = "desc",
    } = filter;

    // Use service client to avoid RLS
    const serviceClient = await createServiceRoleClient();

    // Start building query
    let query = serviceClient.from("orders").select(
      `
        id,
        recipient_name,
        guest_name,
        user_id,
        order_date,
        payment_status,
        total_amount,
        tracking_number,
        order_status:order_statuses(id, name),
        order_items:order_items(id)
      `,
      { count: "exact" }
    );

    // Apply filters
    if (orderStatusId) {
      query = query.eq("order_status_id", orderStatusId);
    }

    if (paymentStatus) {
      query = query.eq("payment_status", paymentStatus);
    }

    if (startDate) {
      query = query.gte("order_date", startDate);
    }

    if (endDate) {
      query = query.lte("order_date", `${endDate}T23:59:59`);
    }

    if (search) {
      query = query.or(
        `recipient_name.ilike.%${search}%,recipient_phone.ilike.%${search}%,guest_name.ilike.%${search}%,guest_email.ilike.%${search}%,id.eq.${
          !isNaN(parseInt(search)) ? parseInt(search) : 0
        }`
      );
    }

    // Get total count first
    const { count, error: countError } = await query;

    if (countError) {
      console.error("Error getting order count:", countError);
      return createErrorResponse(
        "Không thể lấy danh sách đơn hàng",
        "database_error"
      );
    }

    // Apply pagination and sorting
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    // Handle different sort fields
    const sortFieldMap: Record<string, string> = {
      orderDate: "order_date",
      totalAmount: "total_amount",
      customerName: "recipient_name",
      id: "id",
    };

    const dbSortField = sortFieldMap[sortBy] || "order_date";
    query = query.order(dbSortField, { ascending: sortOrder === "asc" });

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
      return createErrorResponse(
        "Không thể lấy danh sách đơn hàng",
        "database_error"
      );
    }

    // Format results
    const orders = data.map((order) => ({
      id: order.id,
      customerName: order.guest_name || order.recipient_name,
      orderDate: order.order_date,
      totalAmount: order.total_amount,
      orderStatusId: order.order_status?.id || 0,
      orderStatusName: order.order_status?.name || "Unknown",
      paymentStatus: order.payment_status as PaymentStatus,
      trackingNumber: order.tracking_number || null,
      itemCount: order.order_items?.length || 0,
    }));

    return createSuccessResponse({
      orders,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error("Error in getOrdersList:", error);
    return createErrorResponse(
      "Không thể lấy danh sách đơn hàng",
      "server_error"
    );
  }
}

/**
 * Get a single order with detailed information
 */
export async function getOrderDetails(
  orderId: number
): Promise<{ data?: OrderDetails; error?: string }> {
  try {
    // Verify user is staff or admin
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse("Unauthorized", "unauthorized");
    }

    const role = getUserRoleFromMetadata(session.user);
    if (role !== "admin" && role !== "staff") {
      return createErrorResponse("Forbidden", "forbidden");
    }

    // Use service client to avoid RLS
    const serviceClient = await createServiceRoleClient();

    // Get order with details
    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .select(
        `
        id,
        created_at,
        updated_at,
        user_id,
        guest_name,
        guest_email,
        guest_phone,
        recipient_name,
        recipient_phone,
        province_city,
        district,
        ward,
        street_address,
        order_date,
        delivery_notes,
        payment_method_id,
        payment_status,
        order_status_id,
        tracking_number,
        subtotal_amount,
        discount_amount,
        shipping_fee,
        total_amount,
        payment_method:payment_methods(id, name),
        order_status:order_statuses(id, name)
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error("Error getting order:", orderError);
      return createErrorResponse("Không tìm thấy đơn hàng", "not_found");
    }

    // Get order items
    const { data: items, error: itemsError } = await serviceClient
      .from("order_items")
      .select(
        `
        id,
        product_name,
        variant_id,
        variant_volume_ml,
        quantity,
        unit_price_at_order,
        product_images:product_variants!inner(
          product_id,
          images:products!inner(
            product_images(image_url, is_main)
          )
        )
      `
      )
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error getting order items:", itemsError);
      return createErrorResponse(
        "Không thể lấy chi tiết đơn hàng",
        "database_error"
      );
    }

    // Get payment records
    const { data: payments, error: paymentsError } = await serviceClient
      .from("payments")
      .select(
        `
        id,
        payment_date,
        payment_method_id,
        transaction_id,
        amount,
        status,
        payment_details,
        payment_method:payment_methods(id, name)
      `
      )
      .eq("order_id", orderId);

    if (paymentsError) {
      console.error("Error getting payments:", paymentsError);
      return createErrorResponse(
        "Không thể lấy thông tin thanh toán",
        "database_error"
      );
    }

    // Format items with images
    const formattedItems = items.map((item) => {
      // Find main image or first image
      let productImage = null;
      if (item.product_images?.images?.product_images?.length > 0) {
        const images = item.product_images.images.product_images;
        const mainImage = images.find((img: any) => img.is_main);
        productImage = mainImage?.image_url || images[0]?.image_url;
      }

      return {
        id: item.id,
        productName: item.product_name,
        variantId: item.variant_id,
        variantVolumeMl: item.variant_volume_ml,
        quantity: item.quantity,
        unitPrice: item.unit_price_at_order,
        totalPrice: item.unit_price_at_order * item.quantity,
        productImage,
      };
    });

    // Format payments
    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      paymentDate: payment.payment_date,
      paymentMethodId: payment.payment_method_id,
      paymentMethodName: payment.payment_method?.name || null,
      transactionId: payment.transaction_id || null,
      amount: payment.amount,
      status: payment.status as PaymentStatus,
      paymentDetails: payment.payment_details,
    }));

    // Create shipping address
    const shippingAddress = `${order.street_address}, ${order.ward}, ${order.district}, ${order.province_city}`;

    // Format order details
    const orderDetails: OrderDetails = {
      id: order.id,
      orderId: order.id,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      orderDate: order.order_date,
      userId: order.user_id,
      isGuest: !order.user_id,
      customerName: order.guest_name || order.recipient_name,
      customerEmail: order.guest_email || null,
      customerPhone: order.guest_phone || order.recipient_phone,

      // Shipping info
      recipientName: order.recipient_name,
      recipientPhone: order.recipient_phone,
      shippingAddress,
      provinceCity: order.province_city,
      district: order.district,
      ward: order.ward,
      streetAddress: order.street_address,
      deliveryNotes: order.delivery_notes,
      trackingNumber: order.tracking_number,

      // Payment info
      paymentMethodId: order.payment_method_id,
      paymentMethodName: order.payment_method?.name || null,
      paymentStatus: order.payment_status as PaymentStatus,

      // Order status
      orderStatusId: order.order_status_id,
      orderStatusName: order.order_status?.name || "Unknown",

      // Financial details
      subtotalAmount: order.subtotal_amount,
      discountAmount: order.discount_amount,
      shippingFee: order.shipping_fee,
      totalAmount: order.total_amount,

      // Related items
      items: formattedItems,
      payments: formattedPayments,
    };

    return createSuccessResponse(orderDetails);
  } catch (error) {
    console.error("Error in getOrderDetails:", error);
    return createErrorResponse(
      "Không thể lấy chi tiết đơn hàng",
      "server_error"
    );
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: number,
  statusId: number
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Verify user is staff or admin
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse("Unauthorized", "unauthorized");
    }

    const role = getUserRoleFromMetadata(session.user);
    if (role !== "admin" && role !== "staff") {
      return createErrorResponse("Forbidden", "forbidden");
    }

    // Use service client to avoid RLS
    const serviceClient = await createServiceRoleClient();

    // Validate status exists
    const { data: statusData, error: statusError } = await serviceClient
      .from("order_statuses")
      .select("id, name")
      .eq("id", statusId)
      .single();

    if (statusError || !statusData) {
      return createErrorResponse(
        "Trạng thái đơn hàng không hợp lệ",
        "invalid_status"
      );
    }

    // Update order status
    const { error: updateError } = await serviceClient
      .from("orders")
      .update({ order_status_id: statusId })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order status:", updateError);
      return createErrorResponse(
        "Không thể cập nhật trạng thái đơn hàng",
        "database_error"
      );
    }

    return createSuccessResponse({
      message: `Đã cập nhật trạng thái đơn hàng thành ${statusData.name}`,
    });
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    return createErrorResponse(
      "Không thể cập nhật trạng thái đơn hàng",
      "server_error"
    );
  }
}

/**
 * Update order tracking number
 */
export async function updateOrderTracking(
  orderId: number,
  trackingNumber: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Verify user is staff or admin
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse("Unauthorized", "unauthorized");
    }

    const role = getUserRoleFromMetadata(session.user);
    if (role !== "admin" && role !== "staff") {
      return createErrorResponse("Forbidden", "forbidden");
    }

    // Use service client to avoid RLS
    const serviceClient = await createServiceRoleClient();

    // Update tracking number
    const { error: updateError } = await serviceClient
      .from("orders")
      .update({ tracking_number: trackingNumber })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating tracking number:", updateError);
      return createErrorResponse(
        "Không thể cập nhật mã vận đơn",
        "database_error"
      );
    }

    // Log activity
    await serviceClient.from("admin_activity_log").insert({
      admin_user_id: session.user.id,
      activity_type: "ORDER_TRACKING_UPDATE",
      description: `Cập nhật mã vận đơn cho đơn hàng #${orderId}`,
      entity_type: "order",
      entity_id: orderId.toString(),
      details: { tracking_number: trackingNumber },
    });

    return createSuccessResponse({
      message: "Đã cập nhật mã vận đơn thành công",
    });
  } catch (error) {
    console.error("Error in updateOrderTracking:", error);
    return createErrorResponse("Không thể cập nhật mã vận đơn", "server_error");
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  orderId: number,
  paymentStatus: PaymentStatus
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Verify user is staff or admin
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse("Unauthorized", "unauthorized");
    }

    const role = getUserRoleFromMetadata(session.user);
    if (role !== "admin" && role !== "staff") {
      return createErrorResponse("Forbidden", "forbidden");
    }

    // Validate payment status
    const validStatuses: PaymentStatus[] = [
      "Pending",
      "Paid",
      "Failed",
      "Refunded",
    ];
    if (!validStatuses.includes(paymentStatus)) {
      return createErrorResponse(
        "Trạng thái thanh toán không hợp lệ",
        "invalid_status"
      );
    }

    // Use service client to avoid RLS
    const serviceClient = await createServiceRoleClient();

    // Update payment status
    const { error: updateError } = await serviceClient
      .from("orders")
      .update({ payment_status: paymentStatus })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating payment status:", updateError);
      return createErrorResponse(
        "Không thể cập nhật trạng thái thanh toán",
        "database_error"
      );
    }

    // Get existing payments
    const { data: payments } = await serviceClient
      .from("payments")
      .select("id, status")
      .eq("order_id", orderId)
      .order("id", { ascending: false })
      .limit(1);

    // Also update the latest payment if exists
    if (payments && payments.length > 0) {
      const paymentId = payments[0].id;

      await serviceClient
        .from("payments")
        .update({ status: paymentStatus })
        .eq("id", paymentId);
    }

    // Log activity
    await serviceClient.from("admin_activity_log").insert({
      admin_user_id: session.user.id,
      activity_type: "PAYMENT_STATUS_UPDATE",
      description: `Cập nhật trạng thái thanh toán đơn hàng #${orderId} thành ${paymentStatus}`,
      entity_type: "order",
      entity_id: orderId.toString(),
      details: { payment_status: paymentStatus },
    });

    return createSuccessResponse({
      message: `Đã cập nhật trạng thái thanh toán thành ${paymentStatus}`,
    });
  } catch (error) {
    console.error("Error in updatePaymentStatus:", error);
    return createErrorResponse(
      "Không thể cập nhật trạng thái thanh toán",
      "server_error"
    );
  }
}

/**
 * Get order activity log (admin only)
 */
export async function getOrderActivityLog(
  orderId: number
): Promise<{ data?: any[]; error?: string }> {
  try {
    // Verify user is admin (not staff)
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse("Unauthorized", "unauthorized");
    }

    const role = getUserRoleFromMetadata(session.user);
    if (role !== "admin") {
      return createErrorResponse(
        "Chỉ Admin mới có quyền xem nhật ký hoạt động",
        "forbidden"
      );
    }

    // Use service client to avoid RLS
    const serviceClient = await createServiceRoleClient();

    // Get activity log
    const { data, error } = await serviceClient
      .from("admin_activity_log")
      .select(
        `
        id,
        admin_user_id,
        activity_type,
        description,
        timestamp,
        details,
        profiles:admin_user_id(display_name)
      `
      )
      .eq("entity_type", "order")
      .eq("entity_id", orderId.toString())
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching activity log:", error);
      return createErrorResponse(
        "Không thể lấy nhật ký hoạt động",
        "database_error"
      );
    }

    // Format activity log
    const formattedLog = data.map((entry) => ({
      id: entry.id,
      adminUserId: entry.admin_user_id,
      adminUserName: entry.profiles?.display_name || "System",
      activityType: entry.activity_type,
      description: entry.description,
      timestamp: entry.timestamp,
      details: entry.details,
    }));

    return createSuccessResponse(formattedLog);
  } catch (error) {
    console.error("Error in getOrderActivityLog:", error);
    return createErrorResponse(
      "Không thể lấy nhật ký hoạt động",
      "server_error"
    );
  }
}

/**
 * Get order statistics
 */
export async function getOrderStats(): Promise<{
  data?: OrderStats;
  error?: string;
}> {
  try {
    // Verify user is staff or admin
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse("Unauthorized", "unauthorized");
    }

    const role = getUserRoleFromMetadata(session.user);
    if (role !== "admin" && role !== "staff") {
      return createErrorResponse("Forbidden", "forbidden");
    }

    // Use service client to avoid RLS
    const serviceClient = await createServiceRoleClient();

    // Get order statuses first
    const { data: statuses, error: statusesError } = await serviceClient
      .from("order_statuses")
      .select("id, name");

    if (statusesError) {
      console.error("Error fetching order statuses:", statusesError);
      return createErrorResponse(
        "Không thể lấy thống kê đơn hàng",
        "database_error"
      );
    }

    // Create a map for status names to their IDs
    const statusMap: Record<string, number> = {};
    statuses.forEach((status) => {
      statusMap[status.name.toLowerCase()] = status.id;
    });

    // Get total orders count
    const { count: totalOrders, error: totalError } = await serviceClient
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (totalError) {
      console.error("Error counting orders:", totalError);
      return createErrorResponse(
        "Không thể lấy thống kê đơn hàng",
        "database_error"
      );
    }

    // Get counts for each status
    const statusCounts: any = {};
    for (const status of statuses) {
      const { count, error } = await serviceClient
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("order_status_id", status.id);

      if (error) {
        console.error(
          `Error counting orders with status ${status.name}:`,
          error
        );
        continue;
      }

      statusCounts[status.name.toLowerCase()] = count;
    }

    // Calculate revenue metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Total revenue (from completed orders only)
    const completedStatusIds = [
      statusMap["shipped"] || 0,
      statusMap["delivered"] || 0,
    ].filter((id) => id !== 0);

    let totalRevenue = 0;
    if (completedStatusIds.length > 0) {
      const { data: revenueData, error: revenueError } = await serviceClient
        .from("orders")
        .select("total_amount")
        .in("order_status_id", completedStatusIds);

      if (!revenueError && revenueData) {
        totalRevenue = revenueData.reduce(
          (sum, order) => sum + order.total_amount,
          0
        );
      }
    }

    // Today's revenue
    const { data: todayData, error: todayError } = await serviceClient
      .from("orders")
      .select("total_amount")
      .gte("order_date", today.toISOString());

    const todayRevenue =
      !todayError && todayData
        ? todayData.reduce((sum, order) => sum + order.total_amount, 0)
        : 0;

    // This week's revenue
    const { data: weekData, error: weekError } = await serviceClient
      .from("orders")
      .select("total_amount")
      .gte("order_date", startOfWeek.toISOString());

    const weekRevenue =
      !weekError && weekData
        ? weekData.reduce((sum, order) => sum + order.total_amount, 0)
        : 0;

    // This month's revenue
    const { data: monthData, error: monthError } = await serviceClient
      .from("orders")
      .select("total_amount")
      .gte("order_date", startOfMonth.toISOString());

    const monthRevenue =
      !monthError && monthData
        ? monthData.reduce((sum, order) => sum + order.total_amount, 0)
        : 0;

    // Compile statistics
    const stats: OrderStats = {
      total: totalOrders || 0,
      pending: statusCounts["pending"] || 0,
      processing: statusCounts["processing"] || 0,
      shipped: statusCounts["shipped"] || 0,
      delivered: statusCounts["delivered"] || 0,
      cancelled: statusCounts["cancelled"] || 0,
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
        thisWeek: weekRevenue,
        thisMonth: monthRevenue,
      },
    };

    return createSuccessResponse(stats);
  } catch (error) {
    console.error("Error in getOrderStats:", error);
    return createErrorResponse(
      "Không thể lấy thống kê đơn hàng",
      "server_error"
    );
  }
}

/**
 * Get all order statuses
 */
export async function getOrderStatuses(): Promise<{
  data?: Array<{ id: number; name: string }>;
  error?: string;
}> {
  try {
    // Verify user is staff or admin
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse("Unauthorized", "unauthorized");
    }

    const role = getUserRoleFromMetadata(session.user);
    if (role !== "admin" && role !== "staff") {
      return createErrorResponse("Forbidden", "forbidden");
    }

    // Use service client to avoid RLS
    const serviceClient = await createServiceRoleClient();

    const { data, error } = await serviceClient
      .from("order_statuses")
      .select("id, name")
      .order("id");

    if (error) {
      console.error("Error fetching order statuses:", error);
      return createErrorResponse(
        "Không thể lấy danh sách trạng thái đơn hàng",
        "database_error"
      );
    }

    return createSuccessResponse(data);
  } catch (error) {
    console.error("Error in getOrderStatuses:", error);
    return createErrorResponse(
      "Không thể lấy danh sách trạng thái đơn hàng",
      "server_error"
    );
  }
}
