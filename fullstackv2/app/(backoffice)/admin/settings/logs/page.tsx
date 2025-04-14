import type { Metadata } from "next"
import { AdminActivityLogs } from "@/features/admin/logs/components/admin-activity-logs"
import { AdminLayout } from "@/components/layout/backoffice/admin-layout"

export const metadata: Metadata = {
  title: "Nhật ký hoạt động | MyBeauty Admin",
  description: "Quản lý nhật ký hoạt động của admin và staff",
}

export default function AdminActivityLogsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Nhật ký hoạt động</h2>
            <p className="text-muted-foreground">Xem lịch sử các hoạt động của admin và staff trên hệ thống.</p>
          </div>
        </div>

        <AdminActivityLogs />
      </div>
    </AdminLayout>
  )
}
