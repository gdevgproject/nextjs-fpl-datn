import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xác nhận email - MyBeauty",
  description: "Xác nhận email cho tài khoản MyBeauty của bạn",
};

export default async function Page({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  // Nếu có tham số code trong query string, redirect đến trang động để xử lý
  if (searchParams.code) {
    redirect(`/xac-nhan-email/${searchParams.code}`);
  }

  // Nếu không có code, redirect về trang kiểm tra email để hiển thị hướng dẫn
  redirect("/kiem-tra-email");
}
