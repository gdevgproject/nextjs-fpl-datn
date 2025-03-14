"use client"

import { Button } from "@/components/ui/Button"
import { cn } from "@/utils/helpers"
import { ChevronLeft, ChevronRight } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useState } from "react"

// Dynamically import the modal to avoid SSR issues
const ImageGalleryModal = dynamic(() => import("./ImageGalleryModal"), {
  ssr: false,
})

interface ProductGalleryProps {
  images: Array<{
    url: string
    alt?: string
  }>
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  const handlePrevious = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (!images.length) {
    return (
      <div className="aspect-square w-full rounded-lg bg-grayscale-10 flex items-center justify-center">
        <span className="text-grayscale-50">Không có hình ảnh</span>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square w-full">
          <div className="absolute inset-0 rounded-lg overflow-hidden bg-white">
            <Image
              src={images[currentImage].url || "/placeholder.svg"}
              alt={images[currentImage].alt || "Product image"}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Navigation Buttons */}
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              className="h-10 w-10 rounded-full bg-black/30 border-0 backdrop-blur-sm hover:bg-black/40"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
              <span className="sr-only">Previous image</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="h-10 w-10 rounded-full bg-black/30 border-0 backdrop-blur-sm hover:bg-black/40"
            >
              <ChevronRight className="h-6 w-6 text-white" />
              <span className="sr-only">Next image</span>
            </Button>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-4">
          {images.slice(0, 3).map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden",
                index === currentImage ? "ring-2 ring-primary-5" : "ring-1 ring-grayscale-20"
              )}
            >
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.alt || "Product thumbnail"}
                fill
                className="object-contain"
              />
            </button>
          ))}
          {/* "View More" thumbnail */}
          <button
            onClick={() => setModalOpen(true)}
            className="relative aspect-square rounded-lg overflow-hidden bg-grayscale-90"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-sm font-medium">Xem thêm</span>
              <span className="text-sm font-medium">{images.length} ảnh</span>
            </div>
            {images[3] && (
              <Image
                src={images[3].url || "/placeholder.svg"}
                alt="More images"
                fill
                className="object-cover opacity-50"
              />
            )}
          </button>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {modalOpen && (
        <ImageGalleryModal
          images={images}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialIndex={currentImage}
        />
      )}
    </>
  )
}
