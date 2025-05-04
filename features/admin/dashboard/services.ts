import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  TimeFilter,
  DashboardOverviewMetrics,
  DashboardOrdersMetrics,
  OrderStatusDistribution,
  PaymentMethodRevenue,
  RecentOrder,
} from "./types";

// Get dashboard overview metrics
export async function getDashboardOverviewMetrics(
  timeFilter: TimeFilter
): Promise<DashboardOverviewMetrics> {
  // Use service role client to bypass RLS
  const supabase = await createServiceRoleClient();

  // Get completed order status IDs (Đã giao, Đã hoàn thành)
  const { data: completedStatuses } = await supabase
    .from("order_statuses")
    .select("id")
    .in("name", ["Đã giao", "Đã hoàn thành"]);

  const completedStatusIds =
    completedStatuses?.map((status) => status.id) || [];

  // Total revenue from completed orders - Using completed_at instead of created_at
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total_amount")
    .in("order_status_id", completedStatusIds)
    .gte("completed_at", timeFilter.startDate.toISOString())
    .lte("completed_at", timeFilter.endDate.toISOString());

  const totalRevenue =
    revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) ||
    0;

  // Total orders created in period - This one keeps created_at since we want ALL orders created in this period
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", timeFilter.startDate.toISOString())
    .lte("created_at", timeFilter.endDate.toISOString());

  // Completed orders in period - Using completed_at for when they were actually completed
  const { count: completedOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("order_status_id", completedStatusIds)
    .gte("completed_at", timeFilter.startDate.toISOString())
    .lte("completed_at", timeFilter.endDate.toISOString());

  // Average order value
  const averageOrderValue =
    completedOrders && completedOrders > 0 ? totalRevenue / completedOrders : 0;

  // Total products sold - Step 1: Get completed order IDs using completed_at
  const { data: completedOrderIds } = await supabase
    .from("orders")
    .select("id")
    .in("order_status_id", completedStatusIds)
    .gte("completed_at", timeFilter.startDate.toISOString())
    .lte("completed_at", timeFilter.endDate.toISOString());

  // Then query order_items for these specific order IDs
  let totalProductsSold = 0;
  if (completedOrderIds && completedOrderIds.length > 0) {
    const orderIds = completedOrderIds.map((order) => order.id);

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("quantity")
      .in("order_id", orderIds);

    totalProductsSold =
      orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  }

  // New customers in period
  const { count: newCustomers } = await supabase
    .from("profiles") // Using profiles table instead of auth.users
    .select("id", { count: "exact", head: true })
    .gte("created_at", timeFilter.startDate.toISOString())
    .lte("created_at", timeFilter.endDate.toISOString());

  return {
    totalRevenue,
    totalOrders: totalOrders || 0,
    completedOrders: completedOrders || 0,
    averageOrderValue,
    totalProductsSold,
    newCustomers: newCustomers || 0,
  };
}

