import type { Metadata } from "next"
import Link from "next/link"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu - MyBeauty",
  description: "Đặt lại mật khẩu cho tài khoản MyBeauty của bạn",
}

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Đặt lại mật khẩu</h1>
      <p className="text-sm text-muted-foreground">Nhập mật khẩu mới cho tài khoản của bạn</p>

      <ResetPasswordForm />

      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link href="/dang-nhap" className="underline underline-offset-4 hover:text-primary">
          Quay lại đăng nhập
        </Link>
      </p>
    </>
  )
}

