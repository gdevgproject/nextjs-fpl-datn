"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { useWishlistContext } from "../providers/wishlist-provider"
import type { WishlistFilter } from "../hooks/use-wishlist"

export function WishlistFilter() {
  const { filter, setFilter } = useWishlistContext()
  const [searchQuery, setSearchQuery] = useState(filter.search || "")

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (value: string) => {
    setFilter({
      ...filter,
      sortBy: value as WishlistFilter["sortBy"],
    })
  }

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilter({
      ...filter,
      search: searchQuery,
    })
  }

  // Xử lý xóa tìm kiếm
  const handleClearSearch = () => {
    setSearchQuery("")
    setFilter({
      ...filter,
      search: undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
        {searchQuery ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-8 top-0 h-full"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Xóa tìm kiếm</span>
          </Button>
        ) : null}
        <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
          <Search className="h-4 w-4" />
          <span className="sr-only">Tìm kiếm</span>
        </Button>
      </form>

      <Select value={filter.sortBy || "newest"} onValueChange={handleSortChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Sắp xếp theo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Mới nhất</SelectItem>
          <SelectItem value="oldest">Cũ nhất</SelectItem>
          <SelectItem value="price_asc">Giá tăng dần</SelectItem>
          <SelectItem value="price_desc">Giá giảm dần</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

