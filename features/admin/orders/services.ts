import { getSupabaseBrowserClient } from "@/lib/supabase/client";
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
 */
export async function fetchOrders(
  filters?: OrdersFilters,
  pagination?: OrdersPagination,
  sort?: OrdersSort
): Promise<OrdersResponse> {
  const supabase = getSupabaseBrowserClient();

  let query = supabase.from("orders").select(
    `
      id, 
      access_token, 
      user_id, 
      assigned_shipper_id, 
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
      discount_id, 
      subtotal_amount, 
      discount_amount, 
      shipping_fee, 
      total_amount, 
      cancellation_reason, 
      cancelled_by, 
      cancelled_by_user_id, 
      delivery_failure_reason, 
      delivery_failure_timestamp, 
      completed_at, 
      created_at, 
      updated_at,
      order_statuses(id, name),
      payment_methods(id, name)
    `,
    { count: "exact" }
  );

  // Apply search filter
  if (filters?.search) {
    query = query.or(
      `id.eq.${
        !isNaN(Number.parseInt(filters.search))
          ? Number.parseInt(filters.search)
          : 0
      },recipient_name.ilike.%${filters.search}%,recipient_phone.ilike.%${
        filters.search
      }%,guest_name.ilike.%${filters.search}%,guest_phone.ilike.%${
        filters.search
      }%`
    );
  }

  // Apply status filter
  if (filters?.status !== undefined && filters.status !== null) {
    query = query.eq("order_status_id", filters.status);
  }

  // Apply payment status filter
  if (filters?.paymentStatus) {
    query = query.eq("payment_status", filters.paymentStatus);
  }

  // Apply date range filter
  if (filters?.dateFrom) {
    query = query.gte("order_date", filters.dateFrom);
  }
  if (filters?.dateTo) {
    // Add one day to include the end date fully
    const nextDay = new Date(filters.dateTo);
    nextDay.setDate(nextDay.getDate() + 1);
    query = query.lt("order_date", nextDay.toISOString());
  }

  // Apply assigned shipper filter
  if (filters?.assignedShipperId) {
    query = query.eq("assigned_shipper_id", filters.assignedShipperId);
  }

  // Apply sorting
  if (sort) {
    query = query.order(sort.column, {
      ascending: sort.direction === "asc",
    });
  } else {
    query = query.order("order_date", { ascending: false }); // Default sort
  }

  // Apply pagination
  if (pagination) {
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }

  return { data: data || [], count };
}

/**
 * Fetch a single order's details by ID
 */
export async function fetchOrderDetails(
  orderId: number | null
): Promise<OrderDetailsResponse> {
  if (!orderId) return { data: null, count: null };

  const supabase = getSupabaseBrowserClient();

  const { data, error, count } = await supabase
    .from("orders")
    .select(
      `
      id, 
      access_token, 
      user_id, 
      assigned_shipper_id, 
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
      discount_id, 
      subtotal_amount, 
      discount_amount, 
      shipping_fee, 
      total_amount, 
      cancellation_reason, 
      cancelled_by, 
      cancelled_by_user_id, 
      delivery_failure_reason, 
      delivery_failure_timestamp, 
      completed_at, 
      created_at, 
      updated_at,
      order_statuses(id, name),
      payment_methods(id, name),
      profiles(id, display_name, phone_number, avatar_url)
    `
    )
    .eq("id", orderId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching order details:", error);
    throw error;
  }

  return { data, count };
}

/**
 * Fetch order items for a specific order
 */
export async function fetchOrderItems(
  orderId: number | null
): Promise<OrderItemsResponse> {
  if (!orderId) return { data: [], count: 0 };

  const supabase = getSupabaseBrowserClient();

  const { data, error, count } = await supabase
    .from("order_items")
    .select(
      `
      id, 
      order_id, 
      variant_id, 
      product_name, 
      variant_volume_ml, 
      quantity, 
      unit_price_at_order,
      product_variants(id, product_id, sku, products(id, slug))
    `
    )
    .eq("order_id", orderId);

  if (error) {
    console.error("Error fetching order items:", error);
    throw error;
  }

  return { data: data || [], count };
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
 */
export async function fetchShippers(): Promise<{
  data: Shipper[];
  count: number;
}> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("auth.users")
    .select("id, email, raw_user_meta_data, raw_app_meta_data");

  if (error) {
    console.error("Error fetching shippers:", error);
    throw error;
  }

  // Filter to only include users with shipper role
  const shippers = Array.isArray(data)
    ? data.filter(
        (user) =>
          user.raw_app_meta_data && user.raw_app_meta_data.role === "shipper"
      )
    : [];

  // Transform the data to a more usable format
  const formattedShippers = shippers.map((shipper) => ({
    id: shipper.id,
    email: shipper.email,
    name: shipper.raw_user_meta_data?.display_name || shipper.email,
  }));

  return {
    data: formattedShippers,
    count: formattedShippers.length,
  };
}
