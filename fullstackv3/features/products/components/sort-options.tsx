"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SortOptionsProps {
  currentSort?: string
}

export function SortOptions({ currentSort }: SortOptionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Danh sách các tùy chọn sắp xếp
  const sortOptions = [
    { value: "newest", label: "Mới nhất" },
    { value: "price_asc", label: "Giá tăng dần" },
    { value: "price_desc", label: "Giá giảm dần" },
    { value: "name_asc", label: "Tên A-Z" },
    { value: "name_desc", label: "Tên Z-A" },
  ]

  // Xử lý khi thay đổi tùy chọn sắp xếp
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    // Cập nhật tham số sort
    if (value === "newest") {
      params.delete("sort") // Xóa tham số sort nếu là mặc định
    } else if (value) {
      params.set("sort", value)
    }

    // Reset về trang 1 khi thay đổi sắp xếp
    params.delete("page")

    // Điều hướng đến URL mới
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sắp xếp theo:</span>
      <Select value={currentSort || "newest"} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sắp xếp theo" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

