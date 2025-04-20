import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu - MyBeauty",
  description: "Nhập mật khẩu mới để hoàn tất đặt lại",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;
  if (!token) {
    redirect("/dang-nhap");
  }
  return <ResetPasswordForm token={token!} />;
}
