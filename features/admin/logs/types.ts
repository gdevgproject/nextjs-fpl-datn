/**
 * Kiểu dữ liệu cho filter trong hoạt động admin
 */
export interface AdminActivityLogsFilters {
  search?: string;
  activityType?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  adminUserId?: string;
}

/**
 * Kiểu dữ liệu cho phân trang hoạt động admin
 */
export interface AdminActivityLogsPagination {
  page: number;
  pageSize: number;
}

/**
 * Kiểu dữ liệu cho sắp xếp hoạt động admin
 */
export interface AdminActivityLogsSort {
  column: string;
  direction: "asc" | "desc";
}

/**
 * Kiểu dữ liệu cho một bản ghi hoạt động admin
 */
export interface AdminActivityLog {
  id: number;
  admin_user_id: string;
  activity_type: string;
  entity_type: string;
  entity_id?: string | null;
  description: string;
  details?: any; // JSON data
  timestamp: string;
}

/**
 * Kết quả trả về từ query hoạt động admin
 */
export interface AdminActivityLogsResult {
  data: AdminActivityLog[];
  count: number;
}
