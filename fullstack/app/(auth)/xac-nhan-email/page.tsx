import type { Metadata } from "next"
import { EmailConfirmation } from "@/components/auth/email-confirmation"
import { AuthHeader } from "@/components/auth/auth-header"
import { MailCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Xác nhận email - MyBeauty",
  description: "Xác nhận email cho tài khoản MyBeauty của bạn",
}

export default function EmailConfirmationPage() {
  return (
    <>
      <AuthHeader
        title="Xác nhận email"
        description="Vui lòng xác nhận địa chỉ email của bạn"
        icon={<MailCheck className="h-10 w-10 text-primary" />}
      />
      <EmailConfirmation />
    </>
  )
}

