import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin - MyBeauty",
  description: "Quản lý cửa hàng MyBeauty",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex-1">{children}</div>
}

