"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useProductVariants } from "../hooks/use-product-variants"

interface InventoryFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  variantId?: number
  onVariantIdChange: (value: number | undefined) => void
  reason: string
  onReasonChange: (value: string) => void
  dateRange: { from?: Date; to?: Date }
  onDateRangeChange: (value: { from?: Date; to?: Date }) => void
  minChange?: number
  onMinChangeChange: (value: number | undefined) => void
  maxChange?: number
  onMaxChangeChange: (value: number | undefined) => void
}

export function InventoryFilters({
  search,
  onSearchChange,
  variantId,
  onVariantIdChange,
  reason,
  onReasonChange,
  dateRange,
  onDateRangeChange,
  minChange,
  onMinChangeChange,
  maxChange,
  onMaxChangeChange,
}: InventoryFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [variantSearch, setVariantSearch] = useState("")

  // Fetch product variants for the dropdown
  const { data: variantsData } = useProductVariants({
    search: variantSearch,
  })
  const variants = variantsData?.data || []

  // Reset all filters
  const resetFilters = () => {
    onSearchChange("")
    onVariantIdChange(undefined)
    onReasonChange("")
    onDateRangeChange({})
    onMinChangeChange(undefined)
    onMaxChangeChange(undefined)
  }

  return (
    <div className="space-y-4 w-full max-w-3xl">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm theo tên sản phẩm hoặc SKU..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        <Button variant={isFiltersOpen ? "default" : "outline"} onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
          {isFiltersOpen ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
        </Button>
        {(variantId !== undefined ||
          reason !== "" ||
          dateRange.from !== undefined ||
          dateRange.to !== undefined ||
          minChange !== undefined ||
          maxChange !== undefined) && (
          <Button variant="ghost" size="icon" onClick={resetFilters} title="Xóa bộ lọc">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isFiltersOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-md">
          {/* Product Variant Filter */}
          <div className="space-y-2">
            <Label htmlFor="variant">Biến thể sản phẩm</Label>
            <Select
              value={variantId?.toString() || ""}
              onValueChange={(value) => onVariantIdChange(value ? Number.parseInt(value) : undefined)}
            >
              <SelectTrigger id="variant">
                <SelectValue placeholder="Chọn biến thể" />
              </SelectTrigger>
              <SelectContent>
                <div className="mb-2">
                  <Input
                    placeholder="Tìm kiếm biến thể..."
                    value={variantSearch}
                    onChange={(e) => setVariantSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <SelectItem value="all">Tất cả biến thể</SelectItem>
                {variants.map((variant: any) => (
                  <SelectItem key={variant.id} value={variant.id.toString()}>
                    {variant.products?.name} - {variant.volume_ml}ml ({variant.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason Filter */}
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do</Label>
            <Input
              id="reason"
              placeholder="Lọc theo lý do..."
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
            />
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Khoảng thời gian</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                    )
                  ) : (
                    "Chọn khoảng thời gian"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={dateRange} onSelect={onDateRangeChange} locale={vi} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Change Amount Range Filter */}
          <div className="space-y-2">
            <Label htmlFor="minChange">Số lượng thay đổi tối thiểu</Label>
            <Input
              id="minChange"
              type="number"
              placeholder="Nhập số lượng..."
              value={minChange !== undefined ? minChange : ""}
              onChange={(e) => onMinChangeChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxChange">Số lượng thay đổi tối đa</Label>
            <Input
              id="maxChange"
              type="number"
              placeholder="Nhập số lượng..."
              value={maxChange !== undefined ? maxChange : ""}
              onChange={(e) => onMaxChangeChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
