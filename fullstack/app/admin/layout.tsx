import type { ReactNode } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { NotificationCenter } from "@/components/admin/dashboard/notification-center"
import { ModeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/admin/user-nav"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <ModeToggle />
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}

