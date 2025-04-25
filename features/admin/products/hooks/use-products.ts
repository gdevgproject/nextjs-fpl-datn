"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  ProductsResponse,
  ProductFilters,
  ProductPagination,
  ProductSort,
} from "../types";
import { buildProductsQuery } from "../services";
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config";

/**
 * Hook to fetch products with filtering, pagination, and sorting
 */
export function useProducts(
  filters?: ProductFilters,
  pagination?: ProductPagination,
  sort?: ProductSort
) {
  const supabase = getSupabaseBrowserClient();

  return useQuery<ProductsResponse, Error>({
    queryKey: ["products", "list", filters, pagination, sort],
    queryFn: async () => {
      try {
        // Use the shared query builder from services
        const query = buildProductsQuery(supabase, filters, pagination, sort);

        // Execute the query
        const { data, error, count } = await query;

        if (error) {
          throw error;
        }

        return { data, count };
      } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
    },
    staleTime: QUERY_STALE_TIME?.PRODUCTS || 1000 * 60 * 5, // 5 minutes or from config
  });
}
