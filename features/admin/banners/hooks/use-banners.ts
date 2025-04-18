"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface BannersFilters {
  search?: string
  isActive?: boolean
}

interface BannersPagination {
  page: number
  pageSize: number
}

interface BannersSort {
  column: string
  direction: "asc" | "desc"
}

export function useBanners(filters?: BannersFilters, pagination?: BannersPagination, sort?: BannersSort) {
  return useClientFetch(["banners", "list", filters, pagination, sort], "banners", {
    columns: `id, title, subtitle, image_url, link_url, is_active, display_order, start_date, end_date, created_at, updated_at`,
    filters: (query) => {
      let q = query

      // Apply search filter
      if (filters?.search) {
        q = q.ilike("title", `%${filters.search}%`)
      }

      // Apply active filter
      if (filters?.isActive !== undefined) {
        q = q.eq("is_active", filters.isActive)
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
