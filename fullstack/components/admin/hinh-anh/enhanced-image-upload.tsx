"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Upload, X, GripVertical, Check, ImagePlus, Trash2, Edit, Eye, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Types based on database schema
interface ImageFile {
  id: string
  file: File
  preview: string
  alt_text: string
  is_main: boolean
  display_order: number
  upload_progress?: number
  error?: string
}

interface EnhancedImageUploadProps {
  productId?: string
  existingImages?: {
    id: string
    image_url: string
    alt_text: string | null
    is_main: boolean
    display_order: number
  }[]
  maxFiles?: number
  maxSize?: number
  onChange?: (files: ImageFile[]) => void
  onSubmit?: (files: ImageFile[]) => void
  disabled?: boolean
}

export function EnhancedImageUpload({
  productId,
  existingImages = [],
  maxFiles = 10,
  maxSize = 5242880, // 5MB
  onChange,
  onSubmit,
  disabled = false,
}: EnhancedImageUploadProps) {
  // Convert existing images to our format
  const initialImages: ImageFile[] = existingImages.map((img) => ({
    id: img.id,
    file: new File([], "existing-image.jpg", { type: "image/jpeg" }),
    preview: img.image_url,
    alt_text: img.alt_text || "",
    is_main: img.is_main,
    display_order: img.display_order,
    upload_progress: 100, // Already uploaded
  }))

  const [images, setImages] = useState<ImageFile[]>(initialImages)
  const [draggedImage, setDraggedImage] = useState<ImageFile | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [bulkAltTextPrefix, setBulkAltTextPrefix] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (acceptedFiles.length + images.length > maxFiles) {
        alert(`Bạn chỉ có thể tải lên tối đa ${maxFiles} hình ảnh.`)
        acceptedFiles = acceptedFiles.slice(0, maxFiles - images.length)
      }

      // Handle rejected files (too large or wrong type)
      if (rejectedFiles.length > 0) {
        alert(
          `${rejectedFiles.length} tệp bị từ chối. Vui lòng đảm bảo tệp có định dạng hình ảnh và kích thước dưới ${
            maxSize / 1024 / 1024
          }MB.`,
        )
      }

      // Process accepted files
      const newImages = acceptedFiles.map((file, index) => {
        const id = `temp-${Date.now()}-${index}`
        return {
          id,
          file,
          preview: URL.createObjectURL(file),
          alt_text: file.name.split(".")[0] || "",
          is_main: images.length === 0 && index === 0, // First image is main if no images exist
          display_order: images.length + index + 1,
          upload_progress: 0, // Not uploaded yet
        }
      })

      const updatedImages = [...images, ...newImages]
      setImages(updatedImages)

      // Call onChange if provided
      if (onChange) {
        onChange(updatedImages)
      }

      // Switch to gallery tab if files were added
      if (newImages.length > 0) {
        setActiveTab("gallery")
      }
    },
    [images, maxFiles, maxSize, onChange],
  )

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
    },
    maxSize,
    disabled: disabled || isSubmitting,
    noClick: activeTab !== "upload",
    noKeyboard: activeTab !== "upload",
  })

  // Handle removing an image
  const handleRemoveImage = (id: string) => {
    const updatedImages = images.filter((image) => image.id !== id)

    // If we removed the main image, set the first remaining image as main
    if (images.find((img) => img.id === id)?.is_main && updatedImages.length > 0) {
      updatedImages[0].is_main = true
    }

    setImages(updatedImages)

    // Call onChange if provided
    if (onChange) {
      onChange(updatedImages)
    }
  }

  // Handle setting main image
  const handleSetMainImage = (id: string) => {
    const updatedImages = images.map((image) => ({
      ...image,
      is_main: image.id === id,
    }))

    setImages(updatedImages)

    // Call onChange if provided
    if (onChange) {
      onChange(updatedImages)
    }
  }

  // Handle updating alt text
  const handleUpdateAltText = (id: string, altText: string) => {
    const updatedImages = images.map((image) => (image.id === id ? { ...image, alt_text: altText } : image))

    setImages(updatedImages)

    // Call onChange if provided
    if (onChange) {
      onChange(updatedImages)
    }
  }

  // Handle drag and drop reordering
  const handleDragStart = (image: ImageFile) => {
    setDraggedImage(image)
  }

  const handleDragOver = (e: React.DragEvent, targetImage: ImageFile) => {
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

    // Call onChange if provided
    if (onChange) {
      onChange(updatedImages)
    }
  }

  const handleDragEnd = () => {
    setDraggedImage(null)
  }

  // Handle preview image
  const handlePreviewImage = (imageUrl: string) => {
    setPreviewImage(imageUrl)
  }

  // Handle bulk alt text update
  const handleBulkAltText = () => {
    if (!bulkAltTextPrefix.trim()) return

    const updatedImages = images.map((img, idx) => ({
      ...img,
      alt_text: `${bulkAltTextPrefix.trim()} ${idx + 1}`,
    }))

    setImages(updatedImages)
    setBulkEditMode(false)

    // Call onChange if provided
    if (onChange) {
      onChange(updatedImages)
    }
  }

  // Handle removing all images
  const handleRemoveAllImages = () => {
    setImages([])

    // Call onChange if provided
    if (onChange) {
      onChange([])
    }
  }

  // Handle form submission
  const handleSubmit = () => {
    if (onSubmit) {
      setIsSubmitting(true)

      // Simulate upload progress for demo purposes
      const updatedImages = [...images]

      // Update progress for each image that's not already uploaded
      updatedImages.forEach((img, index) => {
        if (img.upload_progress !== 100) {
          // Simulate progress updates
          const intervalId = setInterval(
            () => {
              setImages((prevImages) => {
                const newImages = [...prevImages]
                const imgIndex = newImages.findIndex((i) => i.id === img.id)

                if (imgIndex !== -1) {
                  const currentProgress = newImages[imgIndex].upload_progress || 0
                  const newProgress = Math.min(currentProgress + 20, 100)
                  newImages[imgIndex] = {
                    ...newImages[imgIndex],
                    upload_progress: newProgress,
                  }

                  // Clear interval when done
                  if (newProgress >= 100) {
                    clearInterval(intervalId)

                    // If all images are uploaded, set isSubmitting to false
                    if (newImages.every((i) => i.upload_progress === 100)) {
                      setIsSubmitting(false)
                    }
                  }
                }

                return newImages
              })
            },
            500 + index * 100,
          ) // Stagger the uploads
        }
      })

      // Call onSubmit with the images
      onSubmit(images)
    }
  }

  // Trigger file input click
  const handleAddMoreClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" disabled={isSubmitting}>
            <Upload className="mr-2 h-4 w-4" />
            Tải lên
          </TabsTrigger>
          <TabsTrigger value="gallery" disabled={isSubmitting}>
            <ImagePlus className="mr-2 h-4 w-4" />
            Thư viện {images.length > 0 && `(${images.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="pt-4">
          <div
            {...getRootProps()}
            className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
            } ${disabled || isSubmitting ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            <Upload className="mb-2 h-12 w-12 text-gray-400" />
            <p className="mb-1 text-center text-sm font-medium">Kéo thả hình ảnh vào đây hoặc nhấp để chọn</p>
            <p className="text-center text-xs text-gray-500">PNG, JPG, WEBP, GIF (Tối đa {maxSize / 1024 / 1024}MB)</p>

            {images.length > 0 && (
              <div className="mt-4 flex flex-col items-center">
                <Badge variant="outline" className="mb-2">
                  {images.length} hình ảnh đã chọn
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveTab("gallery")
                  }}
                >
                  Xem thư viện
                </Button>
              </div>
            )}

            {images.length >= maxFiles && (
              <Alert className="mt-4 w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Đã đạt giới hạn</AlertTitle>
                <AlertDescription>
                  Bạn đã đạt đến số lượng tối đa {maxFiles} hình ảnh. Vui lòng xóa một số hình ảnh trước khi tải lên
                  thêm.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddMoreClick}
              disabled={disabled || isSubmitting || images.length >= maxFiles}
            >
              <Upload className="mr-2 h-4 w-4" />
              Chọn tệp
            </Button>

            {images.length > 0 && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSubmit}
                disabled={disabled || isSubmitting || images.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Tải lên {images.length} hình ảnh
                  </>
                )}
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="pt-4">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8">
              <ImagePlus className="mb-2 h-12 w-12 text-gray-400" />
              <p className="mb-1 text-center text-sm font-medium">Chưa có hình ảnh nào</p>
              <p className="mb-4 text-center text-xs text-gray-500">Tải lên hình ảnh để hiển thị tại đây</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("upload")}
                disabled={disabled || isSubmitting}
              >
                <Upload className="mr-2 h-4 w-4" />
                Tải lên hình ảnh
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-medium">
                    Thư viện hình ảnh ({images.length}/{maxFiles})
                  </h3>
                  <p className="text-xs text-gray-500">Kéo thả để sắp xếp thứ tự hiển thị</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        disabled={images.length === 0 || disabled || isSubmitting}
                      >
                        <Edit className="mr-2 h-4 w-4" />
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
                        <Input
                          id="alt-prefix"
                          placeholder="Ví dụ: Nước hoa Chanel"
                          className="mt-2"
                          value={bulkAltTextPrefix}
                          onChange={(e) => setBulkAltTextPrefix(e.target.value)}
                        />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Kết quả: "{bulkAltTextPrefix} 1", "{bulkAltTextPrefix} 2", ...
                        </p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkEditMode(false)}>
                          Hủy
                        </Button>
                        <Button onClick={handleBulkAltText} disabled={!bulkAltTextPrefix.trim()}>
                          Áp dụng
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        type="button"
                        disabled={images.length === 0 || disabled || isSubmitting}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa tất cả
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Xóa tất cả hình ảnh</DialogTitle>
                        <DialogDescription>
                          Bạn có chắc chắn muốn xóa tất cả {images.length} hình ảnh? Hành động này không thể hoàn tác.
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
                </div>
              </div>

              <ScrollArea className="h-[400px] rounded-md border">
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className={`relative rounded-lg border-2 transition-all ${
                        image.is_main ? "border-primary" : "border-gray-200"
                      } ${draggedImage?.id === image.id ? "opacity-50" : "opacity-100"}`}
                      draggable={!disabled && !isSubmitting}
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
                                disabled={disabled || isSubmitting}
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
                        <div className="relative cursor-pointer" onClick={() => handlePreviewImage(image.preview)}>
                          <div className="relative h-40 w-full">
                            <Image
                              src={image.preview || "/placeholder.svg"}
                              alt={image.alt_text || "Product image"}
                              fill
                              className="rounded-md object-contain"
                            />
                          </div>

                          {/* Upload progress overlay */}
                          {image.upload_progress !== undefined && image.upload_progress < 100 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-md">
                              <p className="mb-2 text-white text-sm font-medium">{image.upload_progress}%</p>
                              <Progress value={image.upload_progress} className="w-3/4 h-2" />
                            </div>
                          )}

                          {/* Preview overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 transition-opacity hover:bg-opacity-30 hover:opacity-100 rounded-md">
                            <Button variant="secondary" size="sm" type="button">
                              <Eye className="mr-2 h-4 w-4" />
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
                            disabled={disabled || isSubmitting}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <GripVertical
                              className={`h-4 w-4 ${disabled || isSubmitting ? "text-gray-300" : "cursor-grab text-gray-400"}`}
                            />
                            <span className="text-xs text-gray-500">Thứ tự: {image.display_order}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`main-image-${image.id}`} className="text-xs">
                              Ảnh chính
                            </Label>
                            <Switch
                              id={`main-image-${image.id}`}
                              checked={image.is_main}
                              onCheckedChange={() => handleSetMainImage(image.id)}
                              disabled={image.is_main || disabled || isSubmitting}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("upload")}
                  disabled={disabled || isSubmitting || images.length >= maxFiles}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Tải lên thêm
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={disabled || isSubmitting || images.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Tải lên {images.filter((img) => img.upload_progress !== 100).length} hình ảnh
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xem trước hình ảnh</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex items-center justify-center">
              <div className="relative h-[60vh] w-full">
                <Image src={previewImage || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

