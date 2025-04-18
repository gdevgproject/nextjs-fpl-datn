"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface DiscountsFilters {
  search?: string
}

interface DiscountsPagination {
  page: number
  pageSize: number
}

interface DiscountsSort {
  column: string
  direction: "asc" | "desc"
}

export function useDiscounts(filters?: DiscountsFilters, pagination?: DiscountsPagination, sort?: DiscountsSort) {
  return useClientFetch(["discounts", "list", filters, pagination, sort], "discounts", {
    columns: `id, code, description, start_date, end_date, max_uses, remaining_uses, min_order_value, max_discount_amount, discount_percentage, is_active, created_at, updated_at`,
    filters: (query) => {
      let q = query

      // Apply search filter
      if (filters?.search) {
        q = q.or(`code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
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
      : [{ column: "created_at", ascending: false }], // Default sort by creation date (newest first)
    // Enable exact count for pagination
    count: "exact",
  })
}
