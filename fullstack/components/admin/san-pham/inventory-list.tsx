"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, ArrowUpDown, AlertTriangle, CheckCircle, XCircle, History, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { InventoryHistory } from "@/components/admin/san-pham/inventory-history"
import { InventoryDetail } from "@/components/admin/san-pham/inventory-detail"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Dữ liệu mẫu cho tồn kho
const sampleInventory = [
  {
    id: "1",
    product_id: "1",
    product_name: "Chanel No. 5",
    product_code: "CH-N5-001",
    brand_name: "Chanel",
    variant_id: "1",
    volume_ml: 50,
    sku: "CH-N5-50ML",
    stock_quantity: 15,
    status: "in_stock", // in_stock, low_stock, out_of_stock
    main_image: "/placeholder.svg?height=80&width=80",
    price: 2500000,
    last_updated: "2023-06-15T10:30:00Z",
  },
  {
    id: "2",
    product_id: "1",
    product_name: "Chanel No. 5",
    product_code: "CH-N5-001",
    brand_name: "Chanel",
    variant_id: "2",
    volume_ml: 100,
    sku: "CH-N5-100ML",
    stock_quantity: 3,
    status: "low_stock",
    main_image: "/placeholder.svg?height=80&width=80",
    price: 4500000,
    last_updated: "2023-06-20T14:45:00Z",
  },
  {
    id: "3",
    product_id: "2",
    product_name: "Dior Sauvage",
    product_code: "DR-SV-002",
    brand_name: "Dior",
    variant_id: "3",
    volume_ml: 50,
    sku: "DR-SV-50ML",
    stock_quantity: 0,
    status: "out_of_stock",
    main_image: "/placeholder.svg?height=80&width=80",
    price: 2800000,
    last_updated: "2023-06-25T09:15:00Z",
  },
  {
    id: "4",
    product_id: "2",
    product_name: "Dior Sauvage",
    product_code: "DR-SV-002",
    brand_name: "Dior",
    variant_id: "4",
    volume_ml: 100,
    sku: "DR-SV-100ML",
    stock_quantity: 8,
    status: "in_stock",
    main_image: "/placeholder.svg?height=80&width=80",
    price: 4800000,
    last_updated: "2023-06-28T11:20:00Z",
  },
  {
    id: "5",
    product_id: "3",
    product_name: "Gucci Bloom",
    product_code: "GC-BL-003",
    brand_name: "Gucci",
    variant_id: "5",
    volume_ml: 50,
    sku: "GC-BL-50ML",
    stock_quantity: 12,
    status: "in_stock",
    main_image: "/placeholder.svg?height=80&width=80",
    price: 2300000,
    last_updated: "2023-07-05T08:45:00Z",
  },
  {
    id: "6",
    product_id: "3",
    product_name: "Gucci Bloom",
    product_code: "GC-BL-003",
    brand_name: "Gucci",
    variant_id: "6",
    volume_ml: 100,
    sku: "GC-BL-100ML",
    stock_quantity: 5,
    status: "low_stock",
    main_image: "/placeholder.svg?height=80&width=80",
    price: 4100000,
    last_updated: "2023-07-10T16:30:00Z",
  },
]

