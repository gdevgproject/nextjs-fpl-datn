"use client"

import { TicketPercent, CheckCircle2, Clock, AlertCircle, ShoppingCart, DollarSign } from "lucide-react"

interface DiscountCodeStatsProps {
  stats: {
    total: number
    active: number
    expired: number
    scheduled: number
    usageCount: number
    totalDiscount: number
  }
}

export function DiscountCodeStats({ stats }: DiscountCodeStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
      <div className="flex items-center gap-2 rounded-md border p-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <TicketPercent className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Tổng số</p>
          <p className="text-lg font-bold">{stats.total}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-md border p-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          <p className="text-lg font-bold">{stats.active}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-md border p-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
          <Clock className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Lên lịch</p>
          <p className="text-lg font-bold">{stats.scheduled}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-md border p-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
          <AlertCircle className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Hết hạn</p>
          <p className="text-lg font-bold">{stats.expired}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-md border p-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
          <ShoppingCart className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Lượt sử dụng</p>
          <p className="text-lg font-bold">{stats.usageCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-md border p-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
          <DollarSign className="h-4 w-4 text-orange-600" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Tổng giảm giá</p>
          <p className="text-lg font-bold">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(stats.totalDiscount)}
          </p>
        </div>
      </div>
    </div>
  )
}

