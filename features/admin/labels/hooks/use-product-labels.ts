import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface ProductLabelsFilters {
  search?: string
}

interface ProductLabelsPagination {
  page: number
  pageSize: number
}

interface ProductLabelsSort {
  column: string
  direction: "asc" | "desc"
}

export function useProductLabels(
  filters?: ProductLabelsFilters,
  pagination?: ProductLabelsPagination,
  sort?: ProductLabelsSort,
) {
  return useClientFetch(["product_labels", "list", filters, pagination, sort], "product_labels", {
    columns: `id, name, color_code, created_at, updated_at`,
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
