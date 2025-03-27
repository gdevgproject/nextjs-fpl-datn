import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Đăng nhập - MyBeauty",
  description: "Đăng nhập vào tài khoản MyBeauty của bạn",
}

export default function LoginPage() {
  return <LoginForm />
}

