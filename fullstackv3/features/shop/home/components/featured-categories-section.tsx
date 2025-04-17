"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/features/shop/shared/components/product-card";
import ProductSectionSkeleton from "./product-section-skeleton";
import { cn } from "@/lib/utils";
import type { ProductData } from "../hooks/use-new-arrivals";
import { useFeaturedCategoryProducts } from "../hooks/use-featured-categories";

interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
}

interface FeaturedCategoriesSectionProps {
  categories: Category[];
  initialProducts?: ProductData[];
}

export default function FeaturedCategoriesSection({
  categories,
  initialProducts,
}: FeaturedCategoriesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    categories.length > 0 ? categories[0] : null
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Conditionally hydrate or fetch products for selected category
  const categoryId = selectedCategory?.id || null;
  const {
    data: productsData,
    isLoading,
    error,
  } = useFeaturedCategoryProducts(
    categoryId,
    initialProducts && categoryId === categories[0].id
      ? initialProducts
      : undefined
  );

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Danh mục nổi bật
          </h2>
          <p className="text-muted-foreground">
            Khám phá các bộ sưu tập nước hoa đặc biệt của chúng tôi
          </p>
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
          <Link
            href="/san-pham"
            className="text-sm font-medium hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
      </div>

      {/* Category tabs */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 pb-4 overflow-x-auto scrollbar-hide snap-x"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className="focus:outline-none"
            >
              <div
                className={cn(
                  "min-w-[180px] max-w-[180px] sm:min-w-[200px] sm:max-w-[200px] snap-start transition-all duration-200",
                  selectedCategory?.id === category.id
                    ? "ring-2 ring-primary scale-[1.02] shadow-md"
                    : "hover:scale-[1.01] hover:shadow-sm"
                )}
              >
                <Card className="overflow-hidden h-full border-0 shadow-sm">
                  <div className="relative h-28 sm:h-32 w-full">
                    <Image
                      src={
                        category.image_url ||
                        "/placeholder.svg?height=128&width=200"
                      }
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 180px, 200px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <CardContent className="p-3 text-white">
                        <h3 className="font-semibold text-center drop-shadow-sm">
                          {category.name}
                        </h3>
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
                index === categories.indexOf(selectedCategory as Category)
                  ? "w-4 bg-primary"
                  : "w-1 bg-muted"
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
        ) : productsData?.data.length === 0 ? (
          <div className="p-8 text-center rounded-lg bg-muted/30">
            <p className="text-muted-foreground">
              Không có sản phẩm nào trong danh mục này
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {productsData?.data.map((product) => (
              <ProductCard
                key={`category-${product.id}-${
                  product.variants?.[0]?.id || "default"
                }`}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
