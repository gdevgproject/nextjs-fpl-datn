"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Slide, SlideGallery } from "@/lib/mockData"

interface HeroSectionProps {
  slides: Slide[]
  slideGalleries: SlideGallery[]
}

export default function HeroSection({ slides, slideGalleries }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const activeSlides = slides.filter((slide) => slide.active === "on")

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length)
    }, activeSlides[currentSlide]?.speed || 3000)

    return () => clearInterval(interval)
  }, [currentSlide, activeSlides])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)
  }

  return (
    <div className="relative h-[600px] overflow-hidden">
      {activeSlides.map((slide, index) => {
        const gallery = slideGalleries.find((g) => g.slide_id === slide.id)
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {gallery && (
              <div className="relative h-full w-full">
                <Image
                  src={gallery.path || "/placeholder.svg"}
                  alt={slide.name}
                  layout="fill"
                  objectFit="cover"
                  priority
                  className="transition-transform duration-1000 transform scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white max-w-4xl px-4">
                    <h2 className="text-4xl md:text-6xl font-bold mb-4 font-serif">{slide.name}</h2>
                    <p className="text-xl md:text-2xl mb-8 font-sans">Discover your signature scent</p>
                    <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
      {activeSlides[0]?.arrow === "on" && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white"
            onClick={nextSlide}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}
      {activeSlides[0]?.dots === "on" && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${index === currentSlide ? "bg-white" : "bg-gray-400"}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

