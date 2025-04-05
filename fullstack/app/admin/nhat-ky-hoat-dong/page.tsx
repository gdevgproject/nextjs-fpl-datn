import type { Metadata } from "next"
import ActivityLogPageClient from "./ActivityLogPageClient"

export const metadata: Metadata = {
  title: "Nhật ký hoạt động | MyBeauty Admin",
  description: "Quản lý nhật ký hoạt động của admin",
}

export default function ActivityLogPage() {
  return <ActivityLogPageClient />
}

