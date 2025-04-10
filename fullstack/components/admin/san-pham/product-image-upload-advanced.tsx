"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Upload, X, GripVertical, Check, Info, ImagePlus, Trash2 } from "lucide-react"
import { useDropzone } from "react-dropzone"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProductImage {
  id: string
  image_url: string
  alt_text: string | null
  display_order: number
  is_main: boolean
}

interface ProductImageUploadAdvancedProps {
  productId?: string
  onProgressChange: (progress: number) => void
}

export function ProductImageUploadAdvanced({ productId, onProgressChange }: ProductImageUploadAdvancedProps) {
  // Dữ liệu mẫu cho sản phẩm đang chỉnh sửa
  const sampleImages = productId
    ? [
        {
          id: "1",
          image_url: "/placeholder.svg?height=400&width=400",
          alt_text: "Chanel No. 5 Bottle",
          display_order: 1,
          is_main: true,
        },
        {
          id: "2",
          image_url: "/placeholder.svg?height=400&width=400",
          alt_text: "Chanel No. 5 Box",
          display_order: 2,
          is_main: false,
        },
      ]
    : []

  const [images, setImages] = useState<ProductImage[]>(sampleImages)
  const [draggedImage, setDraggedImage] = useState<ProductImage | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [bulkEditMode, setBulkEditMode] = useState(false)

  // Tính toán tiến độ hoàn thành
  useEffect(() => {
    // Nếu có ít nhất 1 hình ảnh và có hình ảnh chính, tiến độ là 100%
    // Nếu có ít nhất 1 hình ảnh nhưng không có hình ảnh chính, tiến độ là 50%
    // Nếu không có hình ảnh nào, tiến độ là 0%
    if (images.length > 0) {
      const hasMainImage = images.some((img) => img.is_main)
      onProgressChange(hasMainImage ? 100 : 50)
    } else {
      onProgressChange(0)
    }
  }, [images, onProgressChange])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Giả lập tải lên hình ảnh
      const newImages = acceptedFiles.map((file, index) => {
        const id = `temp-${Date.now()}-${index}`
        return {
          id,
          image_url: URL.createObjectURL(file),
          alt_text: file.name.split(".")[0] || null,
          display_order: images.length + index + 1,
          is_main: images.length === 0 && index === 0, // Hình đầu tiên sẽ là hình chính nếu chưa có hình nào
        }
      })

      setImages((prev) => [...prev, ...newImages])
    },
    [images],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5242880, // 5MB
  })

  const handleRemoveImage = (id: string) => {
    setImages(images.filter((image) => image.id !== id))
  }

  const handleSetMainImage = (id: string) => {
    setImages(
      images.map((image) => ({
        ...image,
        is_main: image.id === id,
      })),
    )
  }

  const handleUpdateAltText = (id: string, altText: string) => {
    setImages(images.map((image) => (image.id === id ? { ...image, alt_text: altText } : image)))
  }

  const handleDragStart = (image: ProductImage) => {
    setDraggedImage(image)
  }

  const handleDragOver = (e: React.DragEvent, targetImage: ProductImage) => {
    e.preventDefault()
    if (!draggedImage || draggedImage.id === targetImage.id) return

    const draggedIndex = images.findIndex((img) => img.id === draggedImage.id)
    const targetIndex = images.findIndex((img) => img.id === targetImage.id)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newImages = [...images]
    const [removed] = newImages.splice(draggedIndex, 1)
    newImages.splice(targetIndex, 0, removed)

    // Update display_order
    const updatedImages = newImages.map((img, idx) => ({
      ...img,
      display_order: idx + 1,
    }))

    setImages(updatedImages)
  }

  const handleDragEnd = () => {
    setDraggedImage(null)
  }

  const handlePreviewImage = (imageUrl: string) => {
    setPreviewImage(imageUrl)
  }

  const handleBulkAltText = (prefix: string) => {
    if (!prefix.trim()) return

    const updatedImages = images.map((img, idx) => ({
      ...img,
      alt_text: `${prefix.trim()} ${idx + 1}`,
    }))

    setImages(updatedImages)
    setBulkEditMode(false)
  }

  const handleRemoveAllImages = () => {
    setImages([])
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Hình ảnh sản phẩm</CardTitle>
            <CardDescription>
              Thêm hình ảnh cho sản phẩm. Hình ảnh đầu tiên sẽ được sử dụng làm hình ảnh chính.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" type="button">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa tất cả
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xóa tất cả hình ảnh</DialogTitle>
                  <DialogDescription>
                    Bạn có chắc chắn muốn xóa tất cả hình ảnh? Hành động này không thể hoàn tác.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>
                    Hủy
                  </Button>
                  <Button variant="destructive" onClick={handleRemoveAllImages}>
                    Xóa tất cả
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" type="button">
                  <Info className="mr-2 h-4 w-4" />
                  Chỉnh sửa hàng loạt
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chỉnh sửa alt text hàng loạt</DialogTitle>
                  <DialogDescription>
                    Nhập tiền tố cho alt text. Số thứ tự sẽ được thêm vào sau tiền tố.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="alt-prefix">Tiền tố alt text</Label>
                  <Input id="alt-prefix" placeholder="Ví dụ: Chanel No. 5" className="mt-2" />
                  <p className="mt-2 text-sm text-muted-foreground">Kết quả: "Chanel No. 5 1", "Chanel No. 5 2", ...</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setBulkEditMode(false)}>
                    Hủy
                  </Button>
                  <Button onClick={() => handleBulkAltText("Chanel No. 5")}>Áp dụng</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {images.length === 0 && (
          <Alert>
            <ImagePlus className="h-4 w-4" />
            <AlertTitle>Chưa có hình ảnh</AlertTitle>
            <AlertDescription>Sản phẩm chưa có hình ảnh nào. Vui lòng tải lên ít nhất một hình ảnh.</AlertDescription>
          </Alert>
        )}

        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mb-2 h-8 w-8 text-gray-400" />
          <p className="text-center text-sm font-medium">Kéo thả hình ảnh vào đây hoặc nhấp để chọn</p>
          <p className="text-center text-xs text-gray-500">PNG, JPG, WEBP tối đa 5MB</p>
        </div>

        {images.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Danh sách hình ảnh ({images.length})</h3>
              <Badge variant={images.some((img) => img.is_main) ? "default" : "destructive"}>
                {images.some((img) => img.is_main) ? "Đã có hình chính" : "Chưa có hình chính"}
              </Badge>
            </div>

            <ScrollArea className="h-[400px] rounded-md border">
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative rounded-lg border-2 transition-all ${
                      image.is_main ? "border-primary" : "border-gray-200"
                    } ${draggedImage?.id === image.id ? "opacity-50" : "opacity-100"}`}
                    draggable
                    onDragStart={() => handleDragStart(image)}
                    onDragOver={(e) => handleDragOver(e, image)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="absolute right-2 top-2 flex space-x-1 z-10">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemoveImage(image.id)}
                              type="button"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xóa hình ảnh</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="p-2">
                      <div className="relative cursor-pointer" onClick={() => handlePreviewImage(image.image_url)}>
                        <Image
                          src={image.image_url || "/placeholder.svg"}
                          alt={image.alt_text || "Product image"}
                          width={200}
                          height={200}
                          className="mx-auto h-40 w-full rounded-md object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 transition-opacity hover:bg-opacity-30 hover:opacity-100">
                          <Button variant="secondary" size="sm" type="button">
                            Xem
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 p-2">
                      <div className="space-y-1">
                        <Label htmlFor={`alt-text-${image.id}`} className="text-xs">
                          Alt Text
                        </Label>
                        <Input
                          id={`alt-text-${image.id}`}
                          value={image.alt_text || ""}
                          onChange={(e) => handleUpdateAltText(image.id, e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <GripVertical className="h-4 w-4 cursor-grab text-gray-400" />
                          <span className="text-xs text-gray-500">Thứ tự: {image.display_order}</span>
                        </div>

                        <Button
                          variant={image.is_main ? "default" : "outline"}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleSetMainImage(image.id)}
                          disabled={image.is_main}
                          type="button"
                        >
                          {image.is_main ? (
                            <>
                              <Check className="mr-1 h-3 w-3" />
                              Ảnh chính
                            </>
                          ) : (
                            "Đặt làm ảnh chính"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {/* Preview Dialog */}
        <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Xem trước hình ảnh</DialogTitle>
            </DialogHeader>
            {previewImage && (
              <div className="flex items-center justify-center">
                <Image
                  src={previewImage || "/placeholder.svg"}
                  alt="Preview"
                  width={400}
                  height={400}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

