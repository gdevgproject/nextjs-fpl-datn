"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./use-debounce";
import { useState, useEffect } from "react";
import {
  fetchAdminActivityLogs,
  fetchActivityTypes,
  fetchEntityTypes,
} from "../services";
import type {
  AdminActivityLogsFilters,
  AdminActivityLogsPagination,
  AdminActivityLogsSort,
} from "../types";
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config";

/**
 * Hook để lấy dữ liệu nhật ký hoạt động admin
 */
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
    queryKey: ["admin_activity_log", debouncedFilters, pagination, sort],
    queryFn: () => fetchAdminActivityLogs(debouncedFilters, pagination, sort),
    staleTime: QUERY_STALE_TIME.USER, // 5 phút - định nghĩa trong use-query-config.ts
    keepPreviousData: true, // Giữ dữ liệu cũ khi đang tải trang mới
  });
}

/**
 * Hook để lấy danh sách các loại hoạt động duy nhất
 */
export function useActivityTypes() {
  return useQuery({
    queryKey: ["admin_activity_types"],
    queryFn: fetchActivityTypes,
    staleTime: QUERY_STALE_TIME.CATEGORY, // 30 phút - định nghĩa trong use-query-config.ts
  });
}

/**
 * Hook để lấy danh sách các loại đối tượng duy nhất
 */
export function useEntityTypes() {
  return useQuery({
    queryKey: ["admin_entity_types"],
    queryFn: fetchEntityTypes,
    staleTime: QUERY_STALE_TIME.CATEGORY, // 30 phút - định nghĩa trong use-query-config.ts
  });
}
