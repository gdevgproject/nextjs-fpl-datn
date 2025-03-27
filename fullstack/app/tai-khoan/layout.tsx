import type React from "react"
import { AccountSidebar } from "@/components/tai-khoan/account-sidebar"
import { PageContainer } from "@/components/layout/page-container"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tài khoản",
  description: "Quản lý thông tin tài khoản, đơn hàng, địa chỉ và đánh giá của bạn",
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PageContainer className="py-8 md:py-12">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="md:w-64 lg:w-72 flex-shrink-0">
          <AccountSidebar />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </PageContainer>
  )
}

