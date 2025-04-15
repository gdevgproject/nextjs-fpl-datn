import type { Metadata } from "next";
import { RegisterPage } from "@/features/auth/components/register-page";

export const metadata: Metadata = {
  title: "Đăng ký - MyBeauty",
  description: "Đăng ký tài khoản MyBeauty mới",
};

export default function Page() {
  return <RegisterPage />;
}
