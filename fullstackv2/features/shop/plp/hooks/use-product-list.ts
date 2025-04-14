"use client"

import { useClientRpcQuery } from "@/shared/hooks/use-client-rpc"
import type { ProductFilters, ProductListItem, SortOption, SortOrder } from "../types/plp-types"

interface ProductListParams {
  p_filters: ProductFilters
  p_page: number
  p_page_size: number
  p_sort_by: SortOption
  p_sort_order: SortOrder
}

export function useProductList(params: ProductListParams) {
  return useClientRpcQuery<"filter_products", ProductListItem[]>(
    ["filter_products", params],
    "filter_products",
    params,
    {
      keepPreviousData: true,
      staleTime: 1 * 60 * 1000, // 1 minute
    },
  )
}
