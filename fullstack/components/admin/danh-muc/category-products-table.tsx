"use client"

import { useState } from "react"
import Link from "next/link"
import { Edit, Trash2, MoreHorizontal, ArrowUpDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface CategoryProductsTableProps {
  categoryId: string
}

export function CategoryProductsTable({ categoryId }: CategoryProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Dữ liệu mẫu cho sản phẩm trong danh mục
  const sampleProducts = [
    {
      id: "1",
      name: "Dior Sauvage Eau de Parfum",
      sku: "DIOR-SAV-EDP-100",
      price: 2850000,
      stock: 15,
      status: "active",
    },
    {
      id: "2",
      name: "Chanel Bleu de Chanel Parfum",
      sku: "CHANEL-BDC-P-100",
      price: 3200000,
      stock: 8,
      status: "active",
    },
    {
      id: "3",
      name: "Versace Eros Eau de Toilette",
      sku: "VERSACE-EROS-EDT-100",
      price: 1950000,
      stock: 20,
      status: "active",
    },
    {
      id: "4",
      name: "Armani Acqua di Gio Profumo",
      sku: "ARMANI-ADG-P-75",
      price: 2500000,
      stock: 12,
      status: "active",
    },
    {
      id: "5",
      name: "Tom Ford Tobacco Vanille",
      sku: "TOMFORD-TV-EDP-50",
      price: 5800000,
      stock: 5,
      status: "active",
    },
  ]

  const filteredProducts = sampleProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRemoveFromCategory = (productId: string, productName: string) => {
    // Giả lập việc xóa sản phẩm khỏi danh mục
    toast.success(`Đã xóa sản phẩm "${productName}" khỏi danh mục`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/san-pham?category=${categoryId}`}>Quản lý sản phẩm</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center space-x-1">
                  <span>Sản phẩm</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">SKU</TableHead>
              <TableHead className="text-right">Giá</TableHead>
              <TableHead className="text-center hidden md:table-cell">Tồn kho</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground md:hidden">{product.sku}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{product.sku}</TableCell>
                  <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
                  <TableCell className="text-center hidden md:table-cell">{product.stock}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.status === "active" ? "default" : "secondary"}>
                      {product.status === "active" ? "Đang bán" : "Ngừng bán"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/admin/san-pham/${product.id}`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleRemoveFromCategory(product.id, product.name)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa khỏi danh mục
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Không tìm thấy sản phẩm nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" disabled>
            Trước
          </Button>
          <Button variant="outline" size="sm" className="px-4">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Sau
          </Button>
        </div>
      )}
    </div>
  )
}

