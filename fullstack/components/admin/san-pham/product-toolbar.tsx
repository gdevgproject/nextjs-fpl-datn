"use client"

import { useState } from "react"
import { LayoutGrid, List, SlidersHorizontal, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductExport } from "@/components/admin/san-pham/product-export"
import { ProductSort } from "@/components/admin/san-pham/product-sort"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ProductToolbarProps {
  viewMode: "grid" | "table"
  onViewModeChange: (mode: "grid" | "table") => void
  onFilterToggle: () => void
  filterOpen: boolean
}

export function ProductToolbar({ viewMode, onViewModeChange, onFilterToggle, filterOpen }: ProductToolbarProps) {
  const [searchValue, setSearchValue] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const isMobile = useMediaQuery("(max-width: 640px)")

  const handleSearchClear = () => {
    setSearchValue("")
  }

  return (
    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
      {showSearch || !isMobile ? (
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-8 pr-8 w-full"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={handleSearchClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <Button variant="outline" size="icon" onClick={() => setShowSearch(true)}>
          <Search className="h-4 w-4" />
        </Button>
      )}

      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={onFilterToggle}
          className={filterOpen ? "bg-primary text-primary-foreground" : ""}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>

        <div className="hidden sm:flex items-center gap-1 border rounded-md">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-none rounded-l-md"
            onClick={() => onViewModeChange("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-none rounded-r-md"
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>

        <ProductSort />

        <ProductExport totalProducts={156} />
      </div>
    </div>
  )
}

