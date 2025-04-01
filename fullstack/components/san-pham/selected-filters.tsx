"use client"

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface SelectedFilter {
  id: string
  label: string
  type: string
}

interface SelectedFiltersProps {
  filters: SelectedFilter[]
}

export function SelectedFilters({ filters }: SelectedFiltersProps) {
  if (!filters.length) return null

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Bộ lọc đang chọn</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-muted-foreground text-xs"
          onClick={() => {
            // Xử lý xóa tất cả các bộ lọc
            console.log("Clear all filters")
          }}
        >
          Xóa tất cả
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Badge key={filter.id} variant="secondary" className="rounded-full flex items-center gap-1">
            {filter.label}
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={() => {
                // Xử lý xóa bộ lọc
                console.log("Remove filter", filter.id)
              }}
            />
          </Badge>
        ))}
      </div>
    </div>
  )
}

