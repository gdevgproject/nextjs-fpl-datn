"use client"

import { useState } from "react"
import { Search, Filter, Download, Upload, RefreshCw, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { InventoryFilter } from "@/components/admin/san-pham/inventory-filter"
import { InventoryBulkUpdate } from "@/components/admin/san-pham/inventory-bulk-update"
import { useMediaQuery } from "@/hooks/use-media-query"

export function InventoryToolbar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("name-asc")
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm, mã sản phẩm, SKU..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="h-4 w-4 mr-2" />
                Lọc
              </Button>
            </SheetTrigger>
            <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[85%]" : ""}>
              <SheetHeader>
                <SheetTitle>Lọc sản phẩm</SheetTitle>
                <SheetDescription>Lọc sản phẩm theo các tiêu chí khác nhau</SheetDescription>
              </SheetHeader>
              <InventoryFilter onClose={() => {}} />
            </SheetContent>
          </Sheet>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Tên A-Z</SelectItem>
              <SelectItem value="name-desc">Tên Z-A</SelectItem>
              <SelectItem value="stock-asc">Tồn kho thấp-cao</SelectItem>
              <SelectItem value="stock-desc">Tồn kho cao-thấp</SelectItem>
              <SelectItem value="updated-desc">Mới cập nhật nhất</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-10">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="in_stock">Còn hàng</SelectItem>
              <SelectItem value="low_stock">Sắp hết hàng</SelectItem>
              <SelectItem value="out_of_stock">Hết hàng</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9">
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Sheet open={showBulkUpdate} onOpenChange={setShowBulkUpdate}>
            <SheetTrigger asChild>
              <Button size="sm" className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                Nhập hàng hàng loạt
              </Button>
            </SheetTrigger>
            <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[85%]" : ""}>
              <SheetHeader>
                <SheetTitle>Nhập hàng hàng loạt</SheetTitle>
                <SheetDescription>Cập nhật số lượng tồn kho cho nhiều sản phẩm cùng lúc</SheetDescription>
              </SheetHeader>
              <InventoryBulkUpdate onClose={() => setShowBulkUpdate(false)} />
            </SheetContent>
          </Sheet>

          <Button variant="outline" size="sm" className="h-9">
            <Upload className="h-4 w-4 mr-2" />
            Tải lên Excel
          </Button>
        </div>
      </div>
    </div>
  )
}

