import type { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { AuthHeader } from "@/components/auth/auth-header"
import { Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Quên mật khẩu - MyBeauty",
  description: "Đặt lại mật khẩu cho tài khoản MyBeauty của bạn",
}

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader
        title="Quên mật khẩu"
        description="Nhập email của bạn để nhận liên kết đặt lại mật khẩu"
        icon={<Mail className="h-10 w-10 text-primary" />}
      />
      <ForgotPasswordForm />
    </>
  )
}

