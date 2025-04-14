import type { Metadata } from "next";
import { LoginPage } from "@/features/shop/auth/components/login-page";

export const metadata: Metadata = {
  title: "Đăng nhập - MyBeauty",
  description: "Đăng nhập vào tài khoản MyBeauty của bạn",
};

export default function Page() {
  return <LoginPage />;
}
