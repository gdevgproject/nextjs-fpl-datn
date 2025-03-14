"use client"

import { useQuery } from "@tanstack/react-query"
import { mockReviews } from "../mocks/productMockData"
import type { ProductReview } from "../types/productTypes"

// This will be replaced with real API call later
const fetchReviews = async (productId: string): Promise<ProductReview[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockReviews
}

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ["productReviews", productId],
    queryFn: () => fetchReviews(productId as string),
    enabled: !!productId,
  })
}

