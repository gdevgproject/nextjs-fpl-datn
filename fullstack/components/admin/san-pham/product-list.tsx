"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Trash2, MoreHorizontal, Eye, Copy, CheckCircle, XCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Thêm import cho component ProductExport và ProductDeleteDialog
import { ProductExport } from "@/components/admin/san-pham/product-export"
import { ProductDeleteDialog } from "@/components/admin/san-pham/product-delete-dialog"

// Dữ liệu mẫu cho sản phẩm
const sampleProducts = [
  {
    id: "1",
    name: "Chanel No. 5",
    product_code: "CH-N5-001",
    brand_name: "Chanel",
    gender_name: "Nữ",
    perfume_type_name: "Eau de Parfum",
    status: "active",
    price: 3200000,
    stock_quantity: 25,
    main_image: "/placeholder.svg?height=80&width=80",
    created_at: "2023-01-15T00:00:00Z",
  },
  {
    id: "2",
    name: "Dior Sauvage",
    product_code: "DR-SV-002",
    brand_name: "Dior",
    gender_name: "Nam",
    perfume_type_name: "Eau de Toilette",
    status: "active",
    price: 2800000,
    stock_quantity: 18,
    main_image: "/placeholder.svg?height=80&width=80",
    created_at: "2023-02-20T00:00:00Z",
  },
  {
    id: "3",
    name: "Gucci Bloom",
    product_code: "GC-BL-003",
    brand_name: "Gucci",
    gender_name: "Nữ",
    perfume_type_name: "Eau de Parfum",
    status: "active",
    price: 2500000,
    stock_quantity: 12,
    main_image: "/placeholder.svg?height=80&width=80",
    created_at: "2023-03-10T00:00:00Z",
  },
  {
    id: "4",
    name: "Versace Eros",
    product_code: "VS-ER-004",
    brand_name: "Versace",
    gender_name: "Nam",
    perfume_type_name: "Eau de Toilette",
    status: "out_of_stock",
    price: 1800000,
    stock_quantity: 0,
    main_image: "/placeholder.svg?height=80&width=80",
    created_at: "2023-04-05T00:00:00Z",
  },
  {
    id: "5",
    name: "Calvin Klein CK One",
    product_code: "CK-ONE-005",
    brand_name: "Calvin Klein",
    gender_name: "Unisex",
    perfume_type_name: "Eau de Toilette",
    status: "deleted",
    price: 1500000,
    stock_quantity: 8,
    main_image: "/placeholder.svg?height=80&width=80",
    created_at: "2023-05-12T00:00:00Z",
  },
]

export function ProductList() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [sortOrder, setSortOrder] = useState("newest")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Còn hàng
          </Badge>
        )
      case "out_of_stock":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Hết hàng
          </Badge>
        )
      case "deleted":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Đã xóa
          </Badge>
        )
      default:
        return null
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const TableView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Ảnh</TableHead>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>Mã SP</TableHead>
            <TableHead>Thương hiệu</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Tồn kho</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Image
                  src={product.main_image || "/placeholder.svg"}
                  alt={product.name}
                  width={50}
                  height={50}
                  className="rounded-md object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.product_code}</TableCell>
              <TableCell>{product.brand_name}</TableCell>
              <TableCell>{formatPrice(product.price)}</TableCell>
              <TableCell>{product.stock_quantity}</TableCell>
              <TableCell>{getStatusBadge(product.status)}</TableCell>
              <TableCell>{formatDate(product.created_at)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Mở menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/san-pham/${product.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/san-pham/${product.id}`} target="_blank">
                        <Eye className="mr-2 h-4 w-4" />
                        Xem sản phẩm
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Nhân bản
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <ProductDeleteDialog
                        productId={product.id}
                        productName={product.name}
                        productCode={product.product_code}
                        variant="icon"
                      />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const GridView = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sampleProducts.map((product) => (
        <Card key={product.id}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Image
                src={product.main_image || "/placeholder.svg"}
                alt={product.name}
                width={80}
                height={80}
                className="rounded-md object-cover"
              />
              <div className="flex-1 space-y-1">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.product_code}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{product.brand_name}</Badge>
                  <Badge variant="outline">{product.gender_name}</Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{formatPrice(product.price)}</p>
                <p className="text-sm text-muted-foreground">Tồn kho: {product.stock_quantity}</p>
              </div>
              {getStatusBadge(product.status)}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Ngày tạo: {formatDate(product.created_at)}</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href={`/admin/san-pham/${product.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="icon" className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" onClick={() => setViewMode("table")}>
            Bảng
          </Button>
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            Lưới
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
              <SelectItem value="name-asc">Tên A-Z</SelectItem>
              <SelectItem value="name-desc">Tên Z-A</SelectItem>
              <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
              <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
            </SelectContent>
          </Select>

          <ProductExport totalProducts={sampleProducts.length} />
        </div>
      </div>

      {viewMode === "table" ? <TableView /> : <GridView />}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Hiển thị 1-5 của 5 sản phẩm</p>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

