"use client"

import { useState } from "react"
import { ArrowDownAZ, ArrowUpAZ, Clock } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ReviewSortProps {
  onSortChange?: (sort: string) => void
  className?: string
}

export function ReviewSort({ onSortChange, className }: ReviewSortProps) {
  const [sort, setSort] = useState("newest")

  const handleSortChange = (value: string) => {
    setSort(value)
    if (onSortChange) {
      onSortChange(value)
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Label htmlFor="sort-select" className="whitespace-nowrap text-sm">
          Sắp xếp theo:
        </Label>
        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger id="sort-select" className="w-[180px]">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Mới nhất
              </div>
            </SelectItem>
            <SelectItem value="oldest">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Cũ nhất
              </div>
            </SelectItem>
            <SelectItem value="rating-high">
              <div className="flex items-center">
                <ArrowDownAZ className="mr-2 h-4 w-4" />
                Đánh giá cao nhất
              </div>
            </SelectItem>
            <SelectItem value="rating-low">
              <div className="flex items-center">
                <ArrowUpAZ className="mr-2 h-4 w-4" />
                Đánh giá thấp nhất
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

