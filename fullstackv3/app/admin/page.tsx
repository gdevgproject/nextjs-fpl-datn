import type { Metadata } from "next"
import { AdminDashboard } from "@/features/admin/dashboard/admin-dashboard"

export const metadata: Metadata = {
  title: "Admin - MyBeauty",
  description: "Trang quản trị MyBeauty",
}

export default function Page() {
  return <AdminDashboard />
}

