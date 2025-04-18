"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"
import { useClientMutation } from "@/shared/hooks/use-client-mutation"
import { useClientBatchMutation } from "@/shared/hooks/use-client-batch-mutation"
import { useCallback } from "react"

// Hook to fetch categories for a specific product
export function useProductCategories(productId: number | null) {
  return useClientFetch(
    ["product_categories", "by_product", productId],
    "product_categories",
    {
      columns: "id, product_id, category_id, categories:category_id(id, name)",
      filters: (query) => {
        let q = query
        if (productId) {
          q = q.eq("product_id", productId)
        }
        return q
      },
    },
    {
      // Only fetch if productId is provided
      enabled: !!productId,
    },
  )
}

// Hook to add a category to a product
export function useAddProductCategory() {
  return useClientMutation("product_categories", "insert", {
    invalidateQueries: [["product_categories", "by_product"]],
    primaryKey: "id",
  })
}

// Hook to remove a category from a product
export function useRemoveProductCategory() {
  return useClientMutation("product_categories", "delete", {
    invalidateQueries: [["product_categories", "by_product"]],
    primaryKey: "id",
  })
}

// Hook to update all categories for a product (batch operation)
export function useUpdateProductCategories() {
  const batchMutation = useClientBatchMutation()

  const updateCategories = useCallback(
    async (productId: number, categoryIds: number[]) => {
      try {
        // First, delete all existing category associations
        await batchMutation.mutateAsync({
          operations: [
            {
              type: "delete",
              table: "product_categories",
              filters: (query) => query.eq("product_id", productId),
            },
          ],
        })

        // Then, insert new category associations
        if (categoryIds.length > 0) {
          const categoryInserts = categoryIds.map((categoryId) => ({
            product_id: productId,
            category_id: categoryId,
          }))

          await batchMutation.mutateAsync({
            operations: [
              {
                type: "insert",
                table: "product_categories",
                data: categoryInserts,
              },
            ],
          })
        }

        return { success: true }
      } catch (error) {
        console.error("Error updating product categories:", error)
        throw error
      }
    },
    [batchMutation],
  )

  return { updateCategories }
}
