import type React from "react"
import { MainLayout } from "@/features/shop/shared/components/main-layout"
import { AccountSidebar } from "./account-sidebar"

export function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <AccountSidebar />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </MainLayout>
  )
}

