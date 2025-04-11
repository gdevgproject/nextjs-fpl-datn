"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface PerfumeTypesFilters {
  search?: string
}

interface PerfumeTypesPagination {
  page: number
  pageSize: number
}

interface PerfumeTypesSort {
  column: string
  direction: "asc" | "desc"
}

export function usePerfumeTypes(
  filters?: PerfumeTypesFilters,
  pagination?: PerfumeTypesPagination,
  sort?: PerfumeTypesSort,
) {
  return useClientFetch(["perfume_types", "list", filters, pagination, sort], "perfume_types", {
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
