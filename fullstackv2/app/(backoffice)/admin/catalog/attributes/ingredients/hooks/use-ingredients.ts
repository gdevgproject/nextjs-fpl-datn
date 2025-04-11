"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface IngredientsFilters {
  search?: string
}

interface IngredientsPagination {
  page: number
  pageSize: number
}

interface IngredientsSort {
  column: string
  direction: "asc" | "desc"
}

export function useIngredients(
  filters?: IngredientsFilters,
  pagination?: IngredientsPagination,
  sort?: IngredientsSort,
) {
  return useClientFetch(["ingredients", "list", filters, pagination, sort], "ingredients", {
    columns: `id, name, created_at, updated_at`,
    filters: (query) => {
      let q = query

      // Apply search filter
      if (filters?.search) {
        q = q.ilike("name", `%${filters.search}%`)
      }

      return q
    },
    // Apply pagination
    pagination: pagination
      ? {
          page: pagination.page,
          pageSize: pagination.pageSize,
        }
      : undefined,
    // Apply sorting
    sort: sort
      ? [
          {
            column: sort.column,
            ascending: sort.direction === "asc",
          },
        ]
      : [{ column: "name", ascending: true }],
    // Enable exact count for pagination
    count: "exact",
  })
}
