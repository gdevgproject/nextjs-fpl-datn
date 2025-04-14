"use client"

import { useRef } from "react"
import { useClientFetch } from "@/shared/hooks/use-client-fetch"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function BrandsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, error } = useClientFetch(
    ["brands", "all"],
    "brands",
    {
      columns: "id, name, logo_url, description",
      sort: [{ column: "name", ascending: true }],
    },
    {
      staleTime: 1000 * 60 * 30, // 30 minutes
    },
  )

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  // Handle loading state
  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Thương hiệu</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full hidden md:flex" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full hidden md:flex" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Link href="/san-pham" className="text-sm font-medium">
              Xem tất cả
            </Link>
          </div>
        </div>
        <div className="flex space-x-4 pb-4 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="min-w-[180px] max-w-[180px]">
              <Card className="overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <Skeleton className="h-16 w-16 rounded-full mb-4" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // Handle error state
  if (error || !data?.data) {
    return null
  }

  // If no brands found
  if (data.data.length === 0) {
    return null
  }

  const brands = data.data as any[]

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Thương hiệu</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full hidden md:flex"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full hidden md:flex"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Link href="/san-pham" className="text-sm font-medium">
            Xem tất cả
          </Link>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex space-x-4 pb-4 overflow-x-auto scrollbar-hide snap-x">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/san-pham?brand=${brand.id}`} className="min-w-[180px] max-w-[180px] snap-start">
            <Card className="overflow-hidden h-full transition-all hover:shadow-md">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="relative h-16 w-16 mb-4">
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url || "/placeholder.svg"}
                      alt={brand.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xl font-semibold">{brand.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-center">{brand.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
