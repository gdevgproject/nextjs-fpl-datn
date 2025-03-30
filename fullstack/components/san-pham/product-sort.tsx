"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProductSort() {
  const [sortOption, setSortOption] = useState("featured")

  return (
    <div className="flex items-center">
      <Select value={sortOption} onValueChange={setSortOption}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="featured">Nổi bật</SelectItem>
          <SelectItem value="newest">Mới nhất</SelectItem>
          <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
          <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
          <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

