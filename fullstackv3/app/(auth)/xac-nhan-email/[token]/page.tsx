import type { Metadata } from "next"
import { VerifyEmailPage } from "@/features/auth/components/verify-email-page"

export const metadata: Metadata = {
  title: "Xác nhận email - MyBeauty",
  description: "Xác nhận email cho tài khoản MyBeauty của bạn",
}

export default function Page({ params }: { params: { token: string } }) {
  return <VerifyEmailPage token={params.token} />
}

