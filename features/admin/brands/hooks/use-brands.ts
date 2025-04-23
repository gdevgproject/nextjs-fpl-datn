"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface BrandsFilters {
  search?: string;
}

interface BrandsPagination {
  page: number;
  pageSize: number;
}

interface BrandsSort {
  column: string;
  direction: "asc" | "desc";
}

export function useBrands(
  filters?: BrandsFilters,
  pagination?: BrandsPagination,
  sort?: BrandsSort
) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["brands", "list", filters, pagination, sort],
    queryFn: async () => {
      // Start with base query
      let query = supabase
        .from("brands")
        .select("id, name, description, logo_url, created_at, updated_at", {
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
