"use client"

import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { EnhancedImageUpload } from "@/components/admin/hinh-anh/enhanced-image-upload"
import { MobileImageUpload } from "@/components/admin/hinh-anh/mobile-image-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface ImageFile {
  id: string
  file: File
  preview: string
  alt_text: string
  is_main: boolean
  display_order: number
  upload_progress?: number
}

interface ProductImageUploadContainerProps {
  productId?: string
  existingImages?: {
    id: string
    image_url: string
    alt_text: string | null
    is_main: boolean
    display_order: number
  }[]
  onImagesChange?: (images: ImageFile[]) => void
  onProgressChange?: (progress: number) => void
}

export function ProductImageUploadContainer({
  productId,
  existingImages = [],
  onImagesChange,
  onProgressChange,
}: ProductImageUploadContainerProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const { toast } = useToast()

  // Initialize images from existing images
  useEffect(() => {
    if (existingImages.length > 0) {
      const initialImages: ImageFile[] = existingImages.map((img) => ({
        id: img.id,
        file: new File([], "existing-image.jpg", { type: "image/jpeg" }),
        preview: img.image_url,
        alt_text: img.alt_text || "",
        is_main: img.is_main,
        display_order: img.display_order,
        upload_progress: 100, // Already uploaded
      }))

      setImages(initialImages)
    }
  }, [existingImages])

  // Calculate progress for parent component
  useEffect(() => {
    if (onProgressChange) {
      // If there are no images, progress is 0
      if (images.length === 0) {
        onProgressChange(0)
        return
      }

      // If there are images but no main image, progress is 50%
      const hasMainImage = images.some((img) => img.is_main)
      if (!hasMainImage) {
        onProgressChange(50)
        return
      }

      // If there are images with a main image, progress is 100%
      onProgressChange(100)
    }
  }, [images, onProgressChange])

  // Handle image changes
  const handleImagesChange = (updatedImages: ImageFile[]) => {
    setImages(updatedImages)

    if (onImagesChange) {
      onImagesChange(updatedImages)
    }
  }

  // Handle adding a new image (for mobile)
  const handleAddImage = (file: File) => {
    const id = `temp-${Date.now()}`
    const newImage: ImageFile = {
      id,
      file,
      preview: URL.createObjectURL(file),
      alt_text: file.name.split(".")[0] || "",
      is_main: images.length === 0, // First image is main if no images exist
      display_order: images.length + 1,
      upload_progress: 0, // Not uploaded yet
    }

    const updatedImages = [...images, newImage]
    setImages(updatedImages)

    if (onImagesChange) {
      onImagesChange(updatedImages)
    }
  }

  // Handle removing an image (for mobile)
  const handleRemoveImage = (id: string) => {
    const updatedImages = images.filter((image) => image.id !== id)

    // If we removed the main image, set the first remaining image as main
    if (images.find((img) => img.id === id)?.is_main && updatedImages.length > 0) {
      updatedImages[0].is_main = true
    }

    setImages(updatedImages)

    if (onImagesChange) {
      onImagesChange(updatedImages)
    }
  }

  // Handle setting main image (for mobile)
  const handleSetMainImage = (id: string) => {
    const updatedImages = images.map((image) => ({
      ...image,
      is_main: image.id === id,
    }))

    setImages(updatedImages)

    if (onImagesChange) {
      onImagesChange(updatedImages)
    }
  }

  // Handle updating alt text (for mobile)
  const handleUpdateAltText = (id: string, altText: string) => {
    const updatedImages = images.map((image) => (image.id === id ? { ...image, alt_text: altText } : image))

    setImages(updatedImages)

    if (onImagesChange) {
      onImagesChange(updatedImages)
    }
  }

  // Handle form submission
  const handleSubmit = () => {
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

                    // Show success toast
                    toast({
                      title: "Tải lên thành công",
                      description: `Đã tải lên ${newImages.length} hình ảnh thành công.`,
                    })
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
        {isMobile ? (
          <MobileImageUpload
            images={images}
            onAddImage={handleAddImage}
            onRemoveImage={handleRemoveImage}
            onSetMainImage={handleSetMainImage}
            onUpdateAltText={handleUpdateAltText}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            disabled={false}
          />
        ) : (
          <EnhancedImageUpload
            productId={productId}
            existingImages={existingImages}
            onChange={handleImagesChange}
            onSubmit={handleSubmit}
            disabled={false}
          />
        )}
      </CardContent>
    </Card>
  )
}

