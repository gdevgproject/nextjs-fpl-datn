"use client"

import { Button } from "@/components/ui/button"
import { SearchX } from "lucide-react"

export function NoResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Không tìm thấy sản phẩm</h3>
      <p className="text-muted-foreground mb-6">Không có sản phẩm nào phù hợp với bộ lọc bạn đã chọn.</p>
      <Button onClick={onReset}>Xóa bộ lọc</Button>
    </div>
  )
}
