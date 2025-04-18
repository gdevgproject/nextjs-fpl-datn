"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"
import { useClientMutation } from "@/shared/hooks/use-client-mutation"
import { useClientBatchMutation } from "@/shared/hooks/use-client-batch-mutation"

// Hook to fetch ingredients for a specific product
export function useProductIngredients(productId: number | null) {
  return useClientFetch(
    ["product_ingredients", "by_product", productId],
    "product_ingredients",
    {
      columns: "id, product_id, ingredient_id, scent_type, ingredients:ingredient_id(id, name)",
      filters: (query) => {
        let q = query
        if (productId) {
          q = q.eq("product_id", productId)
        }
        return q
      },
      sort: [
        // Order by scent type (top, middle, base)
        {
          column: "scent_type",
          ascending: true,
          // Custom ordering for scent types
          // This is a workaround since we can't use CASE in Supabase JS client
          // We'll sort them in the component instead
        },
      ],
    },
    {
      // Only fetch if productId is provided
      enabled: !!productId,
    },
  )
}

// Hook to add an ingredient to a product
export function useAddProductIngredient() {
  return useClientMutation("product_ingredients", "insert", {
    invalidateQueries: [["product_ingredients", "by_product"]],
    primaryKey: "id",
  })
}

// Hook to remove an ingredient from a product
export function useRemoveProductIngredient() {
  return useClientMutation("product_ingredients", "delete", {
    invalidateQueries: [["product_ingredients", "by_product"]],
    primaryKey: "id",
  })
}

// Hook to update all ingredients for a product (batch operation)
export function useUpdateProductIngredients() {
  const batchMutation = useClientBatchMutation()

  return {
    updateIngredients: async (
      productId: number,
      ingredients: Array<{ ingredientId: number; scentType: "top" | "middle" | "base" }>,
    ) => {
      try {
        // First, delete all existing ingredient associations
        await batchMutation.mutateAsync({
          operations: [
            {
              type: "delete",
              table: "product_ingredients",
              filters: (query) => query.eq("product_id", productId),
            },
          ],
        })

        // Then, insert new ingredient associations
        if (ingredients.length > 0) {
          const ingredientInserts = ingredients.map((item) => ({
            product_id: productId,
            ingredient_id: item.ingredientId,
            scent_type: item.scentType,
          }))

          await batchMutation.mutateAsync({
            operations: [
              {
                type: "insert",
                table: "product_ingredients",
                data: ingredientInserts,
              },
            ],
          })
        }

        return { success: true }
      } catch (error) {
        console.error("Error updating product ingredients:", error)
        throw error
      }
    },
  }
}
