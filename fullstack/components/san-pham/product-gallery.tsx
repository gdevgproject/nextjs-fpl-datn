"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ZoomIn } from "lucide-react"

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image with Zoom */}
      <Dialog open={isZoomDialogOpen} onOpenChange={setIsZoomDialogOpen}>
        <DialogTrigger asChild>
          <div className="relative aspect-square rounded-lg overflow-hidden border cursor-zoom-in">
            <Image
              src={images[selectedImage] || "/placeholder.svg"}
              alt={`${productName} - Hình ${selectedImage + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute bottom-4 right-4 bg-black/50 rounded-full p-2">
              <ZoomIn className="h-5 w-5 text-white" />
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl p-0">
          <Tabs defaultValue={selectedImage.toString()}>
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">{productName}</h2>
              <TabsList className="mt-2">
                {images.map((_, index) => (
                  <TabsTrigger
                    key={index}
                    value={index.toString()}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {images.map((image, index) => (
              <TabsContent key={index} value={index.toString()} className="m-0 relative aspect-square">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${productName} - Hình phóng to ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            className={cn(
              "relative border rounded-md overflow-hidden aspect-square",
              selectedImage === index ? "ring-2 ring-primary" : "",
            )}
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`${productName} - Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

