"use client"

import { useState, useEffect } from "react"
import { EnhancedImageManager } from "@/components/admin/hinh-anh/enhanced-image-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProductImageManagerProps {
  productId: string
  productName: string
  onProgressChange?: (progress: number) => void
}

export function ProductImageManager({ productId, productName, onProgressChange }: ProductImageManagerProps) {
  const [hasImages, setHasImages] = useState(false)

  // Simulate checking if the product has images
  useEffect(() => {
    const timer = setTimeout(() => {
      // For demo purposes, assume products with ID 1-3 have images
      const hasExistingImages = ["1", "2", "3"].includes(productId)
      setHasImages(hasExistingImages)

      // Update progress
      if (onProgressChange) {
        onProgressChange(hasExistingImages ? 100 : 0)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [productId, onProgressChange])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hình ảnh sản phẩm</CardTitle>
        <CardDescription>
          Quản lý hình ảnh cho sản phẩm. Kéo thả để sắp xếp, đặt ảnh chính và thêm alt text.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EnhancedImageManager productId={productId} productName={productName} />
      </CardContent>
    </Card>
  )
}

