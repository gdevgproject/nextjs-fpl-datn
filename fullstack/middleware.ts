import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

/**
 * Middleware for authentication and authorization checks
 */
export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client for the middleware
    const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })

    // Refresh the session if it exists
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    // Get the pathname from the request
    const { pathname } = request.nextUrl

    // Auth routes that should redirect to dashboard if already logged in
    const authRoutes = ["/dang-nhap", "/dang-ky", "/quen-mat-khau"]

    // Protected routes that require authentication
    const protectedRoutes = ["/tai-khoan", "/gio-hang/thanh-toan"]

    // Admin routes that require admin role
    const adminRoutes = ["/admin"]

    // Check if the current route is an auth route
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

    // Check if the current route is a protected route
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    // Check if the current route is an admin route
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

    // If user is logged in and trying to access auth routes, redirect to dashboard
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL("/tai-khoan/thong-tin", request.url))
    }

    // If user is not logged in and trying to access protected routes, redirect to login
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL("/dang-nhap", request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is trying to access admin routes, check if they are an admin
    if (isAdminRoute) {
      if (!session) {
        // Not logged in, redirect to login
        const redirectUrl = new URL("/dang-nhap", request.url)
        redirectUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(redirectUrl)
      }

      try {
        // Check if the user is an admin using the RPC function
        const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin")

        if (adminError || !isAdmin) {
          // Not an admin, redirect to unauthorized page
          return NextResponse.redirect(new URL("/khong-co-quyen-truy-cap", request.url))
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        // On error, redirect to unauthorized page
        return NextResponse.redirect(new URL("/khong-co-quyen-truy-cap", request.url))
      }
    }

    // Continue with the request for all other cases
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // On error, continue with the request but log the error
    return NextResponse.next()
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Auth routes
    "/dang-nhap",
    "/dang-ky",
    "/quen-mat-khau",
    "/dat-lai-mat-khau",
    // Protected routes
    "/tai-khoan/:path*",
    "/gio-hang/thanh-toan",
    // Admin routes
    "/admin/:path*",
  ],
}

