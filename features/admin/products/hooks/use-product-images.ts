"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"
import { useClientMutation } from "@/shared/hooks/use-client-mutation"

// Hook to fetch images for a specific product
export function useProductImages(productId: number | null) {
  return useClientFetch(
    ["product_images", "by_product", productId],
    "product_images",
    {
      columns: "id, product_id, image_url, alt_text, is_main, display_order",
      filters: (query) => {
        let q = query
        if (productId) {
          q = q.eq("product_id", productId)
        }
        return q
      },
      sort: [
        { column: "is_main", ascending: false }, // Main image first
        { column: "display_order", ascending: true }, // Then by display order
      ],
    },
    {
      // Only fetch if productId is provided
      enabled: !!productId,
    },
  )
}

// Hook to create a new product image
export function useCreateProductImage() {
  return useClientMutation("product_images", "insert", {
    invalidateQueries: [["product_images", "by_product"]],
    primaryKey: "id",
  })
}

// Hook to update an existing product image
export function useUpdateProductImage() {
  return useClientMutation("product_images", "update", {
    invalidateQueries: [["product_images", "by_product"]],
    primaryKey: "id",
  })
}

// Hook to delete a product image
export function useDeleteProductImage() {
  return useClientMutation("product_images", "delete", {
    invalidateQueries: [["product_images", "by_product"]],
    primaryKey: "id",
  })
}
