import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Xác nhận email - MyBeauty",
  description: "Xác nhận email cho tài khoản MyBeauty của bạn",
};

interface Props {
  params: { code: string };
}

export default async function Page({ params }: Props) {
  const supabase = await getSupabaseServerClient();
  const code = params.code;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Nếu thành công, redirect về trang chủ và có thể truyền query để hiển thị toast
      return redirect("/?auth_action=email_confirmed");
    }
  }
  // Nếu thất bại, hiển thị thông báo lỗi
  return (
    <div className="flex flex-col space-y-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Xác nhận email</h1>
      <p className="text-red-600 font-medium">
        Xác nhận email thất bại. Đường dẫn không hợp lệ hoặc đã hết hạn.
      </p>
      <Button asChild variant="outline">
        <Link href="/dang-ky">Đăng ký lại</Link>
      </Button>
      <Button asChild>
        <Link href="/">Quay lại trang chủ</Link>
      </Button>
    </div>
  );
}
