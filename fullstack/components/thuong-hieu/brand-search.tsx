"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface BrandSearchProps {
  initialQuery?: string
}

export function BrandSearch({ initialQuery = "" }: BrandSearchProps) {
  const [query, setQuery] = useState(initialQuery || "")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Đồng bộ query từ URL khi component mount
  useEffect(() => {
    setQuery(initialQuery || "")
  }, [initialQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    if (query) {
      params.set("query", query)
    } else {
      params.delete("query")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearSearch = () => {
    setQuery("")

    const params = new URLSearchParams(searchParams.toString())
    params.delete("query")

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="relative mb-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm thương hiệu..."
            className="pl-9 pr-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit">Tìm kiếm</Button>
      </div>
    </form>
  )
}

