"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchShippers } from "../services";

/**
 * Hook to fetch all available shippers (users with shipper role)
 */
export function useShippers() {
  return useQuery({
    queryKey: ["shippers", "list"],
    queryFn: fetchShippers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
