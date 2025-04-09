"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { X, Check, Upload, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ImageFile {
  id: string
  file: File
  preview: string
  alt_text: string
  is_main: boolean
  display_order: number
  upload_progress?: number
}

interface MobileImageUploadProps {
  images: ImageFile[]
  onAddImage: (file: File) => void
  onRemoveImage: (id: string) => void
  onSetMainImage: (id: string) => void
  onUpdateAltText: (id: string, altText: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  disabled: boolean
}

export function MobileImageUpload({
  images,
  onAddImage,
  onRemoveImage,
  onSetMainImage,
  onUpdateAltText,
  onSubmit,
  isSubmitting,
  disabled,
}: MobileImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onAddImage(file)
    }
  }

  return (
    <div className="space-y-4">
      {/* Image preview grid */}
      <div className="grid grid-cols-3 gap-2">
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative aspect-square rounded-md border-2 ${
              image.is_main ? "border-primary" : "border-gray-200"
            }`}
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative h-full w-full">
              <Image
                src={image.preview || "/placeholder.svg"}
                alt={image.alt_text || "Product image"}
                fill
                className="rounded-md object-cover"
              />

              {/* Upload progress overlay */}
              {image.upload_progress !== undefined && image.upload_progress < 100 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-md">
                  <p className="text-white text-xs font-medium">{image.upload_progress}%</p>
                  <Progress value={image.upload_progress} className="w-full h-1" />
                </div>
              )}

              {/* Main image indicator */}
              {image.is_main && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add image button */}
        <label
          htmlFor="mobile-image-upload"
          className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300"
        >
          <ImagePlus className="h-6 w-6 text-gray-400" />
          <span className="mt-1 text-xs text-gray-500">Thêm</span>
          <input
            id="mobile-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || isSubmitting}
          />
        </label>
      </div>

      {/* Image detail sheet */}
      <Sheet open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Chỉnh sửa hình ảnh</SheetTitle>
            <SheetDescription>Chỉnh sửa thông tin hình ảnh sản phẩm</SheetDescription>
          </SheetHeader>

          {selectedImage && (
            <ScrollArea className="h-[calc(80vh-80px)] pr-4">
              <div className="space-y-4 py-4">
                <div className="relative mx-auto aspect-square w-full max-w-[250px]">
                  <Image
                    src={selectedImage.preview || "/placeholder.svg"}
                    alt={selectedImage.alt_text || "Product image"}
                    fill
                    className="rounded-md object-contain"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-alt-text">Alt Text</Label>
                  <Input
                    id="mobile-alt-text"
                    value={selectedImage.alt_text || ""}
                    onChange={(e) => onUpdateAltText(selectedImage.id, e.target.value)}
                    placeholder="Mô tả hình ảnh"
                    disabled={disabled || isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="mobile-main-image">Đặt làm ảnh chính</Label>
                  <Switch
                    id="mobile-main-image"
                    checked={selectedImage.is_main}
                    onCheckedChange={() => onSetMainImage(selectedImage.id)}
                    disabled={selectedImage.is_main || disabled || isSubmitting}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onRemoveImage(selectedImage.id)
                      setSelectedImage(null)
                    }}
                    disabled={disabled || isSubmitting}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Xóa hình ảnh
                  </Button>

                  <Button variant="default" onClick={() => setSelectedImage(null)}>
                    <Check className="mr-2 h-4 w-4" />
                    Xong
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Upload button */}
      {images.length > 0 && (
        <Button className="w-full" onClick={onSubmit} disabled={disabled || isSubmitting || images.length === 0}>
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Đang tải lên...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Tải lên {images.filter((img) => img.upload_progress !== 100).length} hình ảnh
            </>
          )}
        </Button>
      )}
    </div>
  )
}

