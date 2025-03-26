import type { Metadata } from "next"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Quên mật khẩu - MyBeauty",
  description: "Đặt lại mật khẩu cho tài khoản MyBeauty của bạn",
}

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Quên mật khẩu</h1>
      <p className="text-sm text-muted-foreground">Nhập email của bạn để nhận liên kết đặt lại mật khẩu</p>

      <ForgotPasswordForm />

      <p className="px-8 text-center text-sm text-muted-foreground">
        Đã nhớ mật khẩu?{" "}
        <Link href="/dang-nhap" className="underline underline-offset-4 hover:text-primary">
          Đăng nhập
        </Link>
      </p>
    </>
  )
}

