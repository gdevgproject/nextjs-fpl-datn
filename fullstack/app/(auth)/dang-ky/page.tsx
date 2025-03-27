import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Đăng ký - MyBeauty",
  description: "Tạo tài khoản mới để mua sắm tại MyBeauty",
}

export default function RegisterPage() {
  return <RegisterForm />
}

