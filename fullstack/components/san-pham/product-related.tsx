"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/san-pham/product-card"

interface ProductRelatedProps {
  products: {
    id: number
    name: string
    slug: string
    brand: string
    price: number
    salePrice: number | null
    image: string
    rating: number
    isNew?: boolean
    isBestSeller?: boolean
    isSale?: boolean
  }[]
}

export function ProductRelated({ products }: ProductRelatedProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 320 // Roughly the width of a card + gap
    const currentScroll = container.scrollLeft

    container.scrollTo({
      left: direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <div className="relative">
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 hidden md:block">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-background shadow-md"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Scroll left</span>
        </Button>
      </div>

      <div ref={scrollContainerRef} className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {products.map((product) => (
          <div key={product.id} className="min-w-[250px] max-w-[250px] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden md:block">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-background shadow-md"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Scroll right</span>
        </Button>
      </div>
    </div>
  )
}

