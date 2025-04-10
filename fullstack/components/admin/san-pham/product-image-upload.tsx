"use client"

import { useState } from "react"
import Image from "next/image"
import { Upload, X, GripVertical, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProductImage {
  id: string
  image_url: string
  alt_text: string | null
  display_order: number
  is_main: boolean
}

interface ProductImageUploadProps {
  images: ProductImage[]
}

export function ProductImageUpload({ images: initialImages }: ProductImageUploadProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages)

  const handleAddImage = () => {
    const newImage: ProductImage = {
      id: `temp-${Date.now()}`,
      image_url: "/placeholder.svg?height=200&width=200",
      alt_text: "",
      display_order: images.length + 1,
      is_main: images.length === 0,
    }

    setImages([...images, newImage])
  }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hình ảnh sản phẩm</CardTitle>
        <CardDescription>
          Thêm hình ảnh cho sản phẩm. Hình ảnh đầu tiên sẽ được sử dụng làm hình ảnh chính.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative rounded-lg border-2 ${image.is_main ? "border-primary" : "border-gray-200"}`}
              >
                <div className="absolute right-2 top-2 flex space-x-1">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveImage(image.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-2">
                  <Image
                    src={image.image_url || "/placeholder.svg"}
                    alt={image.alt_text || "Product image"}
                    width={200}
                    height={200}
                    className="mx-auto h-40 w-full object-contain"
                  />
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
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">Thứ tự: {image.display_order}</span>
                    </div>

                    <Button
                      variant={image.is_main ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleSetMainImage(image.id)}
                      disabled={image.is_main}
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

            <div
              className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-gray-400"
              onClick={handleAddImage}
            >
              <Upload className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-center text-sm font-medium">Thêm hình ảnh</p>
              <p className="text-center text-xs text-gray-500">Kéo thả hoặc nhấp để tải lên</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={handleAddImage}>
              Thêm hình ảnh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

