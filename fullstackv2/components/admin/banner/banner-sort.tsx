"use client"

import { ArrowUpDown } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function BannerSort() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="h-8 gap-1">
        <ArrowUpDown className="h-3.5 w-3.5" />
        <span>Sắp xếp</span>
      </Button>
      <Select defaultValue="display_order">
        <SelectTrigger className="w-[180px] h-8">
          <SelectValue placeholder="Sắp xếp theo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="display_order">Thứ tự hiển thị</SelectItem>
          <SelectItem value="created_at_desc">Mới nhất</SelectItem>
          <SelectItem value="created_at_asc">Cũ nhất</SelectItem>
          <SelectItem value="start_date_asc">Ngày bắt đầu (tăng dần)</SelectItem>
          <SelectItem value="start_date_desc">Ngày bắt đầu (giảm dần)</SelectItem>
          <SelectItem value="end_date_asc">Ngày kết thúc (tăng dần)</SelectItem>
          <SelectItem value="end_date_desc">Ngày kết thúc (giảm dần)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

