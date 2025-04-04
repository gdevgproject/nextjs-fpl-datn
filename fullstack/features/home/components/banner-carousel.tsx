"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Banner } from "@/lib/types/shared.types"

interface BannerCarouselProps {
  banners: Banner[]
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isImageLoading, setIsImageLoading] = useState(true)

  // Nếu không có banner, hiển thị banner mặc định
  const displayBanners =
    banners.length > 0
      ? banners
      : [
          {
            id: 0,
            title: "Khám phá bộ sưu tập mới",
            subtitle: "Nước hoa cao cấp với hương thơm độc đáo",
            image_url: "/placeholder.svg?height=600&width=1400",
            link_url: "/san-pham?sort=newest",
            is_active: true,
            display_order: 1,
            start_date: null,
            end_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 1,
            title: "Thương hiệu cao cấp",
            subtitle: "Các thương hiệu nước hoa nổi tiếng thế giới",
            image_url: "/placeholder.svg?height=600&width=1400",
            link_url: "/san-pham?perfume_type=1", // Giả sử 1 là ID của loại nước hoa cao cấp
            is_active: true,
            display_order: 2,
            start_date: null,
            end_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]

  const bannerCount = displayBanners.length

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerCount)
    setIsImageLoading(true)
  }, [bannerCount])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + bannerCount) % bannerCount)
    setIsImageLoading(true)
  }, [bannerCount])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  const handleImageLoad = () => {
    setIsImageLoading(false)
  }

  // Xử lý link_url để đảm bảo tương thích với trang sản phẩm
  const getLinkUrl = (banner: Banner) => {
    // Nếu link_url đã có, kiểm tra xem có cần điều chỉnh không
    if (banner.link_url) {
      // Nếu link_url là "/danh-muc/X", chuyển thành "/san-pham?category=X"
      if (banner.link_url.startsWith("/danh-muc/")) {
        const slug = banner.link_url.replace("/danh-muc/", "")
        return `/san-pham?category=${slug}`
      }

      // Nếu link_url là "/thuong-hieu/X", chuyển thành "/san-pham?brand=X"
      if (banner.link_url.startsWith("/thuong-hieu/")) {
        const slug = banner.link_url.replace("/thuong-hieu/", "")
        return `/san-pham?brand=${slug}`
      }

      // Nếu không cần điều chỉnh, giữ nguyên
      return banner.link_url
    }

    // Mặc định trỏ đến trang sản phẩm
    return "/san-pham"
  }

  return (
    <div className="relative w-full overflow-hidden" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayBanners.map((banner) => (
          <div key={banner.id} className="relative min-w-full">
            <div className="relative aspect-[21/9] w-full md:aspect-[3/1]">
              {isImageLoading && <Skeleton className="absolute inset-0 h-full w-full" />}
              <Image
                src={banner.image_url || "/placeholder.svg?height=600&width=1400"}
                alt={banner.title}
                fill
                priority
                className={`object-cover transition-opacity duration-300 ${isImageLoading ? "opacity-0" : "opacity-100"}`}
                sizes="100vw"
                onLoad={handleImageLoad}
                onError={handleImageLoad} // Also handle errors to prevent infinite loading state
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
                <div className="container flex h-full flex-col items-start justify-center p-4 text-white">
                  <h2 className="max-w-md text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">{banner.title}</h2>
                  {banner.subtitle && (
                    <p className="mt-2 max-w-md text-sm sm:text-base md:text-lg">{banner.subtitle}</p>
                  )}
                  {banner.link_url && (
                    <Button asChild className="mt-4 bg-white text-black hover:bg-white/90">
                      <Link href={getLinkUrl(banner)}>Khám phá ngay</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {bannerCount > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50"
            onClick={prevSlide}
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50"
            onClick={nextSlide}
            aria-label="Next banner"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {bannerCount > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
          {displayBanners.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-8 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

