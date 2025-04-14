"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface PaymentMethodsFilters {
  search?: string
}

interface PaymentMethodsPagination {
  page: number
  pageSize: number
}

interface PaymentMethodsSort {
  column: string
  direction: "asc" | "desc"
}

export function usePaymentMethods(
  filters?: PaymentMethodsFilters,
  pagination?: PaymentMethodsPagination,
  sort?: PaymentMethodsSort,
) {
  return useClientFetch(["payment-methods", "list", filters, pagination, sort], "payment_methods", {
    columns: `id, name, description, is_active`,
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
