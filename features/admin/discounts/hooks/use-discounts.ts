"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDiscounts } from "../services";
import { DiscountFilter } from "../types";

/**
 * Hook to fetch and manage discounts data with TanStack Query
 *
 * @param search - Optional search term for filtering discounts
 * @param filter - Optional filter for discount status (all, active, inactive, expired, upcoming)
 * @returns Query result with discount data and loading/error states
 */
export function useDiscounts(search?: string, filter?: DiscountFilter) {
  return useQuery({
    queryKey: ["discounts", { search, filter }],
    queryFn: () => fetchDiscounts(search, filter),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
