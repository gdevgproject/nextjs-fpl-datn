"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Search, Filter, MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface BrandProductsTableProps {
  brandId: string
}

export function BrandProductsTable({ brandId }: BrandProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Dữ liệu mẫu cho sản phẩm
  const sampleProducts = [
    {
      id: "1",
      name: "Chanel No. 5",
      sku: "CH-N5-100",
      price: 3200000,
      stock: 15,
      image: "/placeholder.svg?height=80&width=80",
      status: "active",
    },
    {
      id: "2",
      name: "Chanel Coco Mademoiselle",
      sku: "CH-CM-100",
      price: 3500000,
      stock: 8,
      image: "/placeholder.svg?height=80&width=80",
      status: "active",
    },
    {
      id: "3",
      name: "Chanel Chance Eau Tendre",
      sku: "CH-CET-100",
      price: 3300000,
      stock: 12,
      image: "/placeholder.svg?height=80&width=80",
      status: "active",
    },
    {
      id: "4",
      name: "Chanel Bleu de Chanel",
      sku: "CH-BDC-100",
      price: 3400000,
      stock: 5,
      image: "/placeholder.svg?height=80&width=80",
      status: "active",
    },
    {
      id: "5",
      name: "Chanel Allure Homme Sport",
      sku: "CH-AHS-100",
      price: 3100000,
      stock: 0,
      image: "/placeholder.svg?height=80&width=80",
      status: "out_of_stock",
    },
  ]

  // Lọc sản phẩm theo tìm kiếm
  const filteredProducts = sampleProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Lọc</span>
        </Button>
        <Link href={`/admin/san-pham/them?brand=${brandId}`}>
          <Button>Thêm sản phẩm</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Tên sản phẩm
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Giá</TableHead>
              <TableHead className="text-center">Tồn kho</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Không tìm thấy sản phẩm nào
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.stock > 0 ? "outline" : "destructive"}>{product.stock}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.status === "active" ? "default" : "secondary"}>
                      {product.status === "active" ? "Đang bán" : "Hết hàng"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/admin/san-pham/${product.id}`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end">
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

