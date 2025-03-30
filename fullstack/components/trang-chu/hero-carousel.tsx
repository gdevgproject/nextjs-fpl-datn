"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Banner {
  id: number
  title: string
  subtitle: string
  image: string
  buttonText: string
  buttonLink: string
}

interface HeroCarouselProps {
  banners: Banner[]
  autoplay?: boolean
  interval?: number
}

export function HeroCarousel({ banners, autoplay = true, interval = 5000 }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const previousSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }, [banners.length])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
  }, [banners.length])

  // Handle autoplay
  useEffect(() => {
    if (!autoplay || isPaused) return

    const timer = setInterval(() => {
      nextSlide()
    }, interval)

    return () => clearInterval(timer)
  }, [autoplay, interval, isPaused, nextSlide])

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    }

    if (isRightSwipe) {
      previousSlide()
    }

    // Reset touch values
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Handle key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        previousSlide()
      } else if (e.key === "ArrowRight") {
        nextSlide()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nextSlide, previousSlide])

  if (!banners.length) return null

  return (
    <div
      className="relative overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-out h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="w-full flex-shrink-0 relative">
            <Image src={banner.image || "/placeholder.svg"} alt={banner.title} fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
              <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-lg text-white space-y-4">
                  <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl">{banner.title}</h1>
                  <p className="text-sm sm:text-base md:text-lg">{banner.subtitle}</p>
                  <Button size="lg" asChild>
                    <Link href={banner.buttonLink}>{banner.buttonText}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={previousSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all",
              currentSlide === index ? "bg-white w-8" : "bg-white/50",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

