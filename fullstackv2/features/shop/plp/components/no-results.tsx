"use client"

import { Button } from "@/components/ui/button"
import { SearchX } from "lucide-react"

interface NoResultsProps {
  onClearFilters: () => void
}

export default function NoResults({ onClearFilters }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">Không tìm thấy sản phẩm</h3>
      <p className="text-muted-foreground mt-2 mb-6">
        Không có sản phẩm nào phù hợp với bộ lọc đã chọn. Vui lòng thử lại với các bộ lọc khác.
      </p>
      <Button onClick={onClearFilters}>Xóa tất cả bộ lọc</Button>
    </div>
  )
}
