"use client"

import { useClientRpcQuery } from "@/shared/hooks/use-client-rpc"

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  main_image_url: string
  brand_name: string
  min_price: number
  max_price: number
  min_sale_price: number | null
  max_sale_price: number | null
  is_on_sale: boolean
  discount_percentage: number | null
  total_count: number
}

export interface FilterProductsParams {
  p_filters: {
    brand_ids?: number[]
    category_ids?: number[]
    gender_ids?: number[]
    ingredient_ids?: number[]
    label_ids?: number[]
    min_price?: number
    max_price?: number
    on_sale?: boolean
    in_stock?: boolean
    min_volume?: number
    max_volume?: number
    search_term?: string
    origin_country?: string
    release_year_min?: number
    release_year_max?: number
  }
  p_page: number
  p_page_size: number
  p_sort_by: string
  p_sort_order: string
}

export function useProducts(params: FilterProductsParams) {
  return useClientRpcQuery<"filter_products", FilterProductsParams, Product[]>("filter_products", params, {
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })
}
