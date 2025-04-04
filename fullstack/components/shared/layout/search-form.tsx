"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SearchForm() {
  const [query, setQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Xử lý submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // Điều hướng đến trang sản phẩm với tham số tìm kiếm
      router.push(`/san-pham?q=${encodeURIComponent(query.trim())}`)
      setIsExpanded(false)
      setQuery("")
    }
  }

  // Xử lý click nút tìm kiếm
  const handleSearchClick = () => {
    setIsExpanded(!isExpanded)
    // Focus vào input khi mở rộng
    if (!isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  // Xử lý click nút xóa
  const handleClearClick = () => {
    setQuery("")
    inputRef.current?.focus()
  }

  // Xử lý click bên ngoài để đóng form
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest("button")
      ) {
        setIsExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center">
        {isExpanded && (
          <div className="absolute left-0 top-0 z-10 flex w-full items-center md:relative md:w-auto">
            <Input
              ref={inputRef}
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full md:w-[200px] lg:w-[300px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-8 top-0 h-full"
                onClick={handleClearClick}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Xóa tìm kiếm</span>
              </Button>
            )}
            <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
              <Search className="h-4 w-4" />
              <span className="sr-only">Tìm kiếm</span>
            </Button>
          </div>
        )}
        {!isExpanded && (
          <Button variant="ghost" size="icon" onClick={handleSearchClick} type="button">
            <Search className="h-5 w-5" />
            <span className="sr-only">Tìm kiếm</span>
          </Button>
        )}
      </div>
    </form>
  )
}

