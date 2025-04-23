"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config";

interface ScentsFilters {
  search?: string;
}

interface ScentsPagination {
  page: number;
  pageSize: number;
}

interface ScentsSort {
  column: string;
  direction: "asc" | "desc";
}

interface Scent {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useScents(
  filters?: ScentsFilters,
  pagination?: ScentsPagination,
  sort?: ScentsSort
) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["scents", "list", filters, pagination, sort],
    queryFn: async () => {
      // Start with basic query
      let query = supabase
        .from("scents")
        .select("id, name, description, created_at, updated_at", {
          count: pagination ? "exact" : undefined,
        });

      // Apply search filter if provided
      if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.column, {
          ascending: sort.direction === "asc",
        });
      } else {
        // Default sorting by name ascending
        query = query.order("name", { ascending: true });
      }

      // Apply pagination if provided
      if (pagination) {
        const { page, pageSize } = pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      // Execute the query
      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching scents:", error);
        throw error;
      }

      return {
        data: data as Scent[],
        count: count || 0,
      };
    },
    staleTime: QUERY_STALE_TIME.CATEGORY,
  });
}
