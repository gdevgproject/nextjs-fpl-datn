"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BrandFilterProps {
  origins: string[]
  selectedOrigin?: string
}

export function BrandFilter({ origins, selectedOrigin }: BrandFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleOriginChange = (origin: string) => {
    const params = new URLSearchParams(searchParams.toString())

    // Nếu đang chọn lại cùng một xuất xứ, bỏ chọn
    if (origin === selectedOrigin) {
      params.delete("origin")
    } else {
      params.set("origin", origin)
    }

    // Reset letter filter when changing origin
    params.delete("letter")

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Giữ lại query tìm kiếm nếu có
    const query = params.get("query")
    params.delete("origin")
    params.delete("letter")

    if (query) {
      params.set("query", query)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  // Kiểm tra xem có filter nào được áp dụng không
  const hasFilters = selectedOrigin !== undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Bộ lọc</h2>
        {hasFilters && (
          <Button variant="link" className="h-auto p-0 text-xs" onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-3">Xuất xứ</h3>
          <ScrollArea className="h-[220px] pr-4">
            <RadioGroup value={selectedOrigin} onValueChange={handleOriginChange}>
              {origins.map((origin) => (
                <div key={origin} className="flex items-center space-x-2 py-1.5">
                  <RadioGroupItem value={origin} id={`origin-${origin}`} />
                  <Label htmlFor={`origin-${origin}`} className="cursor-pointer">
                    {origin}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

