"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Banner } from "../types";

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto advance slides every 5 seconds if autoplay is enabled
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length, isAutoPlaying]);

  // Pause autoplay when user interacts
  const handleManualNavigation = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);

    // Resume autoplay after 10 seconds of inactivity
    const timeout = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);

    return () => clearTimeout(timeout);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? banners.length - 1 : currentIndex - 1;
    handleManualNavigation(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % banners.length;
    handleManualNavigation(newIndex);
  };

  // Handle empty or single banner case
  if (!banners || banners.length === 0) {
    return null;
  }

  // For a single banner, just display it without controls
  if (banners.length === 1) {
    const banner = banners[0];
    return (
      <div className="relative overflow-hidden rounded-lg h-[300px] md:h-[400px] lg:h-[500px]">
        <BannerItem banner={banner} isCurrent={true} />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg h-[300px] md:h-[400px] lg:h-[500px]">
      {/* Carousel Items */}
      {banners.map((banner, index) => (
        <BannerItem
          key={banner.id}
          banner={banner}
          isCurrent={index === currentIndex}
        />
      ))}

      {/* Navigation buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/50 hover:bg-background/80 z-10"
        onClick={goToPrevious}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/50 hover:bg-background/80 z-10"
        onClick={goToNext}
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => handleManualNavigation(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentIndex
                ? "bg-primary w-4"
                : "bg-primary/50 hover:bg-primary/80"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Separate component for each banner item with optimized transitions
function BannerItem({
  banner,
  isCurrent,
}: {
  banner: Banner;
  isCurrent: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-all duration-500 transform",
        isCurrent
          ? "opacity-100 translate-x-0 z-[1]"
          : "opacity-0 translate-x-full z-0"
      )}
    >
      {/* Banner Image */}
      <div className="relative w-full h-full">
        <Image
          src={banner.image_url}
          alt={banner.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
          priority={isCurrent}
          className="object-cover"
        />
      </div>

      {/* Banner Content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
        <h2 className="text-xl md:text-3xl font-bold mb-2">{banner.title}</h2>
        {banner.subtitle && (
          <p className="text-sm md:text-base mb-4 max-w-lg">
            {banner.subtitle}
          </p>
        )}
        {banner.link_url && (
          <Link
            href={banner.link_url}
            className="inline-flex bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md transition w-fit"
          >
            Xem thêm
          </Link>
        )}
      </div>
    </div>
  );
}
