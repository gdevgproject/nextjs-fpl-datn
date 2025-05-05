import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  fetchOrdersAction,
  fetchOrderDetailsAction,
  fetchShippersAction,
} from "./actions";
import type {
  OrdersFilters,
  OrdersResponse,
  OrdersSort,
  OrdersPagination,
  OrderDetailsResponse,
  OrderItemsResponse,
  Shipper,
  OrderStatus,
} from "./types";

/**
 * Fetch orders with filters, pagination and sorting
 * Uses server action with admin privileges to bypass RLS
 */
export async function fetchOrders(
  filters?: OrdersFilters,
  pagination?: OrdersPagination,
  sort?: OrdersSort
): Promise<OrdersResponse> {
  try {
    return await fetchOrdersAction(filters, pagination, sort);
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

/**
 * Fetch a single order's details by ID
 * Uses server action with admin privileges to bypass RLS
 */
export async function fetchOrderDetails(
  orderId: number | null
): Promise<OrderDetailsResponse> {
  if (!orderId) return { data: null, items: [], notes: [] };

  try {
    const { data, items } = await fetchOrderDetailsAction(orderId);
    return { data, items, notes: [] };
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
}

/**
 * Fetch order items for a specific order
 */
export async function fetchOrderItems(
  orderId: number | null
): Promise<OrderItemsResponse> {
  if (!orderId) return { data: [], count: 0 };

  try {
    // We'll use the order details endpoint as it already includes items
    const { items } = await fetchOrderDetailsAction(orderId);
    return { data: items || [], count: items?.length || 0 };
  } catch (error) {
    console.error("Error fetching order items:", error);
    throw error;
  }
}

/**
 * Fetch all available order statuses
 */
export async function fetchOrderStatuses(): Promise<{
  data: OrderStatus[];
  count: number | null;
}> {
  const supabase = getSupabaseBrowserClient();

  const { data, error, count } = await supabase
    .from("order_statuses")
    .select("id, name, description")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching order statuses:", error);
    throw error;
  }

  return { data: data || [], count };
}

/**
 * Fetch available shippers (users with shipper role)
 * Uses server action with admin privileges to bypass RLS
 */
export async function fetchShippers(): Promise<{
  data: Shipper[];
  count: number;
}> {
  try {
    return await fetchShippersAction();
  } catch (error) {
    console.error("Error fetching shippers:", error);
    // Fallback response with empty data if API fails
    return {
      data: [],
      count: 0,
    };
  }
}
