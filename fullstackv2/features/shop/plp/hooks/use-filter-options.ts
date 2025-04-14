"use client"

import { useClientRpcQuery } from "@/shared/hooks/use-client-rpc"
import type { FilterOptions } from "../types/plp-types"

export function useFilterOptions() {
  return useClientRpcQuery<"get_plp_filter_options", FilterOptions>(
    "get_plp_filter_options",
    {},
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  )
}
