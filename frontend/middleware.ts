// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res })

  // Refresh the user's session to ensure it's up-to-date
  const {
    data: { session }
  } = await supabase.auth.getSession()
  const user = session?.user

  // if user is signed in and the current path is / redirect the user to /account
  // if (user && req.nextUrl.pathname === '/') {
  //     return NextResponse.redirect(new URL('/account', req.url))
  // }

  // Xác định các đường dẫn admin (dựa trên cấu trúc thư mục của bạn)
  const adminPaths = [
    '/admin',
    '/admin/brands',
    '/admin/categories',
    '/admin/orders',
    '/admin/orders/[id]', // Path parameter
    '/admin/products',
    '/admin/products/new',
    '/admin/products/[id]', // Path parameter
    '/admin/products/[id]/edit', // Path parameter
    '/admin/settings',
    '/admin/users',
    '/admin/users/[id]', // Path parameter
    '/admin/users/[id]/edit' // Path parameter
    // Các trang admin khác...
  ]

  // Hàm kiểm tra xem đường dẫn hiện tại có phải là trang admin không
  const isAdminPath = (pathname: string) => {
    return adminPaths.some((path) => {
      // Xử lý path parameters (ví dụ: /admin/products/[id])
      if (path.includes('[id]')) {
        const base = path.substring(0, path.indexOf('[id]'))
        return (
          pathname.startsWith(base) &&
          pathname.split('/').length === base.split('/').length
        )
      }
      return pathname === path || pathname.startsWith(path + '/')
    })
  }

  // if user is not signed in and the current path is /auth, let the request through
  if (!user && req.nextUrl.pathname.startsWith('/auth')) {
    return res // Allow access to /auth routes
  }

  // if user is not signed in and the current path is not / redirect the user to /
  if (!user && !req.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // if user is not admin and the current path is admin page. Redirect to 403 page
  const isAdmin = user
    ? (
        await supabase
          .from('users')
          .select('role_id')
          .eq('id', user.id)
          .single()
      ).data?.role_id === 'admin'
    : false

  if (user && !isAdmin && isAdminPath(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/403', req.url)) // Hoặc trang thông báo lỗi
  }
  // if user is not signed in and the current path is /dashboard -> redirect to login page
  if (req.nextUrl.pathname === '/dashboard' && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
