"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface OrdersFilters {
  search?: string;
  status?: number | null;
  paymentStatus?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  assignedShipperId?: string | null;
}

export interface OrdersPagination {
  page: number;
  pageSize: number;
}

export interface OrdersSort {
  column: string;
  direction: "asc" | "desc";
}

export function useOrders(
  filters?: OrdersFilters,
  pagination?: OrdersPagination,
  sort?: OrdersSort
) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["orders", "list", filters, pagination, sort],
    queryFn: async () => {
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
    },
  });
}
