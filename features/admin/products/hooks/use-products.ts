"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  ProductsResponse,
  ProductFilters,
  ProductPagination,
  ProductSort,
} from "../types";
import { buildProductsQuery } from "../services";
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config";
import { useCallback } from "react";

/**
 * Hook to fetch products with filtering, pagination, and sorting
 */
export function useProducts(
  filters?: ProductFilters,
  pagination?: ProductPagination,
  sort?: ProductSort
) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();

  // Create a stable queryKey
  const queryKey = [
    "products",
    "list",
    {
      filters,
      pagination,
      sort,
    },
  ];

  // Function for manual refetching (useful after operations like delete/restore)
  const refetchProducts = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ["products", "list"] });
  }, [queryClient]);

  // Define the query function with proper error handling
  const fetchProducts = async (): Promise<ProductsResponse> => {
    try {
      // Use the shared query builder from services
      const query = await buildProductsQuery(
        supabase,
        filters,
        pagination,
        sort
      );

      // Execute the query
      const { data, error, count } = await query;

      if (error) {
        console.warn("Supabase query returned an error:", error);
        // Return empty data instead of throwing
        return { data: [], count: 0 };
      }

      return {
        data: Array.isArray(data) ? data : [],
        count: count ?? 0,
      };
    } catch (error) {
      console.error("Exception in fetchProducts:", error);
      // Return empty data instead of throwing to keep UI stable
      return { data: [], count: 0 };
    }
  };

  // Use React Query to fetch and cache results
  const result = useQuery({
    queryKey,
    queryFn: fetchProducts,
    staleTime: 0, // Always treat data as stale to ensure fresh data on filter changes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Only retry once to avoid excessive requests on real errors
      return failureCount < 1;
    },
  });

  // Return the result with additional refetch method
  return {
    ...result,
    refetchProducts,
  };
}
