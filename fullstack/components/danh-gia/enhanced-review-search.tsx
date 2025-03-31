"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface EnhancedReviewSearchProps {
  onSearch: (query: string) => void
  searchQuery: string
}

export function EnhancedReviewSearch({ onSearch, searchQuery }: EnhancedReviewSearchProps) {
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
    <div className="space-y-2">
      <h3 className="font-medium">Tìm kiếm đánh giá</h3>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          placeholder="Tìm trong đánh giá..."
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
      {searchQuery && (
        <p className="text-sm">
          Kết quả tìm kiếm cho: <span className="font-medium">{searchQuery}</span>
        </p>
      )}
    </div>
  )
}

