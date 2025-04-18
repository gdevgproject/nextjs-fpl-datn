"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface CategoriesFilters {
  search?: string
}

interface CategoriesPagination {
  page: number
  pageSize: number
}

interface CategoriesSort {
  column: string
  direction: "asc" | "desc"
}

export function useCategories(filters?: CategoriesFilters, pagination?: CategoriesPagination, sort?: CategoriesSort) {
  return useClientFetch(["categories", "list", filters, pagination, sort], "categories", {
    columns: `id, name, description, image_url, is_featured, display_order, parent_category_id, created_at, updated_at, slug`,
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
      : [{ column: "display_order", ascending: true }],
    // Enable exact count for pagination
    count: "exact",
  })
}
