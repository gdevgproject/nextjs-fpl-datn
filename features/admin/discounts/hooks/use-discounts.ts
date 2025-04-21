"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface DiscountsFilters {
  search?: string;
}

interface DiscountsPagination {
  page: number;
  pageSize: number;
}

interface DiscountsSort {
  column: string;
  direction: "asc" | "desc";
}

export function useDiscounts(
  filters?: DiscountsFilters,
  pagination?: DiscountsPagination,
  sort?: DiscountsSort
) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["discounts", "list", filters, pagination, sort],
    queryFn: async () => {
      let query = supabase
        .from("discounts")
        .select(
          `id, code, description, start_date, end_date, max_uses, remaining_uses, min_order_value, max_discount_amount, discount_percentage, is_active, created_at, updated_at`,
          { count: "exact" }
        );

      // Apply search filter
      if (filters?.search) {
        query = query.or(
          `code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      // Apply pagination
      if (pagination) {
        const { page, pageSize } = pagination;
        const start = (page - 1) * pageSize;
        const end = page * pageSize - 1;
        query = query.range(start, end);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.column, {
          ascending: sort.direction === "asc",
        });
      } else {
        // Default sort by creation date (newest first)
        query = query.order("created_at", { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, count };
    },
  });
}
