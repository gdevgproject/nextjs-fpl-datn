import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { AuthHeader } from "@/components/auth/auth-header"
import { KeyRound } from "lucide-react"

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu - MyBeauty",
  description: "Đặt lại mật khẩu cho tài khoản MyBeauty của bạn",
}

export default function ResetPasswordPage() {
  return (
    <>
      <AuthHeader
        title="Đặt lại mật khẩu"
        description="Tạo mật khẩu mới cho tài khoản của bạn"
        icon={<KeyRound className="h-10 w-10 text-primary" />}
      />
      <ResetPasswordForm />
    </>
  )
}