// Get dashboard orders metrics (Tab 2)
export async function getDashboardOrdersMetrics(
  timeFilter: TimeFilter
): Promise<DashboardOrdersMetrics> {
  // Use service role client to bypass RLS
  const supabase = await createServiceRoleClient();

  // Get all order status IDs and names for reference
  const { data: orderStatuses } = await supabase
    .from("order_statuses")
    .select("id, name");

  if (!orderStatuses || orderStatuses.length === 0) {
    throw new Error("Failed to fetch order statuses");
  }

  // Status ID mappings
  const statusMap = new Map(
    orderStatuses.map((status) => [status.id, status.name])
  );
  const completedStatusIds = orderStatuses
    .filter((status) => ["Đã giao", "Đã hoàn thành"].includes(status.name))
    .map((status) => status.id);
  const pendingStatusIds = orderStatuses
    .filter((status) => ["Chờ xác nhận", "Đã xác nhận"].includes(status.name))
    .map((status) => status.id);
  const shippingStatusIds = orderStatuses
    .filter((status) => ["Đang giao"].includes(status.name))
    .map((status) => status.id);
  const cancelledStatusIds = orderStatuses
    .filter((status) => ["Đã hủy"].includes(status.name))
    .map((status) => status.id);

  // 1. Order distribution by status (for pie chart)
  // Using proper PostgreSQL aggregation syntax for Supabase
  const { data: ordersByStatusRaw } = await supabase
    .from("orders")
    .select("order_status_id, count", { count: "exact" })
    .gte("created_at", timeFilter.startDate.toISOString())
    .lte("created_at", timeFilter.endDate.toISOString())
    .csv();

  // If the above approach doesn't work, we need to fetch all orders and group them in JavaScript
  let ordersByStatusData = [];

  if (!ordersByStatusRaw || ordersByStatusRaw.length === 0) {
    // Fallback approach: Fetch all orders and group them in JS
    const { data: allOrders } = await supabase
      .from("orders")
      .select("order_status_id")
      .gte("created_at", timeFilter.startDate.toISOString())
      .lte("created_at", timeFilter.endDate.toISOString());

    if (allOrders && allOrders.length > 0) {
      // Group by order_status_id and count
      const statusCounts = new Map<number, number>();
      allOrders.forEach((order) => {
        const statusId = order.order_status_id;
        statusCounts.set(statusId, (statusCounts.get(statusId) || 0) + 1);
      });

      // Convert to array format
      ordersByStatusData = Array.from(statusCounts.entries()).map(
        ([statusId, count]) => ({
          order_status_id: statusId,
          count,
        })
      );
    }
  } else {
    ordersByStatusData = ordersByStatusRaw;
  }

  // Transform and assign colors based on status
  const statusColors: Record<string, string> = {
    "Chờ xác nhận": "#FFC107", // Yellow
    "Đã xác nhận": "#3B82F6", // Blue
    "Đang giao": "#6366F1", // Indigo
    "Đã giao": "#10B981", // Green
    "Đã hoàn thành": "#059669", // Emerald
    "Đã hủy": "#EF4444", // Red
    "Hoàn tiền": "#F97316", // Orange
    "Đổi trả": "#8B5CF6", // Violet
  };

  const ordersByStatus: OrderStatusDistribution[] = (
    ordersByStatusData || []
  ).map((item) => {
    const statusName =
      statusMap.get(item.order_status_id) || `Status ${item.order_status_id}`;
    return {
      name: statusName,
      count:
        typeof item.count === "string" ? parseInt(item.count) : item.count || 0,
      color: statusColors[statusName] || "#6B7280", // Gray fallback color
    };
  });

  // 2. Pending Orders Count (Chờ xác nhận, Đã xác nhận)
  // Current status (not filtered by time)
  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("order_status_id", pendingStatusIds);

  // 3. Orders in delivery (Đang giao)
  // Current status (not filtered by time)
  const { count: shippingOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("order_status_id", shippingStatusIds);

  // 4. Cancelled Orders in period
  const { count: cancelledOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("order_status_id", cancelledStatusIds)
    .gte("updated_at", timeFilter.startDate.toISOString())
    .lte("updated_at", timeFilter.endDate.toISOString());

  // 5. Total Orders in period (for cancellation rate)
  const { count: totalOrdersInPeriod } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", timeFilter.startDate.toISOString())
    .lte("created_at", timeFilter.endDate.toISOString());

  // Calculate cancellation rate
  const cancellationRate = totalOrdersInPeriod
    ? Math.round(((cancelledOrders || 0) / totalOrdersInPeriod) * 100)
    : 0;

  // 6. Revenue by Payment Method
  const { data: paymentMethods } = await supabase
    .from("payment_methods")
    .select("id, name");

  const paymentMethodMap = new Map(
    paymentMethods?.map((pm) => [pm.id, pm.name]) || []
  );

  // For payment method revenue, we'll use the same approach as above
  // First try to get completed orders in the period
  const { data: completedOrders } = await supabase
    .from("orders")
    .select("payment_method_id, total_amount")
    .in("order_status_id", completedStatusIds)
    .gte("completed_at", timeFilter.startDate.toISOString())
    .lte("completed_at", timeFilter.endDate.toISOString());

  // Calculate sums in JavaScript
  const paymentSums = new Map<number, number>();
  if (completedOrders && completedOrders.length > 0) {
    completedOrders.forEach((order) => {
      const methodId = order.payment_method_id;
      paymentSums.set(
        methodId,
        (paymentSums.get(methodId) || 0) + (order.total_amount || 0)
      );
    });
  }

  // Convert to array format needed by the component
  const paymentMethodRevenueData = Array.from(paymentSums.entries()).map(
    ([methodId, sum]) => ({ payment_method_id: methodId, sum })
  );

  // Payment method colors
  const paymentMethodColors: Record<string, string> = {
    COD: "#3B82F6", // Blue
    MoMo: "#EC4899", // Pink
    VNPay: "#10B981", // Green
    "Chuyển khoản": "#6366F1", // Indigo
    "Ví điện tử": "#8B5CF6", // Violet
  };

  const paymentMethodRevenue: PaymentMethodRevenue[] =
    paymentMethodRevenueData.map((item) => {
      const methodName =
        paymentMethodMap.get(item.payment_method_id) ||
        `Method ${item.payment_method_id}`;
      return {
        name: methodName,
        value:
          typeof item.sum === "string" ? parseFloat(item.sum) : item.sum || 0,
        color: paymentMethodColors[methodName] || "#6B7280", // Gray fallback
      };
    });

  // 7. Recent Orders
  const { data: recentOrdersRaw } = await supabase
    .from("orders")
    .select(
      `
      id, 
      user_id, 
      guest_name,
      order_date,
      total_amount, 
      order_status_id
    `
    )
    .order("order_date", { ascending: false })
    .limit(10);

  let recentOrders: RecentOrder[] = [];

  if (recentOrdersRaw && recentOrdersRaw.length > 0) {
    // Get user profiles for orders with user_id
    const userIds = recentOrdersRaw
      .filter((order) => order.user_id)
      .map((order) => order.user_id);

    let userMap = new Map<string, string>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .in("id", userIds);

      if (profiles) {
        profiles.forEach((profile) => {
          userMap.set(profile.id, profile.display_name || profile.email);
        });
      }
    }

    // Process the orders - generating order number from ID
    recentOrders = recentOrdersRaw.map((order) => {
      const statusName = statusMap.get(order.order_status_id) || "Unknown";

      return {
        id: order.id,
        orderNumber: `#${order.id}`, // Generate order number from ID
        customerName: order.user_id
          ? userMap.get(order.user_id) || "Unknown User"
          : order.guest_name || "Guest",
        orderDate: order.order_date,
        totalAmount: order.total_amount,
        status: statusName,
        statusColor: statusColors[statusName] || "#6B7280",
      };
    });
  }

  return {
    ordersByStatus,
    pendingOrders: pendingOrders || 0,
    shippingOrders: shippingOrders || 0,
    cancelledOrders: cancelledOrders || 0,
    cancellationRate,
    paymentMethodRevenue,
    recentOrders,
  };
}

// Generate time filter based on predefined options
export function generateTimeFilter(
  option: string,
  customRange?: { from: Date; to: Date }
): TimeFilter {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (option) {
    case "today":
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };

    case "thisWeek": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(
        today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
      ); // Start on Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return {
        startDate: startOfWeek,
        endDate: endOfWeek,
      };
    }

    case "thisMonth": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      return {
        startDate: startOfMonth,
        endDate: endOfMonth,
      };
    }

    case "thisYear": {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      endOfYear.setHours(23, 59, 59, 999);
      return {
        startDate: startOfYear,
        endDate: endOfYear,
      };
    }

    case "custom":
      if (customRange?.from && customRange?.to) {
        const endDate = new Date(customRange.to);
        endDate.setHours(23, 59, 59, 999);
        return {
          startDate: customRange.from,
          endDate: endDate,
        };
      }
      // Fallback to this month if custom range is invalid
      return generateTimeFilter("thisMonth");

    default:
      return generateTimeFilter("thisMonth");
  }
}
