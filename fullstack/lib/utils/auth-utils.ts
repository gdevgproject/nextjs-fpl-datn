import type { User } from "@supabase/supabase-js"
import type { UserRole } from "../types/shared.types"

/**
 * Lấy role từ app_metadata của user
 * Đây là cách tiếp cận đúng theo sql.txt (Approach 2)
 */
export function getUserRoleFromMetadata(user: User | null): UserRole {
  if (!user) return "anon"

  const appMetadata = user.app_metadata
  if (appMetadata && appMetadata.role) {
    if (appMetadata.role === "admin") return "admin"
    if (appMetadata.role === "staff") return "staff"
  }

  return "authenticated"
}

/**
 * Kiểm tra xem user có quyền admin không
 */
export function isAdmin(role: UserRole): boolean {
  return role === "admin"
}

/**
 * Kiểm tra xem user có quyền staff hoặc admin không
 */
export function isStaff(role: UserRole): boolean {
  return role === "admin" || role === "staff"
}

/**
 * Kiểm tra xem user có quyền truy cập vào một trang cụ thể không
 */
export function canAccessPage(role: UserRole, page: string): boolean {
  // Trang admin chỉ cho admin và staff
  if (page.startsWith("/admin")) {
    return isStaff(role)
  }

  // Trang tài khoản chỉ cho người dùng đã đăng nhập
  if (page.startsWith("/tai-khoan")) {
    return role !== "anon"
  }

  // Các trang khác cho tất cả
  return true
}

/**
 * Lấy redirect URL sau khi đăng nhập
 */
export function getRedirectUrl(role: UserRole, requestedPath?: string): string {
  // Nếu có requestedPath và user có quyền truy cập, redirect đến đó
  if (requestedPath && canAccessPage(role, requestedPath)) {
    return requestedPath
  }

  // Mặc định: admin/staff -> trang admin, user -> trang chủ
  if (isAdmin(role) || isStaff(role)) return "/admin"
  return "/"
}

