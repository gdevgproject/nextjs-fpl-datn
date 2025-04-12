"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Trash2, MoreHorizontal, ExternalLink, Copy, Star, StarOff } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BrandDeleteDialog } from "@/components/admin/thuong-hieu/brand-delete-dialog"
import { BrandDuplicateDialog } from "@/components/admin/thuong-hieu/brand-duplicate-dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { Brand } from "@/types/san-pham"

interface BrandGridViewProps {
  filters: {
    search: string
    sortBy: string
    sortOrder: string
    hasProducts: string
  }
}

export function BrandGridView({ filters }: BrandGridViewProps) {
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<(Brand & { productCount?: number }) | null>(null)
  const [brandToDuplicate, setBrandToDuplicate] = useState<Brand | null>(null)

  // Dữ liệu mẫu cho thương hiệu
  const sampleBrands: (Brand & { productCount: number; isFeatured: boolean; origin: string })[] = [
    {
      id: "1",
      name: "Chanel",
      slug: "chanel",
      description: "Thương hiệu nước hoa cao cấp từ Pháp",
      logo_url: "/placeholder.svg?height=80&width=80",
      created_at: "2023-01-01T00:00:00Z",
      productCount: 24,
      isFeatured: true,
      origin: "Pháp",
    },
    {
      id: "2",
      name: "Dior",
      slug: "dior",
      description: "Thương hiệu nước hoa cao cấp từ Pháp",
      logo_url: "/placeholder.svg?height=80&width=80",
      created_at: "2023-01-01T00:00:00Z",
      productCount: 18,
      isFeatured: true,
      origin: "Pháp",
    },
    {
      id: "3",
      name: "Gucci",
      slug: "gucci",
      description: "Thương hiệu nước hoa cao cấp từ Ý",
      logo_url: "/placeholder.svg?height=80&width=80",
      created_at: "2023-01-01T00:00:00Z",
      productCount: 15,
      isFeatured: false,
      origin: "Ý",
    },
    {
      id: "4",
      name: "Versace",
      slug: "versace",
      description: "Thương hiệu nước hoa cao cấp từ Ý",
      logo_url: "/placeholder.svg?height=80&width=80",
      created_at: "2023-01-01T00:00:00Z",
      productCount: 12,
      isFeatured: false,
      origin: "Ý",
    },
    {
      id: "5",
      name: "Calvin Klein",
      slug: "calvin-klein",
      description: "Thương hiệu nước hoa từ Mỹ",
      logo_url: "/placeholder.svg?height=80&width=80",
      created_at: "2023-01-01T00:00:00Z",
      productCount: 10,
      isFeatured: false,
      origin: "Mỹ",
    },
    {
      id: "6",
      name: "Tom Ford",
      slug: "tom-ford",
      description: "Thương hiệu nước hoa cao cấp từ Mỹ",
      logo_url: "/placeholder.svg?height=80&width=80",
      created_at: "2023-01-01T00:00:00Z",
      productCount: 8,
      isFeatured: true,
      origin: "Mỹ",
    },
  ]

  // Lọc thương hiệu dựa trên bộ lọc
  const filteredBrands = sampleBrands
    .filter((brand) => {
      // Lọc theo tìm kiếm
      if (filters.search && !brand.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Lọc theo có sản phẩm hay không
      if (filters.hasProducts === "yes" && brand.productCount === 0) {
        return false
      }
      if (filters.hasProducts === "no" && brand.productCount > 0) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Sắp xếp theo trường đã chọn
      if (filters.sortBy === "name") {
        return filters.sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      }
      if (filters.sortBy === "productCount") {
        return filters.sortOrder === "asc" ? a.productCount - b.productCount : b.productCount - a.productCount
      }
      if (filters.sortBy === "createdAt") {
        return filters.sortOrder === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return 0
    })

  const handleDeleteClick = (brand: Brand & { productCount: number }) => {
    setBrandToDelete(brand)
    setIsDeleteDialogOpen(true)
  }

  const handleDuplicateClick = (brand: Brand) => {
    setBrandToDuplicate(brand)
    setIsDuplicateDialogOpen(true)
  }

  const handleToggleFeatured = (brandId: string, isFeatured: boolean) => {
    // Giả lập việc cập nhật trạng thái nổi bật
    toast({
      title: `Thương hiệu đã ${isFeatured ? "bỏ đánh dấu" : "đánh dấu"} nổi bật`,
      description: `Thương hiệu đã được ${isFeatured ? "bỏ đánh dấu" : "đánh dấu"} là thương hiệu nổi bật.`,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {filteredBrands.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-md border">
          <p className="text-muted-foreground">Không tìm thấy thương hiệu nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBrands.map((brand) => (
            <Card key={brand.id} className="overflow-hidden">
              <CardHeader className="border-b p-0">
                <div className="relative aspect-[3/1] w-full bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-background p-1">
                      <Image
                        src={brand.logo_url || "/placeholder.svg?height=80&width=80"}
                        alt={brand.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  {brand.isFeatured && (
                    <div className="absolute right-2 top-2">
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">
                        <Star className="mr-1 h-3 w-3 fill-white" /> Nổi bật
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{brand.name}</h3>
                    <Badge variant="outline">{brand.productCount} sản phẩm</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{brand.slug}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Xuất xứ: {brand.origin}</span>
                    <span>•</span>
                    <span>Ngày tạo: {formatDate(brand.created_at)}</span>
                  </div>
                  <p className="line-clamp-2 text-sm">{brand.description}</p>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t p-4">
                <Button variant="ghost" size="icon" onClick={() => handleToggleFeatured(brand.id, brand.isFeatured)}>
                  {brand.isFeatured ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/thuong-hieu/${brand.id}`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Chỉnh sửa</span>
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Mở menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/thuong-hieu/${brand.slug}`} target="_blank">
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Xem trang
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={() => handleDuplicateClick(brand)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Nhân bản
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(brand)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <BrandDeleteDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} brand={brandToDelete} />

      <BrandDuplicateDialog
        open={isDuplicateDialogOpen}
        onOpenChange={setIsDuplicateDialogOpen}
        brand={brandToDuplicate}
      />
    </div>
  )
}

