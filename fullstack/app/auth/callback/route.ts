import { createServerSupabaseClient } from "@/lib/supabase/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

// Cập nhật xử lý callback để phản ánh cấu hình URL chuyển hướng
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  // Mặc định chuyển hướng về trang chủ nếu không có tham số next
  const next = requestUrl.searchParams.get("next") || "/"

  // Xác định loại yêu cầu dựa trên tham số và URL
  const type = requestUrl.searchParams.get("type")

  console.log("Auth callback received:", { code, type, next, url: requestUrl.href })

  // Xử lý yêu cầu đặt lại mật khẩu
  if (code && (type === "recovery" || requestUrl.href.includes("type=recovery"))) {
    console.log("Xử lý yêu cầu đặt lại mật khẩu")
    // Thêm tham số type=recovery để component biết đây là yêu cầu đặt lại mật khẩu
    return NextResponse.redirect(new URL(`/dat-lai-mat-khau?code=${code}&type=recovery`, requestUrl.origin))
  }

  // Xử lý magic link đăng nhập
  if (code && !type) {
    console.log("Xử lý magic link đăng nhập")
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (data?.session) {
      // Đăng nhập thành công, chuyển hướng đến trang chủ hoặc trang được yêu cầu
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }

    if (error) {
      // Nếu có lỗi, chuyển hướng đến trang đăng nhập với thông báo lỗi
      const loginUrl = new URL("/dang-nhap", requestUrl.origin)
      loginUrl.searchParams.set("error", "invalid_link")
      loginUrl.searchParams.set("error_description", "Liên kết đăng nhập không hợp lệ hoặc đã hết hạn")
      return NextResponse.redirect(loginUrl)
    }
  }

  // Xử lý xác nhận email
  if (code && (type === "signup" || next.includes("/xac-nhan-email"))) {
    console.log("Xử lý xác nhận email")
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // Nếu xác nhận email thành công, thêm tham số success vào URL
    if (data?.session && !error) {
      const redirectUrl = new URL("/xac-nhan-email", requestUrl.origin)
      redirectUrl.searchParams.set("success", "true")
      // Thêm tham số auto_login để biết người dùng đã được đăng nhập tự động
      redirectUrl.searchParams.set("auto_login", "true")
      return NextResponse.redirect(redirectUrl)
    }

    // Nếu có lỗi, chuyển hướng với thông báo lỗi
    if (error) {
      const redirectUrl = new URL("/xac-nhan-email", requestUrl.origin)
      redirectUrl.searchParams.set("error", "invalid_link")
      redirectUrl.searchParams.set("error_description", "Liên kết xác nhận không hợp lệ hoặc đã hết hạn")
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Kiểm tra lỗi trong URL
  const error = requestUrl.searchParams.get("error")
  const errorCode = requestUrl.searchParams.get("error_code")
  const errorDescription = requestUrl.searchParams.get("error_description")

  if (error || errorCode || errorDescription) {
    // Nếu có lỗi, thêm thông tin lỗi vào URL chuyển hướng
    const redirectUrl = new URL(next, requestUrl.origin)
    if (error) redirectUrl.searchParams.set("error", error)
    if (errorCode) redirectUrl.searchParams.set("error_code", errorCode)
    if (errorDescription) redirectUrl.searchParams.set("error_description", errorDescription)
    return NextResponse.redirect(redirectUrl)
  }

  // Mặc định chuyển hướng đến trang được chỉ định
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}

