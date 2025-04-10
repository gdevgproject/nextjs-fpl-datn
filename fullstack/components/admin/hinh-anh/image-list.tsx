"use client"

import { useState } from "react"
import { ImageCard } from "./image-card"
import { ImageDetailDialog } from "./image-detail-dialog"
import { ImageDeleteDialog } from "./image-delete-dialog"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"

interface ImageListProps {
  selectedProduct: string | null
  searchQuery: string
}

export function ImageList({ selectedProduct, searchQuery }: ImageListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedImage, setSelectedImage] = useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Giả lập dữ liệu hình ảnh
  const images = [
    {
      id: "1",
      product_id: "1",
      product_name: "Chanel No. 5",
      image_url: "/placeholder.svg?height=300&width=300",
      alt_text: "Chanel No. 5 Eau de Parfum",
      display_order: 1,
      is_main: true,
      created_at: "2023-06-15T10:30:00Z",
    },
    {
      id: "2",
      product_id: "1",
      product_name: "Chanel No. 5",
      image_url: "/placeholder.svg?height=300&width=300",
      alt_text: "Chanel No. 5 Bottle Side View",
      display_order: 2,
      is_main: false,
      created_at: "2023-06-15T10:35:00Z",
    },
    {
      id: "3",
      product_id: "2",
      product_name: "Dior Sauvage",
      image_url: "/placeholder.svg?height=300&width=300",
      alt_text: "Dior Sauvage Eau de Toilette",
      display_order: 1,
      is_main: true,
      created_at: "2023-06-16T09:20:00Z",
    },
    {
      id: "4",
      product_id: "2",
      product_name: "Dior Sauvage",
      image_url: "/placeholder.svg?height=300&width=300",
      alt_text: "Dior Sauvage Packaging",
      display_order: 2,
      is_main: false,
      created_at: "2023-06-16T09:25:00Z",
    },
    {
      id: "5",
      product_id: "3",
      product_name: "Gucci Bloom",
      image_url: "/placeholder.svg?height=300&width=300",
      alt_text: "Gucci Bloom Perfume",
      display_order: 1,
      is_main: true,
      created_at: "2023-06-17T14:10:00Z",
    },
    {
      id: "6",
      product_id: "4",
      product_name: "Tom Ford Tobacco Vanille",
      image_url: "/placeholder.svg?height=300&width=300",
      alt_text: "Tom Ford Tobacco Vanille",
      display_order: 1,
      is_main: true,
      created_at: "2023-06-18T11:45:00Z",
    },
    {
      id: "7",
      product_id: "5",
      product_name: "Versace Eros",
      image_url: "/placeholder.svg?height=300&width=300",
      alt_text: "Versace Eros Eau de Toilette",
      display_order: 1,
      is_main: true,
      created_at: "2023-06-19T16:30:00Z",
    },
    {
      id: "8",
      product_id: "5",
      product_name: "Versace Eros",
      image_url: "/placeholder.svg?height=300&width=300",
      alt_text: "Versace Eros Box",
      display_order: 2,
      is_main: false,
      created_at: "2023-06-19T16:35:00Z",
    },
  ]

  // Lọc hình ảnh theo sản phẩm và từ khóa tìm kiếm
  const filteredImages = images.filter((image) => {
    const matchesProduct = selectedProduct ? image.product_id === selectedProduct : true
    const matchesSearch = searchQuery
      ? image.alt_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesProduct && matchesSearch
  })

  // Phân trang
  const itemsPerPage = 12
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage)
  const paginatedImages = filteredImages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleOpenDetail = (image: any) => {
    setSelectedImage(image)
    setIsDetailOpen(true)
  }

  const handleOpenDelete = (image: any) => {
    setSelectedImage(image)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-4">
      {filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <p className="text-lg font-medium">Không tìm thấy hình ảnh nào</p>
          <p className="text-sm text-muted-foreground">Thử thay đổi bộ lọc hoặc tải lên hình ảnh mới</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {paginatedImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onEdit={() => handleOpenDetail(image)}
                onDelete={() => handleOpenDelete(image)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </Pagination>
            </div>
          )}
        </>
      )}

      {selectedImage && (
        <>
          <ImageDetailDialog image={selectedImage} open={isDetailOpen} onOpenChange={setIsDetailOpen} />

          <ImageDeleteDialog image={selectedImage} open={isDeleteOpen} onOpenChange={setIsDeleteOpen} />
        </>
      )}
    </div>
  )
}

