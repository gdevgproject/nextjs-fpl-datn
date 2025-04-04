import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { InventoryDashboard } from "@/components/admin/san-pham/inventory-dashboard"
import { InventoryList } from "@/components/admin/san-pham/inventory-list"
import { InventoryListSkeleton } from "@/components/admin/san-pham/inventory-list-skeleton"
import { InventoryStats } from "@/components/admin/san-pham/inventory-stats"
import { InventoryToolbar } from "@/components/admin/san-pham/inventory-toolbar"

export const metadata: Metadata = {
  title: "Quản lý tồn kho - Admin MyBeauty",
  description: "Quản lý tồn kho sản phẩm của cửa hàng MyBeauty",
}

export default function AdminInventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/san-pham">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quản lý tồn kho</h1>
        </div>
      </div>

      <InventoryStats />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <InventoryToolbar />
          <Suspense fallback={<InventoryListSkeleton />}>
            <InventoryList />
          </Suspense>
        </div>
        <div className="xl:col-span-1">
          <InventoryDashboard />
        </div>
      </div>
    </div>
  )
}

