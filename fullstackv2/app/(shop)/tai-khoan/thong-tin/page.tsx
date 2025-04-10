import type { Metadata } from "next"
import { AccountInfo } from "@/features/shop/account/components/account-info"

export const metadata: Metadata = {
  title: "Thông tin tài khoản",
  description: "Quản lý thông tin cá nhân của bạn",
}

export default function AccountInfoPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Thông tin tài khoản</h1>
      <AccountInfo />
    </div>
  )
}
