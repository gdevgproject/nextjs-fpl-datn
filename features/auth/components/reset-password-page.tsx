import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu - MyBeauty",
  description: "Nhập mật khẩu mới để hoàn tất đặt lại",
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  if (!token) {
    redirect("/dang-nhap");
  }
  return <ResetPasswordForm token={token!} />;
}
