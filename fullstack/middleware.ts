import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddlewareClient } from "./lib/supabase/middleware"
import { getUserRoleFromMetadata, canAccessPage } from "./lib/utils/auth-utils"

export async function middleware(req: NextRequest) {
  const { supabase, res } = await createSupabaseMiddlewareClient(req)

  // Check session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get current URL
  const url = req.nextUrl.clone()
  const { pathname } = url

  // Check if it's an auth callback
  const isAuthCallback = pathname.startsWith("/api/auth/callback")

  // If it's a callback, allow access
  if (isAuthCallback) {
    return res
  }

  // Check if there's auth_action=email_confirmed in query params
  const hasEmailConfirmed = url.searchParams.get("auth_action") === "email_confirmed"

  // Nếu không có session và truy cập trang bảo vệ
  if (!session) {
    // Nếu truy cập trang tài khoản sau khi xác nhận email, cho phép tạm thời
    if (pathname.startsWith("/tai-khoan") && hasEmailConfirmed) {
      // Cho phép một khoảng thời gian ngắn để cập nhật trạng thái xác thực
      return res
    }

    if (pathname.startsWith("/admin") || pathname.startsWith("/tai-khoan") || pathname.startsWith("/thanh-toan")) {
      url.pathname = "/dang-nhap"
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    // Cho phép truy cập vào các trang công khai
    return res
  }

  // If session exists, determine role from app_metadata
  const role = getUserRoleFromMetadata(session.user)

  // Bảo vệ trang admin - chỉ cho phép admin và staff truy cập
  if (pathname.startsWith("/admin")) {
    // Kiểm tra xem người dùng có phải admin hoặc staff không
    if (role !== "admin" && role !== "staff") {
      url.pathname = "/khong-co-quyen"
      return NextResponse.redirect(url)
    }
  }

  // Check access permission for the page
  if (!canAccessPage(role, pathname)) {
    url.pathname = "/khong-co-quyen"
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from login/register pages
  if ((pathname.startsWith("/dang-nhap") || pathname.startsWith("/dang-ky")) && session) {
    const redirectTo = url.searchParams.get("redirect") || "/"
    url.pathname = redirectTo
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*", "/tai-khoan/:path*", "/dang-nhap", "/dang-ky", "/thanh-toan/:path*", "/api/auth/callback"],
}

