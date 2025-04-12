"use client"

import type React from "react"

import { useState } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface BrandFiltersProps {
  filters: {
    search: string
    sortBy: string
    sortOrder: string
    hasProducts: string
  }
  onFilterChange: (filters: Partial<typeof filters>) => void
}

export function BrandFilters({ filters, onFilterChange }: BrandFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value })
  }

  const handleClearSearch = () => {
    onFilterChange({ search: "" })
  }

  const handleSortByChange = (value: string) => {
    onFilterChange({ sortBy: value })
  }

  const handleSortOrderChange = (value: string) => {
    onFilterChange({ sortOrder: value })
  }

  const handleHasProductsChange = (value: string) => {
    onFilterChange({ hasProducts: value })
  }

  const activeFiltersCount = filters.hasProducts !== "all" ? 1 : 0

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm thương hiệu..."
          className="pl-8"
          value={filters.search}
          onChange={handleSearchChange}
        />
        {filters.search && (
          <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={handleClearSearch}>
            <X className="h-4 w-4" />
            <span className="sr-only">Xóa tìm kiếm</span>
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Bộ lọc
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={filters.sortBy} onValueChange={handleSortByChange}>
            <DropdownMenuRadioItem value="name">Tên thương hiệu</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="productCount">Số sản phẩm</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="createdAt">Ngày tạo</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Thứ tự</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={filters.sortOrder} onValueChange={handleSortOrderChange}>
            <DropdownMenuRadioItem value="asc">Tăng dần</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="desc">Giảm dần</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Sản phẩm</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={filters.hasProducts} onValueChange={handleHasProductsChange}>
            <DropdownMenuRadioItem value="all">Tất cả</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="yes">Có sản phẩm</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="no">Không có sản phẩm</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

