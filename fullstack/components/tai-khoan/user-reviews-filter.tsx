"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserReviewsFilterProps {
  onSearch: (query: string) => void
  onSortChange: (value: string) => void
  sortBy: string
  searchQuery: string
}

export function UserReviewsFilter({ onSearch, onSortChange, sortBy, searchQuery }: UserReviewsFilterProps) {
  const [inputValue, setInputValue] = useState(searchQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(inputValue)
  }

  const handleClear = () => {
    setInputValue("")
    onSearch("")
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <form onSubmit={handleSubmit} className="relative flex-1">
        <Input
          type="text"
          placeholder="Tìm kiếm đánh giá..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pr-16"
        />
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-8 top-0 h-full"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Xóa</span>
          </Button>
        )}
        <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
          <Search className="h-4 w-4" />
          <span className="sr-only">Tìm kiếm</span>
        </Button>
      </form>

      <div className="w-full sm:w-48">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>
            <SelectItem value="highest">Đánh giá cao nhất</SelectItem>
            <SelectItem value="lowest">Đánh giá thấp nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

