"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface BrandsFilters {
  search?: string
}

interface BrandsPagination {
  page: number
  pageSize: number
}

interface BrandsSort {
  column: string
  direction: "asc" | "desc"
}

export function useBrands(filters?: BrandsFilters, pagination?: BrandsPagination, sort?: BrandsSort) {
  return useClientFetch(["brands", "list", filters, pagination, sort], "brands", {
    columns: `id, name, description, logo_url, created_at, updated_at`,
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
