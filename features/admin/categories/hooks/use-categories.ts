"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface CategoriesFilters {
  search?: string;
}

interface CategoriesPagination {
  page: number;
  pageSize: number;
}

interface CategoriesSort {
  column: string;
  direction: "asc" | "desc";
}

export function useCategories(
  filters?: CategoriesFilters,
  pagination?: CategoriesPagination,
  sort?: CategoriesSort
) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["categories", "list", filters, pagination, sort],
    queryFn: async () => {
      // Start with base query
      let query = supabase
        .from("categories")
        .select(
          "id, name, description, image_url, is_featured, display_order, parent_category_id, created_at, updated_at, slug",
          {
            count: "exact",
          }
        );

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
        query = query.order("display_order", { ascending: true });
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
