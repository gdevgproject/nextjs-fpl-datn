"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { AdminHeader } from "./admin-header"
import { AdminSidebar } from "./admin-sidebar"
import { useAuth } from "@/features/auth/context/auth-context"
import { Loader2 } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading, isAdmin } = useAuth()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show loading state
  if (!isMounted || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Quyền truy cập bị từ chối</h1>
        <p className="text-muted-foreground mb-4">Bạn không có quyền truy cập vào trang quản trị.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        <aside className="hidden lg:block w-64 shrink-0 border-r h-[calc(100vh-4rem)] sticky top-16">
          <AdminSidebar />
        </aside>
        <main className="flex-1 overflow-x-auto">
          <div className="container py-4 sm:py-6 px-3 sm:px-4 md:px-6 max-w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
