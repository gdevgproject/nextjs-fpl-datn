import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xác nhận email - MyBeauty",
  description: "Xác nhận email cho tài khoản MyBeauty của bạn",
};

export default function Page({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  if (searchParams.code) {
    // Chuyển sang API route để set session
    redirect(`/api/auth/comfirm?code=${searchParams.code}`);
  }
  // Nếu không có code, hiển thị hướng dẫn kiểm tra email
  redirect("/kiem-tra-email");
}
