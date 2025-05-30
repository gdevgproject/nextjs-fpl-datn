import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "./lib/supabase/middleware";
import { getUserRoleFromMetadata, canAccessPage } from "./lib/utils/auth-utils";

export async function middleware(req: NextRequest) {
  const { supabase, res } = await createSupabaseMiddlewareClient(req);

  // Check session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get current URL
  const url = req.nextUrl.clone();
  const { pathname } = url;

  // Check if it's an auth callback
  const isAuthCallback = pathname.startsWith("/api/auth/callback");

  // If it's a callback, allow access
  if (isAuthCallback) {
    return res;
  }

  // Check if there's auth_action=email_confirmed in query params
  const hasEmailConfirmed =
    url.searchParams.get("auth_action") === "email_confirmed";

  // Nếu không có session và truy cập trang bảo vệ
  if (!session) {
    // Nếu truy cập trang tài khoản sau khi xác nhận email, cho phép tạm thời
    if (pathname.startsWith("/tai-khoan") && hasEmailConfirmed) {
      // Cho phép một khoảng thời gian ngắn để cập nhật trạng thái xác thực
      return res;
    }

    // Thay đổi điều kiện chuyển hướng
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/tai-khoan") ||
      pathname.startsWith("/shipper")
    ) {
      url.pathname = "/dang-nhap";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Xử lý riêng cho trang thanh toán
    if (pathname.startsWith("/thanh-toan")) {
      // Kiểm tra xem giỏ hàng có trống không (có thể thực hiện ở client-side)
      // Nếu không có session, vẫn cho phép truy cập trang thanh toán
      // Việc kiểm tra giỏ hàng trống sẽ được xử lý trong component CheckoutPage
      return res;
    }

    // Cho phép truy cập vào các trang công khai
    return res;
  }

  // If session exists, determine role from app_metadata
  const role = getUserRoleFromMetadata(session.user);

  // Check access permission for the page
  if (!canAccessPage(role, pathname)) {
    url.pathname = "/khong-co-quyen";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login/register pages
  if (
    (pathname.startsWith("/dang-nhap") || pathname.startsWith("/dang-ky")) &&
    session
  ) {
    const redirectTo = url.searchParams.get("redirect") || "/";
    url.pathname = redirectTo;
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/tai-khoan/:path*",
    "/shipper/:path*",
    "/dang-nhap",
    "/dang-ky",
    "/thanh-toan/:path*",
    "/api/auth/callback",
  ],
};
