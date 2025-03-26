import type { Metadata } from "next"
import Link from "next/link"
import { EmailConfirmation } from "@/components/auth/email-confirmation"

export const metadata: Metadata = {
  title: "Xác nhận email - MyBeauty",
  description: "Xác nhận email cho tài khoản MyBeauty của bạn",
}

export default function EmailConfirmationPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Xác nhận email</h1>
      <p className="text-sm text-muted-foreground">Vui lòng xác nhận email của bạn để hoàn tất đăng ký</p>

      <EmailConfirmation />

      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link href="/dang-nhap" className="underline underline-offset-4 hover:text-primary">
          Quay lại đăng nhập
        </Link>
      </p>
    </>
  )
}

