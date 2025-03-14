"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import SearchSuggestions from "./SearchSuggestions"
import { useSearch } from "@/features/search/hooks/useSearch"
import { Button } from "@/components/ui/Button"

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { query, setQuery, results, isLoading, hasResults } = useSearch()

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-grayscale-50" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Tìm kiếm sản phẩm, dịch vụ . . ."
          className="h-12 w-full rounded-lg border-none bg-white pl-12 pr-10 text-base text-grayscale-90 shadow-sm placeholder:text-grayscale-40 focus:outline-none focus:ring-2 focus:ring-primary-20"
        />
        {query && (
          <Button
            onClick={() => setQuery("")}
            variant="ghost"
            size="sm"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-grayscale-10"
          >
            <X className="h-5 w-5 text-grayscale-50" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}

        {isLoading && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-40 border-t-transparent"></div>
          </div>
        )}
      </div>

      <SearchSuggestions
        query={query}
        results={results}
        isVisible={isFocused && query.length > 0}
        onClose={() => setIsFocused(false)}
      />
    </div>
  )
}

