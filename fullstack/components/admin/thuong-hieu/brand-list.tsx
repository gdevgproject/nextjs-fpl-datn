"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Trash2, ChevronDown, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BrandDeleteDialog } from "@/components/admin/thuong-hieu/brand-delete-dialog"
import type { Brand } from "@/types/san-pham"

export function BrandList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<(Brand & { productCount?: number }) | null>(null)

  // Dữ liệu mẫu cho thương hiệu
  const sampleBrands: (Brand & { productCount: number })[] = [
    {
      id: "1",
      name: "Chanel",
      slug: "chanel",
      description: "Thương hiệu nước hoa cao cấp từ Pháp",
      logo_url: "/placeholder.svg?height=80&width=80",
      created_at: "2023-01-01T00:00:00Z",
      productCount: 24,
    },
    {
      id: "2",
      name: "Dior",
      slug: "dior",
      description: "Thương hiệu nước hoa cao cấp từ Pháp",
      logo_url: "/placeholder.svg?height=80&width=80",
      created_at: "2023-01-01T00:00:00Z",
      productCount: 18,
    },
    {
      id: "3",
      name: "Gucci",
      slug: "gucci",
      description: "Thương hiệu nước hoa cao cấp từ Ý",
      logo_url: "/placeholder.svg?height=80&width=80",
      created_at: "2023-01-01T00:00:00Z",
      productCount: 15,
    },
    {
      id: "4",
      name: "Versace",
      slug: "versace",
      description: "Thương hiệu nước hoa cao cấp từ Ý",
      logo_url: "/placeholder.svg?height=80&width=80",
      created_at: "2023-01-01T00:00:00Z",
      productCount: 12,
    },
    {
      id: "5",
      name: "Calvin Klein",
      slug: "calvin-klein",
      description: "Thương hiệu nước hoa từ Mỹ",
      logo_url: "/placeholder.svg?height=80&width=80",
      created_at: "2023-01-01T00:00:00Z",
      productCount: 10,
    },
    {
      id: "6",
      name: "Tom Ford",
      slug: "tom-ford",
      description: "Thương hiệu nước hoa cao cấp từ Mỹ",
      logo_url: "/placeholder.svg?height=80&width=80",
      created_at: "2023-01-01T00:00:00Z",
      productCount: 8,
    },
  ]

  const filteredBrands = sampleBrands.filter((brand) => brand.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleDeleteClick = (brand: Brand & { productCount: number }) => {
    setBrandToDelete(brand)
    setIsDeleteDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách thương hiệu</CardTitle>
        <CardDescription>Quản lý thương hiệu sản phẩm của cửa hàng</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm thương hiệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Logo</TableHead>
                <TableHead>Tên thương hiệu</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Số sản phẩm</TableHead>
                <TableHead className="w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <Image
                        src={brand.logo_url || "/placeholder.svg?height=80&width=80"}
                        alt={brand.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.description}</TableCell>
                  <TableCell>{brand.productCount}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/admin/thuong-hieu/${brand.id}`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/thuong-hieu/${brand.slug}`} target="_blank">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem trang
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(brand)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <BrandDeleteDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} brand={brandToDelete} />
    </Card>
  )
}

