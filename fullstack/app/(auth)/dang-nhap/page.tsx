import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Đăng nhập - MyBeauty",
  description: "Đăng nhập vào tài khoản MyBeauty của bạn",
}

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
      <p className="text-sm text-muted-foreground">Nhập thông tin đăng nhập của bạn</p>

      <LoginForm />

      <p className="px-8 text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="underline underline-offset-4 hover:text-primary">
          Đăng ký
        </Link>
      </p>
    </>
  )
}

