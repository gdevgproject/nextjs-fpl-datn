import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  // Xử lý lỗi session nếu có
  if (sessionError) {
    console.error("Session error in middleware:", sessionError);
    // Chuyển hướng đến trang đăng nhập nếu có lỗi session
    if (
      req.nextUrl.pathname !== "/dang-nhap" &&
      req.nextUrl.pathname !== "/dang-ky" &&
      req.nextUrl.pathname !== "/quen-mat-khau"
    ) {
      const redirectUrl = new URL("/dang-nhap", req.url);
      redirectUrl.searchParams.set("error", "session_invalid");
      redirectUrl.searchParams.set(
        "error_description",
        "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Check if user is authenticated
  const isAuthenticated = !!session;

  // Protected routes that require authentication
  const authProtectedPaths = ["/tai-khoan", "/gio-hang/thanh-toan"];

  // Admin protected routes
  const adminProtectedPaths = ["/admin"];

  const path = req.nextUrl.pathname;

  // Check if the current path is protected
  const isAuthProtected = authProtectedPaths.some(
    (protectedPath) =>
      path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  const isAdminProtected = adminProtectedPaths.some(
    (protectedPath) =>
      path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  // Redirect to login if trying to access protected route without authentication
  if (isAuthProtected && !isAuthenticated) {
    const redirectUrl = new URL("/dang-nhap", req.url);
    redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check admin/staff role for admin protected routes
  if (isAdminProtected && isAuthenticated) {
    try {
      // Call RPC function to check if user is admin or staff
      const { data: isStaff, error: roleError } = await supabase.rpc(
        "is_staff"
      );

      // Xử lý trường hợp tài khoản bị xóa
      if (
        roleError &&
        (roleError.message.includes("user does not exist") ||
          roleError.message.includes("JWT subject not found"))
      ) {
        // Đăng xuất người dùng và chuyển hướng đến trang đăng nhập
        await supabase.auth.signOut();
        const redirectUrl = new URL("/dang-nhap", req.url);
        redirectUrl.searchParams.set("error", "account_deleted");
        redirectUrl.searchParams.set(
          "error_description",
          "Tài khoản của bạn không còn tồn tại hoặc đã bị vô hiệu hóa"
        );
        return NextResponse.redirect(redirectUrl);
      }

      if (!isStaff) {
        // Redirect to unauthorized page
        return NextResponse.redirect(
          new URL("/khong-co-quyen-truy-cap", req.url)
        );
      }
    } catch (error) {
      console.error("Error checking staff role:", error);
      // Chuyển hướng đến trang đăng nhập nếu có lỗi
      const redirectUrl = new URL("/dang-nhap", req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect to home if trying to access auth pages while authenticated
  if (
    isAuthenticated &&
    (path === "/dang-nhap" || path === "/dang-ky" || path === "/quen-mat-khau")
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
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
};
