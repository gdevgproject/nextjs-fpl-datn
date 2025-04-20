"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  AdminActivityLogsFilters,
  AdminActivityLogsPagination,
  AdminActivityLogsSort,
  AdminActivityLogsResult,
  AdminActivityLog,
} from "./types";

/**
 * Lấy danh sách hoạt động admin với filter, phân trang và sắp xếp
 * Hàm này đóng gói logic truy vấn Supabase để tách biệt khỏi hook.
 */
export async function fetchAdminActivityLogs(
  filters?: AdminActivityLogsFilters,
  pagination?: AdminActivityLogsPagination,
  sort?: AdminActivityLogsSort
): Promise<AdminActivityLogsResult> {
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
  if (filters?.search) {
    query = query.or(
      `description.ilike.%${filters.search}%,entity_id.ilike.%${filters.search}%`
    );
  }

  // Apply activity type filter
  if (filters?.activityType && filters?.activityType !== "all") {
    query = query.ilike("activity_type", `%${filters.activityType}%`);
  }

  // Apply entity type filter
  if (filters?.entityType && filters?.entityType !== "all") {
    query = query.eq("entity_type", filters.entityType);
  }

  // Apply date range filter
  if (filters?.startDate) {
    query = query.gte("timestamp", filters.startDate);
  }

  if (filters?.endDate) {
    // Add one day to include the end date fully
    const endDate = new Date(filters.endDate);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt("timestamp", endDate.toISOString());
  }

  // Apply admin user filter
  if (filters?.adminUserId) {
    query = query.eq("admin_user_id", filters.adminUserId);
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
    data: data as AdminActivityLog[],
    count: count || 0,
  };
}

/**
 * Lấy tất cả loại hoạt động từ dữ liệu logs
 */
export async function fetchActivityTypes(): Promise<string[]> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("admin_activity_log")
    .select("activity_type")
    .limit(100); // Giới hạn để tránh quá tải

  if (error) {
    console.error("Error fetching activity types:", error);
    throw error;
  }

  // Lọc các giá trị duy nhất
  const uniqueTypes = [...new Set(data.map((item) => item.activity_type))];
  return uniqueTypes.sort();
}

/**
 * Lấy tất cả loại đối tượng từ dữ liệu logs
 */
export async function fetchEntityTypes(): Promise<string[]> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("admin_activity_log")
    .select("entity_type")
    .limit(100); // Giới hạn để tránh quá tải

  if (error) {
    console.error("Error fetching entity types:", error);
    throw error;
  }

  // Lọc các giá trị duy nhất
  const uniqueTypes = [...new Set(data.map((item) => item.entity_type))];
  return uniqueTypes.sort();
}
