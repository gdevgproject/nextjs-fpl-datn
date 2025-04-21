"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface BannersFilters {
  search?: string;
  isActive?: boolean;
}

interface BannersPagination {
  page: number;
  pageSize: number;
}

interface BannersSort {
  column: string;
  direction: "asc" | "desc";
}

export function useBanners(
  filters?: BannersFilters,
  pagination?: BannersPagination,
  sort?: BannersSort
) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["banners", "list", filters, pagination, sort],
    queryFn: async () => {
      const columns = `id, title, subtitle, image_url, link_url, is_active, display_order, start_date, end_date, created_at, updated_at`;

      // Start building the query
      let query = supabase.from("banners").select(columns, { count: "exact" });

      // Apply search filter
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      // Apply active filter
      if (filters?.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive);
      }

      // Apply pagination
      if (pagination) {
        const { page, pageSize } = pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.column, {
          ascending: sort.direction === "asc",
        });
      } else {
        query = query.order("display_order", { ascending: true });
      }

      // Execute the query
      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        count: count || 0,
      };
    },
    refetchOnWindowFocus: false,
  });
}
