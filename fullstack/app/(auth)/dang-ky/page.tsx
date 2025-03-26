import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Đăng ký - MyBeauty",
  description: "Tạo tài khoản mới để mua sắm tại MyBeauty",
}

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Tạo tài khoản mới</h1>
      <p className="text-sm text-muted-foreground">Nhập thông tin của bạn để tạo tài khoản</p>

      <RegisterForm />

      <p className="px-8 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="underline underline-offset-4 hover:text-primary">
          Đăng nhập
        </Link>
      </p>
    </>
  )
}

