"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary">
            Danh mục nổi bật
          </h2>
          <div className="mt-2 mb-4 h-1 w-16 bg-primary rounded-full" />
          <p className="text-base text-muted-foreground/80 dark:text-gray-300">
            Khám phá các bộ sưu tập nước hoa đặc biệt của chúng tôi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/san-pham"
            className="px-4 py-2 rounded-full bg-primary text-white shadow hover:bg-primary/90 transition"
          >
            Xem tất cả
          </Link>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto pb-6 snap-x scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary/70 dark:scrollbar-thumb-secondary/70"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "snap-start min-w-[200px] transition-all duration-300 rounded-2xl overflow-hidden",
                selectedCategory?.id === category.id
                  ? "bg-primary/10 dark:bg-secondary/10 ring-2 ring-primary shadow-lg"
                  : "hover:scale-105 hover:shadow-md"
              )}
            >
              <Card className="overflow-hidden border-0 shadow-none bg-transparent">
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
            </button>
          ))}
        </div>

        {/* Mobile scroll indicators */}
        <div className="flex justify-center mt-4 gap-2 md:hidden">
          {categories.map((_, i) => (
            <span
              key={i}
              className={cn(
                "block h-2 rounded-full transition-all duration-300",
                i === categories.indexOf(selectedCategory as Category)
                  ? "w-6 bg-primary shadow-md"
                  : "w-2 bg-muted/60"
              )}
            />
          ))}
        </div>
      </div>

      {/* PRODUCTS GRID */}
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
