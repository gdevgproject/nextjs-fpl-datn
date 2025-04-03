"use client"

import { useState } from "react"
import { BrandStats } from "@/components/admin/thuong-hieu/brand-stats"
import { BrandFilters } from "@/components/admin/thuong-hieu/brand-filters"
import { BrandListEnhanced } from "@/components/admin/thuong-hieu/brand-list-enhanced"
import { BrandGridView } from "@/components/admin/thuong-hieu/brand-grid-view"
import { Button } from "@/components/ui/button"
import { Grid, List } from "lucide-react"

export function BrandDashboard() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "name",
    sortOrder: "asc",
    hasProducts: "all",
  })

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  return (
    <div className="space-y-6">
      <BrandStats />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <BrandFilters filters={filters} onFilterChange={handleFilterChange} />

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="h-9 w-9"
          >
            <List className="h-4 w-4" />
            <span className="sr-only">Chế độ danh sách</span>
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="h-9 w-9"
          >
            <Grid className="h-4 w-4" />
            <span className="sr-only">Chế độ lưới</span>
          </Button>
        </div>
      </div>

      {viewMode === "list" ? <BrandListEnhanced filters={filters} /> : <BrandGridView filters={filters} />}
    </div>
  )
}

