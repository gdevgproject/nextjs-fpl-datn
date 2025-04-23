"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { searchProducts } from "../actions"
import type { ProductRecommendation } from "../types"

export function useProductSearch() {
  const [results, setResults] = useState<ProductRecommendation[]>([])
  const [totalCount, setTotalCount] = useState(0)

  const {
    mutate: search,
    isLoading,
    error,
  } = useMutation({
    mutationFn: async (query: string) => {
      const { products, totalCount } = await searchProducts({ query, limit: 5 })
      setResults(products)
      setTotalCount(totalCount)
      return products
    },
  })

  return {
    results,
    totalCount,
    search,
    isLoading,
    error: error as Error,
  }
}
