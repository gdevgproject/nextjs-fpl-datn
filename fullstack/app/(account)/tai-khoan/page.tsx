import type { Metadata } from "next"
import { AccountPage } from "@/features/account/components/account-page"

export const metadata: Metadata = {
  title: "Tài khoản - MyBeauty",
  description: "Quản lý thông tin tài khoản của bạn",
}

export default function Page() {
  return <AccountPage />
}