export function InventoryList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("name-asc")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [updateQuantity, setUpdateQuantity] = useState<number>(0)
  const [updateReason, setUpdateReason] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Còn hàng
          </Badge>
        )
      case "low_stock":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Sắp hết
          </Badge>
        )
      case "out_of_stock":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Hết hàng
          </Badge>
        )
      default:
        return null
    }
  }

  const handleUpdateStock = () => {
    // Xử lý cập nhật tồn kho
    console.log("Update stock", {
      item: selectedItem,
      quantity: updateQuantity,
      reason: updateReason,
    })

    // Reset form
    setSelectedItem(null)
    setUpdateQuantity(0)
    setUpdateReason("")
  }

  const filteredInventory = sampleInventory
    .filter((item) => {
      // Lọc theo từ khóa tìm kiếm
      const searchMatch =
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())

      // Lọc theo trạng thái
      const statusMatch = statusFilter === "all" || item.status === statusFilter

      return searchMatch && statusMatch
    })
    .sort((a, b) => {
      // Sắp xếp
      switch (sortOrder) {
        case "name-asc":
          return a.product_name.localeCompare(b.product_name)
        case "name-desc":
          return b.product_name.localeCompare(a.product_name)
        case "stock-asc":
          return a.stock_quantity - b.stock_quantity
        case "stock-desc":
          return b.stock_quantity - a.stock_quantity
        default:
          return 0
      }
    })

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="hidden md:table-cell">SKU</TableHead>
              <TableHead className="hidden sm:table-cell">Dung tích</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Tồn kho
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">Giá bán</TableHead>
              <TableHead className="hidden md:table-cell">Trạng thái</TableHead>
              <TableHead className="hidden lg:table-cell">Cập nhật lần cuối</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item) => (
              <TableRow
                key={item.id}
                className={
                  item.status === "out_of_stock"
                    ? "bg-red-50/30 dark:bg-red-950/10"
                    : item.status === "low_stock"
                      ? "bg-amber-50/30 dark:bg-amber-950/10"
                      : ""
                }
              >
                <TableCell>
                  <Image
                    src={item.main_image || "/placeholder.svg"}
                    alt={item.product_name}
                    width={50}
                    height={50}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.product_code} - {item.brand_name}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{item.sku}</TableCell>
                <TableCell className="hidden sm:table-cell">{item.volume_ml} ml</TableCell>
                <TableCell>
                  <span
                    className={
                      item.stock_quantity === 0
                        ? "text-red-600 font-medium"
                        : item.stock_quantity <= 5
                          ? "text-amber-600 font-medium"
                          : ""
                    }
                  >
                    {item.stock_quantity}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{formatPrice(item.price)}</TableCell>
                <TableCell className="hidden md:table-cell">{getStatusBadge(item.status)}</TableCell>
                <TableCell className="hidden lg:table-cell">{formatDate(item.last_updated)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedItem(item)
                              setShowDetail(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Xem chi tiết</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Dialog>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedItem(item)
                                  setUpdateQuantity(0)
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Nhập hàng</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cập nhật tồn kho</DialogTitle>
                          <DialogDescription>
                            Cập nhật số lượng tồn kho cho sản phẩm {selectedItem?.product_name} -{" "}
                            {selectedItem?.volume_ml} ml
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="current-quantity" className="text-right">
                              Hiện tại
                            </Label>
                            <Input
                              id="current-quantity"
                              value={selectedItem?.stock_quantity}
                              className="col-span-3"
                              disabled
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="add-quantity" className="text-right">
                              Thêm vào
                            </Label>
                            <Input
                              id="add-quantity"
                              type="number"
                              value={updateQuantity}
                              onChange={(e) => setUpdateQuantity(Number(e.target.value))}
                              min={1}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-quantity" className="text-right">
                              Mới
                            </Label>
                            <Input
                              id="new-quantity"
                              value={(selectedItem?.stock_quantity || 0) + updateQuantity}
                              className="col-span-3"
                              disabled
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reason" className="text-right">
                              Lý do
                            </Label>
                            <Textarea
                              id="reason"
                              placeholder="Nhập lý do cập nhật tồn kho"
                              value={updateReason}
                              onChange={(e) => setUpdateReason(e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedItem(null)}>
                            Hủy
                          </Button>
                          <Button onClick={handleUpdateStock}>Cập nhật</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedItem(item)
                              setShowHistory(true)
                            }}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lịch sử</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Phân trang */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage > 1) setCurrentPage(currentPage - 1)
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={currentPage === page}
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage(page)
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage < totalPages) setCurrentPage(currentPage + 1)
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Lịch sử cập nhật tồn kho</DialogTitle>
            <DialogDescription>
              {selectedItem?.product_name} - {selectedItem?.volume_ml} ml ({selectedItem?.sku})
            </DialogDescription>
          </DialogHeader>

          <InventoryHistory variantId={selectedItem?.variant_id} />
        </DialogContent>
      </Dialog>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết sản phẩm</DialogTitle>
            <DialogDescription>Thông tin chi tiết về sản phẩm và tồn kho</DialogDescription>
          </DialogHeader>

          <InventoryDetail item={selectedItem} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

