"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface BrandGalleryProps {
  images: string[]
  brandName: string
}

export function BrandGallery({ images, brandName }: BrandGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const openImage = (index: number) => {
    setSelectedImage(index)
  }

  const nextImage = () => {
    if (selectedImage === null) return
    setSelectedImage((selectedImage + 1) % images.length)
  }

  const prevImage = () => {
    if (selectedImage === null) return
    setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1)
  }

  if (!images.length) return null

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Bộ sưu tập hình ảnh</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
            onClick={() => openImage(index)}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`${brandName} gallery image ${index + 1}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {isDesktop ? (
        <Dialog open={selectedImage !== null} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
            <div className="relative">
              <button
                className="absolute top-2 right-2 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-5 w-5" />
              </button>

              {selectedImage !== null && (
                <div className="relative aspect-[4/3] w-full max-h-[80vh]">
                  <Image
                    src={images[selectedImage] || "/placeholder.svg"}
                    alt={`${brandName} gallery image ${selectedImage + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all",
                      selectedImage === index ? "bg-white w-5" : "bg-white/50",
                    )}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={selectedImage !== null} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DrawerContent className="p-0">
            <div className="relative p-4">
              <button
                className="absolute top-2 right-2 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-5 w-5" />
              </button>

              {selectedImage !== null && (
                <div className="relative aspect-square w-full">
                  <Image
                    src={images[selectedImage] || "/placeholder.svg"}
                    alt={`${brandName} gallery image ${selectedImage + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              <div className="mt-2 flex justify-between">
                <button className="bg-muted hover:bg-muted/80 p-2 rounded-full" onClick={prevImage}>
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex justify-center gap-2 items-center">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        selectedImage === index ? "bg-primary w-4" : "bg-muted-foreground",
                      )}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>

                <button className="bg-muted hover:bg-muted/80 p-2 rounded-full" onClick={nextImage}>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

