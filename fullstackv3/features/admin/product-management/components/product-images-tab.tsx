"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, Trash2, CheckCircle2, Star, ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import type { ProductWithRelations } from "../types"
import { useDeleteProductImage, useUpdateProductImage, useUploadProductImages } from "../queries"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface ProductImagesTabProps {
  product: ProductWithRelations
}

export function ProductImagesTab({ product }: ProductImagesTabProps) {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [imageToDelete, setImageToDelete] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImages = useUploadProductImages()
  const updateImage = useUpdateProductImage()
  const deleteImage = useDeleteProductImage()

  // Handle file selection from file input
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileArray = Array.from(event.target.files)
      // Validate files (images only, max size)
      const validFiles = fileArray.filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`Tệp "${file.name}" không phải là hình ảnh.`)
          return false
        }
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          toast.error(`Tệp "${file.name}" vượt quá giới hạn 5MB.`)
          return false
        }
        return true
      })
      setFiles((prev) => [...prev, ...validFiles])
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files)
      // Validate files
      const validFiles = fileArray.filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`Tệp "${file.name}" không phải là hình ảnh.`)
          return false
        }
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          toast.error(`Tệp "${file.name}" vượt quá giới hạn 5MB.`)
          return false
        }
        return true
      })
      setFiles((prev) => [...prev, ...validFiles])
    }
  }

  // Handle upload
  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    try {
      await uploadImages.mutateAsync({
        productId: product.id,
        files: files,
      })

      toast.success(`Đã tải lên ${files.length} hình ảnh thành công.`)
      setFiles([])
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Tải hình ảnh thất bại. Vui lòng thử lại sau.")
    } finally {
      setUploading(false)
    }
  }

  // Handle setting an image as main
  const handleSetMainImage = async (imageId: number) => {
    try {
      await updateImage.mutateAsync({
        imageId,
        updates: { is_main: true },
      })
      toast.success("Đã đặt làm ảnh chính thành công")
    } catch (error) {
      console.error("Set main image error:", error)
      toast.error("Đặt ảnh chính thất bại")
    }
  }

  // Handle deleting an image
  const handleDeleteImage = async () => {
    if (imageToDelete === null) return

    try {
      await deleteImage.mutateAsync(imageToDelete)
      toast.success("Đã xóa hình ảnh thành công")
      setImageToDelete(null)
    } catch (error) {
      console.error("Delete image error:", error)
      toast.error("Xóa hình ảnh thất bại")
    }
  }

  // Cancel upload and clear selected files
  const handleCancelUpload = () => {
    setFiles([])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý hình ảnh sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Current Images Gallery */}
          <div className="mb-8">
            <h3 className="font-medium mb-4">Hình ảnh hiện tại</h3>

            {product.images.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-md">
                <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500">Chưa có hình ảnh nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className={cn(
                      "relative group aspect-square rounded-md overflow-hidden border",
                      image.is_main && "ring-2 ring-primary",
                    )}
                  >
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />

                    {/* Image Actions Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!image.is_main && (
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleSetMainImage(image.id)}
                          title="Đặt làm ảnh chính"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setImageToDelete(image.id)}
                        title="Xóa ảnh"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Main Image Badge */}
                    {image.is_main && (
                      <div className="absolute top-2 right-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded-md">
                        Chính
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload New Images */}
          <div className="border rounded-md">
            <h3 className="font-medium p-4 border-b">Tải lên hình ảnh mới</h3>

            <div className="p-4 space-y-4">
              {/* Drag & Drop Zone */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center cursor-pointer transition-colors",
                  dragging ? "border-primary bg-primary/5" : "border-gray-300",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-center mb-1">Kéo và thả file vào đây hoặc click để chọn file</p>
                <p className="text-xs text-gray-500 text-center">PNG, JPG, GIF tối đa 5MB</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                />
              </div>

              {/* Selected Files Preview */}
              {files.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Hình ảnh đã chọn</h4>
                  <div className="flex flex-wrap gap-4">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="relative w-20 h-20 border rounded-md overflow-hidden group"
                      >
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFiles((prev) => prev.filter((_, i) => i !== index))
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                          {file.name.substring(0, 10)}
                          {file.name.length > 10 && "..."}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upload Actions */}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelUpload} disabled={uploading}>
                      Hủy
                    </Button>
                    <Button variant="default" size="sm" onClick={handleUpload} disabled={uploading}>
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Tải lên {files.length} hình ảnh
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={imageToDelete !== null} onOpenChange={(open) => !open && setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa hình ảnh</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hình ảnh này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteImage}>
              {deleteImage.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa hình ảnh"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

