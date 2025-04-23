"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "../services";
import type { OrdersFilters, OrdersPagination, OrdersSort } from "../types";

/**
 * Hook to fetch orders with optional filtering, pagination and sorting
 */
export function useOrders(
  filters?: OrdersFilters,
  pagination?: OrdersPagination,
  sort?: OrdersSort
) {
  return useQuery({
    queryKey: ["orders", "list", filters, pagination, sort],
    queryFn: () => fetchOrders(filters, pagination, sort),
    staleTime: 1000 * 60, // 1 minute
  });
}

// Re-export types from types.ts for backward compatibility
export type { OrdersFilters, OrdersPagination, OrdersSort } from "../types";
