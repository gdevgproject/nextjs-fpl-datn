"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"
import { useDebounce } from "./use-debounce"
import { useState, useEffect } from "react"

export interface AdminActivityLogsFilters {
  search?: string
  activityType?: string
  entityType?: string
  startDate?: string
  endDate?: string
  adminUserId?: string
}

export interface AdminActivityLogsPagination {
  page: number
  pageSize: number
}

export interface AdminActivityLogsSort {
  column: string
  direction: "asc" | "desc"
}

export function useAdminActivityLogs(
  filters?: AdminActivityLogsFilters,
  pagination?: AdminActivityLogsPagination,
  sort?: AdminActivityLogsSort,
) {
  const [debouncedFilters, setDebouncedFilters] = useState(filters)
  const debouncedSearch = useDebounce(filters?.search, 500)

  useEffect(() => {
    setDebouncedFilters({
      ...filters,
      search: debouncedSearch,
    })
  }, [filters, debouncedSearch])

  return useClientFetch(["admin_activity_log", "list", debouncedFilters, pagination, sort], "admin_activity_log", {
    columns: `
      id, 
      admin_user_id, 
      activity_type, 
      description, 
      entity_type, 
      entity_id, 
      details, 
      timestamp
    `,
    filters: (query) => {
      let q = query

      // Apply search filter
      if (debouncedFilters?.search) {
        q = q.or(`description.ilike.%${debouncedFilters.search}%,entity_id.ilike.%${debouncedFilters.search}%`)
      }

      // Apply activity type filter
      if (debouncedFilters?.activityType && debouncedFilters?.activityType !== "all") {
        q = q.ilike("activity_type", `%${debouncedFilters.activityType}%`)
      }

      // Apply entity type filter
      if (debouncedFilters?.entityType && debouncedFilters?.entityType !== "all") {
        q = q.eq("entity_type", debouncedFilters.entityType)
      }

      // Apply date range filter
      if (debouncedFilters?.startDate) {
        q = q.gte("timestamp", debouncedFilters.startDate)
      }
      if (debouncedFilters?.endDate) {
        // Add one day to include the end date fully
        const endDate = new Date(debouncedFilters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        q = q.lt("timestamp", endDate.toISOString())
      }

      // Apply admin user filter
      if (debouncedFilters?.adminUserId) {
        q = q.eq("admin_user_id", debouncedFilters.adminUserId)
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
      : [{ column: "timestamp", ascending: false }], // Default sort by timestamp desc
    // Enable exact count for pagination
    count: "exact",
  })
}
