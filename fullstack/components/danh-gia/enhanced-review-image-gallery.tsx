"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface EnhancedReviewImageGalleryProps {
  images: {
    src: string
    alt: string
    reviewId?: number
  }[]
}

export function EnhancedReviewImageGallery({ images }: EnhancedReviewImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
    setIsOpen(true)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((image, index) => (
          <Dialog key={index} open={isOpen && currentImageIndex === index} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button
                className="relative h-20 w-20 overflow-hidden rounded-md border border-gray-200 hover:opacity-90 transition-opacity"
                onClick={() => handleThumbnailClick(index)}
              >
                <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <div className="relative h-[60vh] w-full">
                <Image
                  src={images[currentImageIndex].src || "/placeholder.svg"}
                  alt={images[currentImageIndex].alt}
                  fill
                  className="object-contain"
                />

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous</span>
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next</span>
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-2 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              <div className="mt-2 flex justify-center gap-2 overflow-x-auto py-2">
                {images.map((image, idx) => (
                  <button
                    key={idx}
                    className={`relative h-16 w-16 overflow-hidden rounded-md border-2 ${
                      idx === currentImageIndex ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}

