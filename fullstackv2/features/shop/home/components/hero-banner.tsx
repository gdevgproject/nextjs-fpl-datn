"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/shared/lib/utils"

interface Banner {
  id: number
  title: string
  subtitle?: string | null
  image_url: string
  link_url?: string | null
  display_order: number
}

interface HeroBannerProps {
  banners: Banner[]
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  const startAutoPlay = useCallback(() => {
    if (banners.length <= 1) return

    // Clear any existing interval
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }

    // Set new interval
    autoPlayRef.current = setInterval(() => {
      goToNext()
    }, 6000) // 6 seconds per slide
  }, [banners.length])

  // Initialize autoplay
  useEffect(() => {
    startAutoPlay()

    // Cleanup on unmount
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [startAutoPlay])

  // Handle animation
  const animateSlide = useCallback(
    (callback: () => void) => {
      if (isAnimating) return

      setIsAnimating(true)

      // Clear any existing animation timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }

      // Set timeout for animation
      animationTimeoutRef.current = setTimeout(() => {
        callback()

        // Reset animation state after a short delay
        setTimeout(() => {
          setIsAnimating(false)
        }, 50)
      }, 300)
    },
    [isAnimating],
  )

  const goToPrevious = useCallback(() => {
    if (banners.length <= 1) return

    animateSlide(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length)
    })

    // Reset autoplay timer when manually navigating
    startAutoPlay()
  }, [banners.length, animateSlide, startAutoPlay])

  const goToNext = useCallback(() => {
    if (banners.length <= 1) return

    animateSlide(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    })

    // Reset autoplay timer when manually navigating
    startAutoPlay()
  }, [banners.length, animateSlide, startAutoPlay])

  const goToSlide = useCallback(
    (index: number) => {
      if (index === currentIndex || banners.length <= 1) return

      animateSlide(() => {
        setCurrentIndex(index)
      })

      // Reset autoplay timer when manually navigating
      startAutoPlay()
    },
    [currentIndex, banners.length, animateSlide, startAutoPlay],
  )

  // Touch event handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }
  }

  // If no banners, show a default banner
  if (banners.length === 0) {
    return (
      <div className="relative w-full h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-r from-primary/20 to-primary/5">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Welcome to MyBeauty</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-6">
            Discover our exclusive collection of premium fragrances
          </p>
          <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all">
            Shop Now
          </Button>
        </div>
      </div>
    )
  }

  const currentBanner = banners[currentIndex]

  return (
    <div
      className="relative w-full h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Banner Image */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500 ease-in-out",
          isAnimating ? "opacity-80" : "opacity-100",
        )}
      >
        <Image
          src={currentBanner.image_url || "/placeholder.svg"}
          alt={currentBanner.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      {/* Banner Content */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-center p-6 md:p-12",
          "transition-all duration-500 ease-in-out",
          isAnimating ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100",
        )}
      >
        <div className="container mx-auto">
          <div className="max-w-lg">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-md">
              {currentBanner.title}
            </h2>
            {currentBanner.subtitle && (
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 drop-shadow-md">
                {currentBanner.subtitle}
              </p>
            )}
            {currentBanner.link_url && (
              <Link href={currentBanner.link_url}>
                <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all">
                  Khám phá ngay
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Only show if more than one banner */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full h-10 w-10 sm:h-12 sm:w-12 shadow-md backdrop-blur-sm z-10"
            onClick={goToPrevious}
            disabled={isAnimating}
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full h-10 w-10 sm:h-12 sm:w-12 shadow-md backdrop-blur-sm z-10"
            onClick={goToNext}
            disabled={isAnimating}
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  index === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/70 w-2.5",
                )}
                onClick={() => goToSlide(index)}
                disabled={isAnimating}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
