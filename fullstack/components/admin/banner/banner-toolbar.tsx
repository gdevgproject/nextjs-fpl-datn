"use client"

import type React from "react"

import { useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BannerFilter } from "./banner-filter"

interface BannerToolbarProps {
  onSearch: (query: string) => void
  onSort: (order: string) => void
  sortOrder: string
}

export function BannerToolbar({ onSearch, onSort, sortOrder }: BannerToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <form onSubmit={handleSearch} className="flex-1 sm:w-64">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm banner..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      <div className="flex gap-2">
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Bộ lọc
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <BannerFilter onClose={() => setShowFilters(false)} />
          </PopoverContent>
        </Popover>

        <Select value={sortOrder} onValueChange={onSort}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="display_order">Thứ tự hiển thị</SelectItem>
            <SelectItem value="created_at_desc">Mới nhất</SelectItem>
            <SelectItem value="created_at_asc">Cũ nhất</SelectItem>
            <SelectItem value="start_date_asc">Ngày bắt đầu (tăng dần)</SelectItem>
            <SelectItem value="start_date_desc">Ngày bắt đầu (giảm dần)</SelectItem>
            <SelectItem value="end_date_asc">Ngày kết thúc (tăng dần)</SelectItem>
            <SelectItem value="end_date_desc">Ngày kết thúc (giảm dần)</SelectItem>
            <SelectItem value="title_asc">Tên (A-Z)</SelectItem>
            <SelectItem value="title_desc">Tên (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

