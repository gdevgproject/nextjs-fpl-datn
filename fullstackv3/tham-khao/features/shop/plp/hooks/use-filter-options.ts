"use client"

import { useClientRpcQuery } from "@/shared/hooks/use-client-rpc"

export interface FilterOption {
  id: number
  name: string
  count?: number
}

export interface FilterOptions {
  brands?: FilterOption[]
  categories?: FilterOption[]
  genders?: FilterOption[]
  ingredients?: FilterOption[]
  labels?: FilterOption[]
  price_range?: {
    min: number
    max: number
  }
  volume_range?: {
    min: number
    max: number
  }
  release_years?: {
    min: number
    max: number
  }
  origin_countries?: {
    name: string
    count: number
  }[]
}

export function useFilterOptions() {
  return useClientRpcQuery<"get_plp_filter_options", {}, FilterOptions>(
    "get_plp_filter_options",
    {},
    {
      staleTime: 1000 * 60 * 15, // 15 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  )
}
