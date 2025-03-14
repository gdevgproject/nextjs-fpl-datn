"use client"

import { useQuery } from "@tanstack/react-query"
import { mockProduct } from "../mocks/productMockData"
import type { Product } from "../types/productTypes"

// This will be replaced with real API call later
const fetchProduct = async (slug: string): Promise<Product> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (mockProduct.slug === slug) {
    return mockProduct
  }
  throw new Error("Product not found")
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug as string),
    enabled: !!slug,
  })
}

