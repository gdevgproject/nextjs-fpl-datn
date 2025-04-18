import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    // Không có code, chuyển về trang xác nhận email với lỗi
    return NextResponse.redirect(
      new URL("/xac-nhan-email?error=missing_code", request.url)
    );
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Nếu lỗi, chuyển về trang xác nhận email với thông báo lỗi
    return NextResponse.redirect(
      new URL(
        `/xac-nhan-email?error=invalid_code&error_description=${encodeURIComponent(
          error.message
        )}`,
        request.url
      )
    );
  }

  // Thành công: session đã được set vào cookie, chuyển về trang chủ với query để hiển thị toast
  return NextResponse.redirect(
    new URL("/?auth_action=email_confirmed", request.url)
  );
}
