import { createServiceRoleClient } from "@/lib/supabase/server";
import { TimeFilter, DashboardOverviewMetrics } from "./types";

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
