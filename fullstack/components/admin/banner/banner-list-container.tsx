"use client"

import { useState } from "react"
import { BannerList } from "./banner-list"
import { BannerToolbar } from "./banner-toolbar"
import { BannerViewToggle } from "./banner-view-toggle"
import { BannerBulkActions } from "./banner-bulk-actions"
import { Card } from "@/components/ui/card"

interface BannerListContainerProps {
  filter?: "all" | "active" | "inactive" | "scheduled" | "expired"
}

export function BannerListContainer({ filter = "all" }: BannerListContainerProps) {
  const [view, setView] = useState<"list" | "grid" | "calendar">("list")
  const [selectedBanners, setSelectedBanners] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<string>("display_order")

  const handleViewChange = (newView: "list" | "grid" | "calendar") => {
    setView(newView)
  }

  const handleBannerSelect = (bannerId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedBanners([...selectedBanners, bannerId])
    } else {
      setSelectedBanners(selectedBanners.filter((id) => id !== bannerId))
    }
  }

  const handleSelectAll = (isSelected: boolean) => {
    // This would normally fetch all banner IDs from the current filter
    const allBannerIds = ["1", "2", "3", "4"] // Mock data
    setSelectedBanners(isSelected ? allBannerIds : [])
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (order: string) => {
    setSortOrder(order)
  }

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on banners:`, selectedBanners)
    // Reset selection after action
    setSelectedBanners([])
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <BannerToolbar onSearch={handleSearch} onSort={handleSort} sortOrder={sortOrder} />
          <BannerViewToggle view={view} onViewChange={handleViewChange} />
        </div>

        {selectedBanners.length > 0 && (
          <div className="mt-4">
            <BannerBulkActions
              selectedCount={selectedBanners.length}
              onAction={handleBulkAction}
              onClearSelection={() => setSelectedBanners([])}
            />
          </div>
        )}
      </div>

      <BannerList
        filter={filter}
        view={view}
        searchQuery={searchQuery}
        sortOrder={sortOrder}
        selectedBanners={selectedBanners}
        onBannerSelect={handleBannerSelect}
        onSelectAll={handleSelectAll}
      />
    </Card>
  )
}

