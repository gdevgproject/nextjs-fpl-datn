"use client"

import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

import { ProductList } from "@/components/admin/san-pham/product-list"
import { ProductFilter } from "@/components/admin/san-pham/product-filter"
import { ProductStats } from "@/components/admin/san-pham/product-stats"
import { ProductToolbar } from "@/components/admin/san-pham/product-toolbar"
import { ProductBulkActions } from "@/components/admin/san-pham/product-bulk-actions"

export function ProductDashboard() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const isDesktop = useMediaQuery("(min-width: 1024px)")

  // Xử lý chọn sản phẩm
  const handleProductSelection = (productId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedProducts((prev) => [...prev, productId])
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId))
    }
  }

  // Xử lý chọn tất cả sản phẩm
  const handleSelectAll = (isSelected: boolean) => {
    // Trong thực tế, sẽ lấy tất cả ID sản phẩm từ API
    const allProductIds = ["1", "2", "3", "4", "5"]
    setSelectedProducts(isSelected ? allProductIds : [])
  }

  // Xử lý xóa lựa chọn
  const handleClearSelection = () => {
    setSelectedProducts([])
  }

  return (
    <div className="space-y-6">
      <ProductStats />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="active">Còn hàng</TabsTrigger>
            <TabsTrigger value="out_of_stock">Hết hàng</TabsTrigger>
            <TabsTrigger value="deleted">Đã xóa</TabsTrigger>
          </TabsList>

          <ProductToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFilterToggle={() => setFilterOpen(!filterOpen)}
            filterOpen={filterOpen}
          />
        </div>

        {selectedProducts.length > 0 && (
          <ProductBulkActions selectedCount={selectedProducts.length} onClearSelection={handleClearSelection} />
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {(filterOpen || isDesktop) && (
            <Card className="w-full lg:w-72 h-fit sticky top-20">
              <ProductFilter onClose={() => setFilterOpen(false)} />
            </Card>
          )}

          <div className="flex-1">
            <TabsContent value="all" className="m-0">
              <ProductList
                viewMode={viewMode}
                selectedProducts={selectedProducts}
                onProductSelection={handleProductSelection}
                onSelectAll={handleSelectAll}
              />
            </TabsContent>
            <TabsContent value="active" className="m-0">
              <ProductList
                viewMode={viewMode}
                status="active"
                selectedProducts={selectedProducts}
                onProductSelection={handleProductSelection}
                onSelectAll={handleSelectAll}
              />
            </TabsContent>
            <TabsContent value="out_of_stock" className="m-0">
              <ProductList
                viewMode={viewMode}
                status="out_of_stock"
                selectedProducts={selectedProducts}
                onProductSelection={handleProductSelection}
                onSelectAll={handleSelectAll}
              />
            </TabsContent>
            <TabsContent value="deleted" className="m-0">
              <ProductList
                viewMode={viewMode}
                status="deleted"
                selectedProducts={selectedProducts}
                onProductSelection={handleProductSelection}
                onSelectAll={handleSelectAll}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

