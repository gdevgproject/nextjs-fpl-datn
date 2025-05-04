"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOrderDetails } from "../services";

/**
 * Hook to fetch details for a specific order by ID
 */
export function useOrderDetails(orderId: number | null) {
  return useQuery({
    queryKey: ["orders", "details", orderId],
    queryFn: () => fetchOrderDetails(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Hiển thị trạng thái isLoading khi refetching, nhưng giữ lại data cũ
    keepPreviousData: false,
    refetchOnWindowFocus: false,
  });
}
