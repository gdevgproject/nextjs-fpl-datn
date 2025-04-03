"use client"

import type React from "react"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface DiscountCodeFiltersProps {
  filters: {
    search: string
    type: string
    status: string
    dateRange: {
      from: Date | undefined
      to: Date | undefined
    }
  }
  onFilterChange: (filters: any) => void
}

export function DiscountCodeFilters({ filters, onFilterChange }: DiscountCodeFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({ search: searchValue })
  }

  const handleTypeChange = (value: string) => {
    onFilterChange({ type: value })
  }

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    onFilterChange({ dateRange: range })
  }

  const handleClearFilters = () => {
    setSearchValue("")
    onFilterChange({
      search: "",
      type: "all",
      dateRange: {
        from: undefined,
        to: undefined,
      },
    })
    setIsPopoverOpen(false)
  }

  // Đếm số bộ lọc đang áp dụng
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.type !== "all") count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className="flex items-center gap-2">
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm mã giảm giá..."
          className="h-9 w-[150px] pl-8 md:w-[200px]"
          value={searchValue}
          onChange={handleSearchChange}
        />
      </form>

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Bộ lọc</span>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Lọc mã giảm giá</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <PopoverContent className="w-[300px] p-4" align="end">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Bộ lọc</h4>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={handleClearFilters}>
                  <X className="mr-1 h-3 w-3" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount-type">Loại mã giảm giá</Label>
              <Select value={filters.type} onValueChange={handleTypeChange}>
                <SelectTrigger id="discount-type">
                  <SelectValue placeholder="Chọn loại mã giảm giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="percentage">Phần trăm</SelectItem>
                  <SelectItem value="fixed">Số tiền cố định</SelectItem>
                  <SelectItem value="shipping">Miễn phí vận chuyển</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Thời gian tạo</Label>
              <div className="rounded-md border">
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.dateRange.from,
                    to: filters.dateRange.to,
                  }}
                  onSelect={handleDateRangeChange}
                  locale={vi}
                  className="w-full"
                />
              </div>
              {(filters.dateRange.from || filters.dateRange.to) && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div>{filters.dateRange.from ? format(filters.dateRange.from, "dd/MM/yyyy") : "Không giới hạn"}</div>
                  <div>→</div>
                  <div>{filters.dateRange.to ? format(filters.dateRange.to, "dd/MM/yyyy") : "Không giới hạn"}</div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button size="sm" onClick={() => setIsPopoverOpen(false)}>
                Áp dụng bộ lọc
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

