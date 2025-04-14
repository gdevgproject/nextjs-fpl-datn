import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware"
import { getUserRoleFromMetadata } from "@/lib/utils/auth-utils"

export async function adminMiddleware(req: NextRequest) {
  const { supabase, res } = await createSupabaseMiddlewareClient(req)

  // Kiểm tra session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Nếu không có session, chuyển hướng đến trang đăng nhập
  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = "/dang-nhap"
    url.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Lấy role từ app_metadata
  const role = getUserRoleFromMetadata(session.user)

  // Chỉ cho phép admin và staff truy cập
  if (role !== "admin" && role !== "staff") {
    const url = req.nextUrl.clone()
    url.pathname = "/khong-co-quyen"
    return NextResponse.redirect(url)
  }

  return res
}

