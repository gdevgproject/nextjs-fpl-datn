"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useDebounce } from "./use-debounce";
import { useState, useEffect } from "react";

export interface AdminActivityLogsFilters {
  search?: string;
  activityType?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  adminUserId?: string;
}

export interface AdminActivityLogsPagination {
  page: number;
  pageSize: number;
}

export interface AdminActivityLogsSort {
  column: string;
  direction: "asc" | "desc";
}

export function useAdminActivityLogs(
  filters?: AdminActivityLogsFilters,
  pagination?: AdminActivityLogsPagination,
  sort?: AdminActivityLogsSort
) {
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const debouncedSearch = useDebounce(filters?.search, 500);

  useEffect(() => {
    setDebouncedFilters({
      ...filters,
      search: debouncedSearch,
    });
  }, [filters, debouncedSearch]);

  return useQuery({
    queryKey: [
      "admin_activity_log",
      "list",
      debouncedFilters,
      pagination,
      sort,
    ],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      // Xây dựng truy vấn cơ bản
      let query = supabase.from("admin_activity_log").select(
        `
          id, 
          admin_user_id, 
          activity_type, 
          description, 
          entity_type, 
          entity_id, 
          details, 
          timestamp
        `,
        { count: "exact" }
      );

      // Apply search filter
      if (debouncedFilters?.search) {
        query = query.or(
          `description.ilike.%${debouncedFilters.search}%,entity_id.ilike.%${debouncedFilters.search}%`
        );
      }

      // Apply activity type filter
      if (
        debouncedFilters?.activityType &&
        debouncedFilters?.activityType !== "all"
      ) {
        query = query.ilike(
          "activity_type",
          `%${debouncedFilters.activityType}%`
        );
      }

      // Apply entity type filter
      if (
        debouncedFilters?.entityType &&
        debouncedFilters?.entityType !== "all"
      ) {
        query = query.eq("entity_type", debouncedFilters.entityType);
      }

      // Apply date range filter
      if (debouncedFilters?.startDate) {
        query = query.gte("timestamp", debouncedFilters.startDate);
      }

      if (debouncedFilters?.endDate) {
        // Add one day to include the end date fully
        const endDate = new Date(debouncedFilters.endDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt("timestamp", endDate.toISOString());
      }

      // Apply admin user filter
      if (debouncedFilters?.adminUserId) {
        query = query.eq("admin_user_id", debouncedFilters.adminUserId);
      }

      // Apply sorting
      const sortColumn = sort?.column || "timestamp";
      const sortAscending = sort?.direction === "asc";
      query = query.order(sortColumn, { ascending: sortAscending });

      // Apply pagination
      if (pagination) {
        const { page, pageSize } = pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      // Execute the query
      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching admin activity logs:", error);
        throw error;
      }

      return {
        data,
        count,
      };
    },
    staleTime: 1000 * 60, // 1 minute
  });
}
