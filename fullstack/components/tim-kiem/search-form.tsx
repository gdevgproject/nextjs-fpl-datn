"use client"

import type React from "react"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { useOnClickOutside } from "@/lib/hooks/use-on-click-outside"

interface SearchFormProps {
  initialQuery?: string
}

// Giả lập API gợi ý tìm kiếm
const fetchSearchSuggestions = async (query: string): Promise<string[]> => {
  // Giả lập delay API
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Dữ liệu mẫu
  const allSuggestions = [
    "Dior Sauvage",
    "Chanel No 5",
    "Tom Ford Black Orchid",
    "Versace Eros",
    "Dolce Gabbana Light Blue",
    "Yves Saint Laurent Black Opium",
    "Gucci Bloom",
    "Dior Homme",
    "Chanel Coco Mademoiselle",
    "Tom Ford Tobacco Vanille",
    "Versace Dylan Blue",
    "Dolce Gabbana The One",
    "Yves Saint Laurent Libre",
    "Gucci Guilty",
  ]

  if (!query) return []

  return allSuggestions.filter((suggestion) => suggestion.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
}

export function SearchForm({ initialQuery = "" }: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  useOnClickOutside(formRef, () => setShowSuggestions(false))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    startTransition(() => {
      const params = new URLSearchParams()
      params.set("q", query)
      router.push(`/tim-kiem?${params.toString()}`)
      setShowSuggestions(false)
    })
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)

    startTransition(() => {
      const params = new URLSearchParams()
      params.set("q", suggestion)
      router.push(`/tim-kiem?${params.toString()}`)
      setShowSuggestions(false)
    })
  }

  const clearSearch = () => {
    setQuery("")
    setSuggestions([])
  }

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setIsLoading(true)
      try {
        const results = await fetchSearchSuggestions(debouncedQuery)
        setSuggestions(results)
        if (results.length > 0) {
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
          className="pl-10 pr-10 py-6 text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (debouncedQuery.length >= 2 && suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-14 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Xóa tìm kiếm</span>
          </Button>
        )}
        <Button
          type="submit"
          className="absolute right-0 top-0 h-full rounded-l-none"
          disabled={isPending || !query.trim()}
        >
          {isPending ? "Đang tìm..." : "Tìm kiếm"}
        </Button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 max-h-80 overflow-auto">
          {isLoading ? (
            <div className="p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-2 px-3">
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-muted flex items-center"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-muted-foreground">Không tìm thấy gợi ý</div>
          )}
        </div>
      )}
    </form>
  )
}

