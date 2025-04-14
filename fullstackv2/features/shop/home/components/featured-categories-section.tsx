"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useClientFetch } from "@/shared/hooks/use-client-fetch"
import ProductCard from "@/features/shop/shared/components/product-card"
import ProductSectionSkeleton from "./product-section-skeleton"
import { cn } from "@/shared/lib/utils"

interface Category {
  id: number
  name: string
  slug: string
  image_url: string | null
  description: string | null
}

interface FeaturedCategoriesSectionProps {
  categories: Category[]
}

export default function FeaturedCategoriesSection({ categories }: FeaturedCategoriesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    categories.length > 0 ? categories[0] : null,
  )

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Properly use the hook at the top level of the component
  const {
    data: productsData,
    isLoading,
    error,
  } = useClientFetch(
    ["products", "category", selectedCategory?.id],
    "product_variants",
    {
      columns: `
        id, 
        price, 
        sale_price,
        stock_quantity,
        products!inner(
          id,
          name, 
          slug, 
          deleted_at,
          brands(name),
          genders(name),
          concentrations(name),
          perfume_types(name),
          product_images(
            image_url,
            is_main
          ),
          product_categories!inner(
            category_id
          )
        )
      `,
      filters: (query) =>
        query
          .eq("products.product_categories.category_id", selectedCategory?.id)
          .is("products.deleted_at", null)
          .gt("stock_quantity", 0)
          .order("created_at", { ascending: false })
          .limit(8),
    },
    {
      enabled: !!selectedCategory,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  )

  // Transform the data
  const products = ((productsData?.data as any[]) || []).map((variant) => ({
    id: variant.products.id,
    slug: variant.products.slug,
    name: variant.products.name,
    brand_name: variant.products.brands?.name,
    gender_name: variant.products.genders?.[0]?.name,
    concentration_name: variant.products.concentrations?.[0]?.name,
    perfume_type_name: variant.products.perfume_types?.[0]?.name,
    image_url:
      variant.products.product_images?.find((img: any) => img.is_main)?.image_url ||
      variant.products.product_images?.[0]?.image_url,
    price: variant.price,
    sale_price: variant.sale_price,
    variant_id: variant.id,
    stock_quantity: variant.stock_quantity,
    discount_percentage: variant.sale_price
      ? Math.round(((variant.price - variant.sale_price) / variant.price) * 100)
      : 0,
  }))

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

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Danh mục nổi bật</h2>
          <p className="text-muted-foreground">Khám phá các bộ sưu tập nước hoa đặc biệt của chúng tôi</p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
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
          <Link href="/san-pham" className="text-sm font-medium hover:underline">
            Xem tất cả
          </Link>
        </div>
      </div>

      {/* Category tabs */}
      <div className="relative">
        <div ref={scrollContainerRef} className="flex space-x-4 pb-4 overflow-x-auto scrollbar-hide snap-x">
          {categories.map((category) => (
            <button key={category.id} onClick={() => setSelectedCategory(category)} className="focus:outline-none">
              <div
                className={cn(
                  "min-w-[180px] max-w-[180px] sm:min-w-[200px] sm:max-w-[200px] snap-start transition-all duration-200",
                  selectedCategory?.id === category.id
                    ? "ring-2 ring-primary scale-[1.02] shadow-md"
                    : "hover:scale-[1.01] hover:shadow-sm",
                )}
              >
                <Card className="overflow-hidden h-full border-0 shadow-sm">
                  <div className="relative h-28 sm:h-32 w-full">
                    <Image
                      src={category.image_url || "/placeholder.svg?height=128&width=200"}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 180px, 200px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <CardContent className="p-3 text-white">
                        <h3 className="font-semibold text-center drop-shadow-sm">{category.name}</h3>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              </div>
            </button>
          ))}
        </div>

        {/* Mobile scroll indicators */}
        <div className="flex justify-center mt-2 gap-1 md:hidden">
          {categories.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 rounded-full transition-all",
                index === categories.indexOf(selectedCategory as Category) ? "w-4 bg-primary" : "w-1 bg-muted",
              )}
            />
          ))}
        </div>
      </div>

      {/* Products for selected category */}
      <div className="mt-6">
        {isLoading ? (
          <ProductSectionSkeleton />
        ) : error ? (
          <div className="p-8 text-center rounded-lg bg-muted/30">
            <p className="text-muted-foreground mb-4">Không thể tải sản phẩm</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center rounded-lg bg-muted/30">
            <p className="text-muted-foreground">Không có sản phẩm nào trong danh mục này</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={`${product.id}-${product.variant_id}`} {...product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
