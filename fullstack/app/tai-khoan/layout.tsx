import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/supabase/supabase-server"
import { AccountSidebar } from "@/components/tai-khoan/account-sidebar"

export default async function AccountLayout({ children }: { children: ReactNode }) {
  // Kiểm tra đăng nhập
  const session = await getSession()
  if (!session) {
    redirect("/dang-nhap?callbackUrl=/tai-khoan/thong-tin")
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-64 shrink-0">
          <AccountSidebar />
        </div>
        <div className="flex-1">
          <div className="rounded-lg border bg-card p-6 shadow-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}

