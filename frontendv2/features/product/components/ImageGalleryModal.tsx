"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/utils/helpers"

interface ImageGalleryModalProps {
  images: Array<{
    url: string
    alt?: string
  }>
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
}

export default function ImageGalleryModal({ images, isOpen, onClose, initialIndex = 0 }: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setIsZoomed(false)
    }
  }, [isOpen, initialIndex])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowLeft":
          navigate("prev")
          break
        case "ArrowRight":
          navigate("next")
          break
        case "Escape":
          if (isZoomed) {
            setIsZoomed(false)
          } else {
            onClose()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, isZoomed])

  const navigate = (direction: "prev" | "next") => {
    setCurrentIndex((prev) => {
      if (direction === "prev") {
        return prev === 0 ? images.length - 1 : prev - 1
      }
      return prev === images.length - 1 ? 0 : prev + 1
    })
  }

  const toggleZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setIsZoomed((prev) => !prev)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent overlay */}
      <div
        className={cn("absolute inset-0 transition-colors duration-300", isZoomed ? "bg-black" : "bg-black/60")}
        onClick={() => {
          if (isZoomed) {
            setIsZoomed(false)
          } else {
            onClose()
          }
        }}
      />

      {/* Modal container */}
      <div
        className={cn(
          "relative mx-auto w-[90%] max-w-5xl rounded-lg bg-white transition-all duration-300",
          isZoomed && "w-full max-w-none rounded-none bg-transparent",
        )}
      >
        {/* Row 1: Header */}
        <div
          className={cn(
            "relative border-b border-gray-200 px-6 py-4 transition-all duration-300",
            isZoomed && "h-0 opacity-0 overflow-hidden p-0 border-none",
          )}
        >
          <h2 className="pr-8 text-center text-lg font-medium text-gray-900">
            {images[currentIndex].alt || "Hình ảnh sản phẩm"}
          </h2>
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
            <span className="sr-only">Đóng</span>
          </button>
        </div>

        {/* Row 2: Main Image */}
        <div
          className={cn("relative w-full transition-all duration-300 ease-in-out", isZoomed ? "h-screen" : "h-[60vh]")}
        >
          {/* Image container */}
          <div
            className={cn(
              "relative h-full w-full transition-all duration-300 ease-in-out",
              isZoomed ? "cursor-zoom-out" : "cursor-zoom-in",
            )}
            onClick={toggleZoom}
          >
            <div
              className={cn(
                "relative h-full w-full transition-transform duration-300 ease-in-out",
                isZoomed && "scale-150",
              )}
            >
              <Image
                src={images[currentIndex].url || "/placeholder.svg"}
                alt={images[currentIndex].alt || "Product image"}
                fill
                className="object-contain"
                quality={100}
                priority
              />
            </div>
          </div>

          {/* Navigation controls */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate("prev")
            }}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 shadow-lg backdrop-blur-sm transition-opacity duration-200 hover:bg-white",
              isZoomed && "opacity-50 hover:opacity-100",
            )}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous image</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate("next")
            }}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 shadow-lg backdrop-blur-sm transition-opacity duration-200 hover:bg-white",
              isZoomed && "opacity-50 hover:opacity-100",
            )}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next image</span>
          </button>

          {/* Zoom control */}
          <div
            className={cn(
              "absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-opacity duration-200",
              isZoomed && "opacity-50 hover:opacity-100",
            )}
          >
            <button onClick={(e) => toggleZoom(e)} className="text-gray-600 hover:text-gray-900">
              {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
            </button>
          </div>

          {/* Image counter */}
          <div
            className={cn(
              "absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1 text-sm text-gray-600 shadow-lg backdrop-blur-sm transition-opacity duration-200",
              isZoomed && "opacity-50",
            )}
          >
            {currentIndex + 1}/{images.length}
          </div>
        </div>

        {/* Row 3: Thumbnails */}
        <div
          className={cn(
            "border-t border-gray-200 p-4 transition-all duration-300",
            isZoomed && "h-0 opacity-0 overflow-hidden p-0 border-none",
          )}
        >
          <div className="flex justify-center gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-colors",
                  index === currentIndex ? "border-primary-5" : "border-gray-200 hover:border-gray-300",
                )}
              >
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.alt || `Thumbnail ${index + 1}`}
                  fill
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

