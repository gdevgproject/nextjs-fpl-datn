"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const SearchForm = memo(function SearchForm() {
  const [query, setQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  // Optimized form submission with useCallback
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        // Use a custom event to track search analytics later
        window.dispatchEvent(new CustomEvent("search", { detail: { query: query.trim() } }))

        // Navigate to product page with search parameter
        router.push(`/san-pham?q=${encodeURIComponent(query.trim())}`)
        setIsExpanded(false)
        setQuery("")
      }
    },
    [query, router],
  )

  // Optimized search button click handler
  const handleSearchClick = useCallback(() => {
    setIsExpanded((prev) => !prev)
    // Focus on input when expanding
    if (!isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isExpanded])

  // Optimized clear button click handler
  const handleClearClick = useCallback(() => {
    setQuery("")
    inputRef.current?.focus()
  }, [])

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Close search form on Escape key
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false)
      }

      // Focus search input on Ctrl+K or Cmd+K (common search shortcut)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setIsExpanded(true)
        setTimeout(() => {
          inputRef.current?.focus()
        }, 50)
      }
    },
    [isExpanded],
  )

  // Handle clicks outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    // Handle keyboard shortcuts
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded, handleKeyDown])

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative" role="search">
      <div className="flex items-center">
        {isExpanded && (
          <div className="absolute left-0 top-0 z-10 flex w-full items-center md:relative md:w-auto">
            <Input
              ref={inputRef}
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full rounded-md md:w-[200px] lg:w-[300px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Tìm kiếm sản phẩm"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-8 top-0 h-full"
                onClick={handleClearClick}
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Xóa tìm kiếm</span>
              </Button>
            )}
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              aria-label="Tìm kiếm"
              disabled={!query.trim()}
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Tìm kiếm</span>
            </Button>
          </div>
        )}
        {!isExpanded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSearchClick}
            type="button"
            aria-label="Mở form tìm kiếm"
            title="Tìm kiếm (Ctrl+K)"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Tìm kiếm</span>
          </Button>
        )}
      </div>
    </form>
  )
})

