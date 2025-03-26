import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if user is authenticated
  const isAuthenticated = !!session

  // Protected routes that require authentication
  const authProtectedPaths = ["/tai-khoan", "/gio-hang/thanh-toan"]

  // Admin protected routes
  const adminProtectedPaths = ["/admin"]

  const path = req.nextUrl.pathname

  // Check if the current path is protected
  const isAuthProtected = authProtectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
  )

  const isAdminProtected = adminProtectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
  )

  // Redirect to login if trying to access protected route without authentication
  if (isAuthProtected && !isAuthenticated) {
    const redirectUrl = new URL("/dang-nhap", req.url)
    redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check admin/staff role for admin protected routes
  if (isAdminProtected && isAuthenticated) {
    // Call RPC function to check if user is admin or staff
    const { data: isStaff } = await supabase.rpc("is_staff")

    if (!isStaff) {
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL("/khong-co-quyen-truy-cap", req.url))
    }
  }

  // Redirect to home if trying to access auth pages while authenticated
  if (isAuthenticated && (path === "/dang-nhap" || path === "/dang-ky" || path === "/quen-mat-khau")) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return res
}

export const config = {
  matcher: [
    "/tai-khoan/:path*",
    "/admin/:path*",
    "/gio-hang/thanh-toan/:path*",
    "/dang-nhap",
    "/dang-ky",
    "/quen-mat-khau",
  ],
}

