"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface GendersFilters {
  search?: string
}

interface GendersPagination {
  page: number
  pageSize: number
}

interface GendersSort {
  column: string
  direction: "asc" | "desc"
}

export function useGenders(filters?: GendersFilters, pagination?: GendersPagination, sort?: GendersSort) {
  return useClientFetch(["genders", "list", filters, pagination, sort], "genders", {
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
