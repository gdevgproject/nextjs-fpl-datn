"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOrderItems } from "../services";

/**
 * Hook to fetch items for a specific order by order ID
 */
export function useOrderItems(orderId: number | null) {
  return useQuery({
    queryKey: ["order_items", "list", orderId],
    queryFn: () => fetchOrderItems(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60, // 1 minute
  });
}
