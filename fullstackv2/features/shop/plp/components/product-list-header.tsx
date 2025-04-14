"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SortOption, SortOrder } from "../hooks/use-plp-filters"

export function ProductListHeader({
  totalCount,
  sortBy,
  sortOrder,
  onSortChange,
}: {
  totalCount: number
  sortBy: SortOption
  sortOrder: SortOrder
  onSortChange: (sortBy: string, sortOrder: string) => void
}) {
  // Handle sort change
  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-")
    onSortChange(newSortBy, newSortOrder)
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="text-sm">
        <span className="font-medium">{totalCount}</span> sản phẩm được tìm thấy
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">Sắp xếp theo:</span>
        <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Mới nhất</SelectItem>
            <SelectItem value="created_at-asc">Cũ nhất</SelectItem>
            <SelectItem value="name-asc">Tên A-Z</SelectItem>
            <SelectItem value="name-desc">Tên Z-A</SelectItem>
            <SelectItem value="display_price-asc">Giá thấp đến cao</SelectItem>
            <SelectItem value="display_price-desc">Giá cao đến thấp</SelectItem>
            <SelectItem value="popularity-desc">Phổ biến nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
