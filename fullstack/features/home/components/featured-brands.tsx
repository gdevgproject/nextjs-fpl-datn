"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Brand } from "../types";

interface FeaturedBrandsProps {
  brands: Brand[];
}

export function FeaturedBrands({ brands }: FeaturedBrandsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Skip rendering if no brands
  if (!brands || brands.length === 0) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount =
        direction === "left"
          ? -container.offsetWidth / 2
          : container.offsetWidth / 2;

      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-muted/20">
      <div className="container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Thương hiệu nổi bật
            </h2>
            <p className="text-muted-foreground mt-2">
              Khám phá các thương hiệu nước hoa cao cấp
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/thuong-hieu"
              className="group hidden sm:flex items-center text-sm font-medium text-primary hover:underline"
            >
              Xem tất cả
              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable container for brand logos */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-8 pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {brands.map((brand) => (
            <BrandLogoItem key={brand.id} brand={brand} />
          ))}
        </div>

        {/* Mobile-only "View All" link */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/thuong-hieu"
            className="group inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Xem tất cả thương hiệu
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function BrandLogoItem({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/san-pham?brand=${brand.id}`}
      className={cn(
        "flex flex-col items-center justify-center min-w-[160px] md:min-w-[180px] snap-start transition-transform",
        "hover:scale-105 focus:scale-105 outline-none"
      )}
    >
      <div className="relative w-[120px] h-[120px] md:w-[140px] md:h-[140px] bg-white dark:bg-gray-800 rounded-full shadow-sm overflow-hidden p-4 flex items-center justify-center">
        {brand.logo_url ? (
          <Image
            src={brand.logo_url}
            alt={brand.name}
            width={100}
            height={100}
            className="object-contain max-w-full max-h-full dark:filter dark:brightness-90"
          />
        ) : (
          <div className="text-xl font-bold text-center text-primary">
            {brand.name.charAt(0)}
          </div>
        )}
      </div>
      <h3 className="mt-4 font-medium text-center">{brand.name}</h3>
    </Link>
  );
}
