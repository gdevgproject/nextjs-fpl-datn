"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface ConcentrationsFilters {
  search?: string
}

interface ConcentrationsPagination {
  page: number
  pageSize: number
}

interface ConcentrationsSort {
  column: string
  direction: "asc" | "desc"
}

export function useConcentrations(
  filters?: ConcentrationsFilters,
  pagination?: ConcentrationsPagination,
  sort?: ConcentrationsSort,
) {
  return useClientFetch(["concentrations", "list", filters, pagination, sort], "concentrations", {
    columns: `id, name, description, created_at, updated_at`,
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
