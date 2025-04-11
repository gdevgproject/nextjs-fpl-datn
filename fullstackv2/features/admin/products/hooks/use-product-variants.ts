"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"
import { useClientMutation } from "@/shared/hooks/use-client-mutation"

// Hook to fetch variants for a specific product
export function useProductVariants(productId: number | null) {
  return useClientFetch(
    ["product_variants", "by_product", productId],
    "product_variants",
    {
      columns: "id, product_id, volume_ml, price, sale_price, sku, stock_quantity, deleted_at",
      filters: (query) => {
        let q = query
        if (productId) {
          q = q.eq("product_id", productId).is("deleted_at", null)
        }
        return q
      },
      sort: [{ column: "volume_ml", ascending: true }],
    },
    {
      // Only fetch if productId is provided
      enabled: !!productId,
    },
  )
}

// Hook to create a new product variant
export function useCreateProductVariant() {
  return useClientMutation("product_variants", "insert", {
    invalidateQueries: [["product_variants", "by_product"]],
    primaryKey: "id",
  })
}

// Hook to update an existing product variant
export function useUpdateProductVariant() {
  return useClientMutation("product_variants", "update", {
    invalidateQueries: [["product_variants", "by_product"]],
    primaryKey: "id",
  })
}

// Hook to delete a product variant (soft delete)
export function useDeleteProductVariant() {
  const deleteVariantMutation = useClientMutation("product_variants", "update", {
    invalidateQueries: [["product_variants", "by_product"]],
    primaryKey: "id",
  })

  return {
    ...deleteVariantMutation,
    softDelete: async (variantId: number) => {
      try {
        return await deleteVariantMutation.mutateAsync({
          id: variantId,
          deleted_at: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Error soft deleting product variant:", error)
        throw error
      }
    },
    restore: async (variantId: number) => {
      try {
        return await deleteVariantMutation.mutateAsync({
          id: variantId,
          deleted_at: null,
        })
      } catch (error) {
        console.error("Error restoring product variant:", error)
        throw error
      }
    },
  }
}
