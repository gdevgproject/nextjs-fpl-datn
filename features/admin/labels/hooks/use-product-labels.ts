"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface ProductLabelsFilters {
  search?: string;
}

interface ProductLabelsPagination {
  page: number;
  pageSize: number;
}

interface ProductLabelsSort {
  column: string;
  direction: "asc" | "desc";
}

export function useProductLabels(
  filters?: ProductLabelsFilters,
  pagination?: ProductLabelsPagination,
  sort?: ProductLabelsSort
) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["product_labels", "list", filters, pagination, sort],
    queryFn: async () => {
      // Start with base query
      let query = supabase
        .from("product_labels")
        .select("id, name, color_code, created_at, updated_at", {
          count: "exact",
        });

      // Apply search filter
      if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.column, {
          ascending: sort.direction === "asc",
        });
      } else {
        // Default sorting
        query = query.order("name", { ascending: true });
      }

      // Apply pagination
      if (pagination) {
        const { page, pageSize } = pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        data,
        count,
      };
    },
  });
}
