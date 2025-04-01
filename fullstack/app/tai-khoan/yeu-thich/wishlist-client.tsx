"use client"

import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WishlistGrid } from "@/components/tai-khoan/wishlist-grid"
import { WishlistList } from "@/components/tai-khoan/wishlist-list"
import { WishlistFilter } from "@/components/tai-khoan/wishlist-filter"
import { WishlistHeader } from "@/components/tai-khoan/wishlist-header"
import { WishlistEmpty } from "@/components/tai-khoan/wishlist-empty"
import { WishlistBulkActions } from "@/components/tai-khoan/wishlist-bulk-actions"
import { WishlistSkeleton } from "@/components/tai-khoan/wishlist-skeleton"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useWishlist } from "@/lib/hooks/use-wishlist"

export function WishlistClient() {
  const { items, isLoading } = useWishlist()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleSelectItem = (id: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems([...selectedItems, id])
    } else {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
    }
  }

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(items.map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  if (isLoading) {
    return <WishlistSkeleton />
  }

  return (
    <div className="space-y-6">
      <WishlistHeader itemCount={items.length} viewMode={viewMode} onViewModeChange={setViewMode} />
      <Separator />

      {items.length > 0 ? (
        <>
          <WishlistFilter />

          {selectedItems.length > 0 && (
            <WishlistBulkActions
              selectedCount={selectedItems.length}
              selectedItems={selectedItems}
              onClearSelection={() => setSelectedItems([])}
            />
          )}

          {isMobile ? (
            <WishlistGrid items={items} selectedItems={selectedItems} onSelectItem={handleSelectItem} />
          ) : (
            <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
              <TabsList className="hidden md:flex mb-4">
                <TabsTrigger value="grid">Dạng lưới</TabsTrigger>
                <TabsTrigger value="list">Dạng danh sách</TabsTrigger>
              </TabsList>
              <TabsContent value="grid">
                <WishlistGrid
                  items={items}
                  selectedItems={selectedItems}
                  onSelectItem={handleSelectItem}
                  onSelectAll={handleSelectAll}
                />
              </TabsContent>
              <TabsContent value="list">
                <WishlistList
                  items={items}
                  selectedItems={selectedItems}
                  onSelectItem={handleSelectItem}
                  onSelectAll={handleSelectAll}
                />
              </TabsContent>
            </Tabs>
          )}
        </>
      ) : (
        <WishlistEmpty />
      )}
    </div>
  )
}

