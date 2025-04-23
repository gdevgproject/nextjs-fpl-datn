"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface ConcentrationsFilters {
  search?: string;
}

interface ConcentrationsPagination {
  page: number;
  pageSize: number;
}

interface ConcentrationsSort {
  column: string;
  direction: "asc" | "desc";
}

export function useConcentrations(
  filters?: ConcentrationsFilters,
  pagination?: ConcentrationsPagination,
  sort?: ConcentrationsSort
) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["concentrations", "list", filters, pagination, sort],
    queryFn: async () => {
      // Start with base query
      let query = supabase
        .from("concentrations")
        .select("id, name, description, created_at, updated_at", {
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
