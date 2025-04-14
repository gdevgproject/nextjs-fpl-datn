"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, Info } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useInventory } from "../hooks/use-inventory"
import { InventoryDetailsDialog } from "./inventory-details-dialog"

interface InventoryTableProps {
  filters: {
    search?: string
    variantId?: number
    reason?: string
    startDate?: string
    endDate?: string
    minChange?: number
    maxChange?: number
  }
  pagination: {
    page: number
    pageSize: number
  }
  sort: {
    column: string
    direction: "asc" | "desc"
  }
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSortChange: (sort: { column: string; direction: "asc" | "desc" }) => void
}

export function InventoryTable({
  filters,
  pagination,
  sort,
  onPageChange,
  onPageSizeChange,
  onSortChange,
}: InventoryTableProps) {
  const [selectedInventory, setSelectedInventory] = useState<any | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Fetch inventory data
  const { data, isLoading, isError } = useInventory(filters, pagination, sort)
  const inventoryItems = data?.data || []
  const totalCount = data?.count || 0

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pagination.pageSize)

  // Handle sort change
  const handleSort = (column: string) => {
    if (sort.column === column) {
      // Toggle direction if same column
      onSortChange({
        column,
        direction: sort.direction === "asc" ? "desc" : "asc",
      })
    } else {
      // Default to ascending for new column
      onSortChange({
        column,
        direction: "asc",
      })
    }
  }

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sort.column !== column) return null
    return sort.direction === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
  }

  // Handle view details
  const handleViewDetails = (inventory: any) => {
    setSelectedInventory(inventory)
    setIsDetailsDialogOpen(true)
  }

  // Render pagination
  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Adjust start page if end page is maxed out
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Add first page
    if (startPage > 1) {
      pages.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
        </PaginationItem>,
      )
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink isActive={pagination.page === i} onClick={() => onPageChange(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Add last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }
      pages.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => onPageChange(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>,
      )
    }

    return pages
  }

  if (isError) {
    return <div className="text-center py-4 text-red-500">Đã xảy ra lỗi khi tải dữ liệu</div>
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px] cursor-pointer" onClick={() => handleSort("timestamp")}>
                <div className="flex items-center">
                  Thời gian
                  {renderSortIndicator("timestamp")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("product_variants.products.name")}>
                <div className="flex items-center">
                  Sản phẩm
                  {renderSortIndicator("product_variants.products.name")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("change_amount")}>
                <div className="flex items-center">
                  Thay đổi
                  {renderSortIndicator("change_amount")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("stock_after_change")}>
                <div className="flex items-center">
                  Tồn kho sau
                  {renderSortIndicator("stock_after_change")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("reason")}>
                <div className="flex items-center">
                  Lý do
                  {renderSortIndicator("reason")}
                </div>
              </TableHead>
              <TableHead className="text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : inventoryItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Không tìm thấy dữ liệu phù hợp
                </TableCell>
              </TableRow>
            ) : (
              inventoryItems.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {format(new Date(item.timestamp), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.product_variants?.products?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.product_variants?.volume_ml}ml - SKU: {item.product_variants?.sku}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.change_amount > 0 ? "success" : item.change_amount < 0 ? "destructive" : "outline"}
                    >
                      {item.change_amount > 0 ? "+" : ""}
                      {item.change_amount}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.stock_after_change}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={item.reason}>
                    {item.reason}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(item)}>
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Xem chi tiết</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Hiển thị</span>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number.parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pagination.pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">trên tổng số {totalCount} bản ghi</span>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
              />
            </PaginationItem>

            {renderPagination()}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, pagination.page + 1))}
                disabled={pagination.page === totalPages || totalPages === 0}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <InventoryDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        inventory={selectedInventory}
      />
    </div>
  )
}
