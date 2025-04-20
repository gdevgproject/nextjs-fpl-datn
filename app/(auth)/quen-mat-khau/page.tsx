import type { Metadata } from "next";
import ForgotPasswordPage from "@/features/auth/components/forgot-password-page";

export const metadata: Metadata = {
  title: "Quên mật khẩu - MyBeauty",
  description: "Nhập email để nhận link đặt lại mật khẩu",
};

export default function Page() {
  return <ForgotPasswordPage />;
}
