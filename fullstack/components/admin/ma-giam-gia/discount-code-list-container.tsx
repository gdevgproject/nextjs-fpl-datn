"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Download, Upload, RefreshCw } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DiscountCodeList } from "@/components/admin/ma-giam-gia/discount-code-list"
import { DiscountCodeFilters } from "@/components/admin/ma-giam-gia/discount-code-filters"
import { DiscountCodeStats } from "@/components/admin/ma-giam-gia/discount-code-stats"
import { DiscountCodeBulkActions } from "@/components/admin/ma-giam-gia/discount-code-bulk-actions"
import { DiscountCodeImportDialog } from "@/components/admin/ma-giam-gia/discount-code-import-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"

// Mẫu dữ liệu thống kê
const statsData = {
  total: 24,
  active: 12,
  expired: 8,
  scheduled: 4,
  usageCount: 156,
  totalDiscount: 12500000,
}

export function DiscountCodeListContainer() {
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [activeTab, setActiveTab] = useState("all")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    dateRange: {
      from: undefined,
      to: undefined,
    },
  })

  const handleRefresh = async () => {
    setIsLoading(true)

    try {
      // Giả lập tải lại dữ liệu
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Đã tải lại dữ liệu",
        description: "Danh sách mã giảm giá đã được cập nhật.",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải lại dữ liệu. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      // Giả lập xuất dữ liệu
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Xuất dữ liệu thành công",
        description: "Dữ liệu mã giảm giá đã được xuất thành công.",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleImport = async (file: File) => {
    try {
      // Giả lập nhập dữ liệu
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setShowImportDialog(false)

      toast({
        title: "Nhập dữ liệu thành công",
        description: `Đã nhập ${file.name} thành công.`,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi nhập dữ liệu. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters })
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSelectedItems([])

    // Cập nhật bộ lọc dựa trên tab
    if (value === "all") {
      handleFilterChange({ status: "all" })
    } else if (value === "active") {
      handleFilterChange({ status: "active" })
    } else if (value === "scheduled") {
      handleFilterChange({ status: "scheduled" })
    } else if (value === "expired") {
      handleFilterChange({ status: "expired" })
    }
  }

  const handleSelectionChange = (items: string[]) => {
    setSelectedItems(items)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <DiscountCodeStats stats={statsData} />

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Tải lại</span>
          </Button>

          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleExport}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </Button>

          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setShowImportDialog(true)}>
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Nhập Excel</span>
          </Button>

          <Button asChild size="sm" className="h-8 gap-1">
            <Link href="/admin/ma-giam-gia/them">
              <PlusCircle className="h-4 w-4" />
              <span>Thêm mã giảm giá</span>
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              Tất cả ({statsData.total})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">
              Đang hoạt động ({statsData.active})
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="text-xs sm:text-sm">
              Lên lịch ({statsData.scheduled})
            </TabsTrigger>
            <TabsTrigger value="expired" className="text-xs sm:text-sm">
              Hết hạn ({statsData.expired})
            </TabsTrigger>
          </TabsList>

          <DiscountCodeFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {selectedItems.length > 0 && (
          <DiscountCodeBulkActions selectedCount={selectedItems.length} onClearSelection={() => setSelectedItems([])} />
        )}

        <TabsContent value="all" className="mt-6">
          <DiscountCodeList status="all" selectedItems={selectedItems} onSelectionChange={handleSelectionChange} />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <DiscountCodeList status="active" selectedItems={selectedItems} onSelectionChange={handleSelectionChange} />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <DiscountCodeList
            status="scheduled"
            selectedItems={selectedItems}
            onSelectionChange={handleSelectionChange}
          />
        </TabsContent>

        <TabsContent value="expired" className="mt-6">
          <DiscountCodeList status="expired" selectedItems={selectedItems} onSelectionChange={handleSelectionChange} />
        </TabsContent>
      </Tabs>

      <DiscountCodeImportDialog open={showImportDialog} onOpenChange={setShowImportDialog} onImport={handleImport} />
    </div>
  )
}

