"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: Array<{
    id: number;
    image_url: string;
    alt_text?: string | null;
    is_main: boolean;
  }>;
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Sắp xếp ảnh để ảnh chính hiển thị đầu tiên
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_main && !b.is_main) return -1;
    if (!a.is_main && b.is_main) return 1;
    return 0;
  });

  // Nếu không có ảnh, hiển thị ảnh mặc định
  const displayImages =
    sortedImages.length > 0
      ? sortedImages
      : [
          {
            id: 0,
            image_url: `/placeholder.svg?height=600&width=600&text=${encodeURIComponent(
              productName
            )}`,
            alt_text: productName,
            is_main: true,
          },
        ];

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
    setIsLoading(true);
  }, [displayImages.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
    setIsLoading(true);
  }, [displayImages.length]);

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setIsLoading(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {isLoading && <Skeleton className="absolute inset-0 h-full w-full" />}
        <Image
          src={displayImages[currentImageIndex].image_url || "/placeholder.svg"}
          alt={displayImages[currentImageIndex].alt_text || productName}
          fill
          className={cn(
            "object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 text-foreground hover:bg-background/90"
              onClick={handlePrevImage}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 text-foreground hover:bg-background/90"
              onClick={handleNextImage}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={image.id}
              className={cn(
                "relative aspect-square h-20 overflow-hidden rounded-md border",
                index === currentImageIndex
                  ? "border-primary"
                  : "border-muted hover:border-primary/50"
              )}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.image_url || "/placeholder.svg"}
                alt={image.alt_text || `${productName} - Ảnh ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                loading="lazy" // Added lazy loading
                onError={handleImageError} // Added error handling
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
