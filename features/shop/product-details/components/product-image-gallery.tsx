"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageGalleryProps {
  images: Array<{
    id: number;
    product_id: number;
    image_url: string;
    alt_text: string | null;
    is_main: boolean;
    display_order: number;
  }>;
}

export default function ProductImageGallery({
  images,
}: ProductImageGalleryProps) {
  // Sort images by display_order, with main image first
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_main) return -1;
    if (b.is_main) return 1;
    return a.display_order - b.display_order;
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + sortedImages.length) % sortedImages.length
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % sortedImages.length);
  };

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-square w-full bg-muted flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">Không có hình ảnh</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={sortedImages[currentImageIndex].image_url || "/placeholder.svg"}
          alt={sortedImages[currentImageIndex].alt_text || "Product image"}
          fill
          className="object-cover"
          sizes="100vw"
        />
        {sortedImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full h-10 w-10 sm:h-12 sm:w-12 shadow-md backdrop-blur-sm"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="sr-only">Previous image</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full h-10 w-10 sm:h-12 sm:w-12 shadow-md backdrop-blur-sm"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="sr-only">Next image</span>
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md",
                currentImageIndex === index && "ring-2 ring-primary"
              )}
              onClick={() => setCurrentImageIndex(index)}
            >
              <Image
                src={image.image_url || "/placeholder.svg"}
                alt={image.alt_text || "Product thumbnail"}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
