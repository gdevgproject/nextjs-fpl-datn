"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrands, type Brand } from "../hooks/use-brands";

export default function BrandsSection({
  initialData,
}: {
  initialData?: Brand[];
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const query = !initialData
    ? useBrands()
    : { data: initialData, isLoading: false, error: null };
  const { data, isLoading, error } = query;

  const scrollBy = (distance: number) => {
    scrollContainerRef.current?.scrollBy({
      left: distance,
      behavior: "smooth",
    });
  };

  const iconBtnClasses =
    "rounded-full hidden md:flex border border-border shadow-md bg-background hover:bg-primary/10 dark:hover:bg-primary/20 transition";

  // loading or error states
  if (isLoading) {
    return (
      <section className="space-y-6">
        <Header />
        <div className="flex space-x-4 pb-4 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }
  if (error || !data || data.length === 0) return null;

  return (
    <section className="space-y-6">
      <Header
        scrollLeft={() => scrollBy(-300)}
        scrollRight={() => scrollBy(300)}
      />
      <div
        ref={scrollContainerRef}
        className="scroll-container flex space-x-8 pb-4 overflow-x-auto snap-x rounded-xl bg-muted/40 dark:bg-muted/10 px-4 transition-all scrollbar-thin"
        style={
          {
            "--scroll-thumb": "#d864a5",
            "--scroll-thumb-hover": "#bf4091",
            "--scroll-thumb-dark": "#a1337e",
            "--scroll-thumb-dark-hover": "#91286a",
          } as React.CSSProperties
        }
      >
        {data.map((brand: Brand) => (
          <Link
            key={brand.id}
            href={`/san-pham?brand=${brand.id}`}
            className="min-w-[200px] max-w-[200px] snap-start"
          >
            <Card className="overflow-hidden h-full bg-background border border-border shadow-sm hover:shadow-2xl transition-all rounded-2xl group hover:border-primary/60 dark:hover:border-primary/80">
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <div className="relative h-24 w-24 mb-4 rounded-full border-2 border-primary/20 dark:border-primary/40 bg-white/80 dark:bg-zinc-900/80 flex items-center justify-center group-hover:scale-105 group-hover:shadow-lg transition-all duration-200">
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={brand.name}
                      fill
                      className="object-contain rounded-full"
                      sizes="96px"
                      priority={false}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-muted dark:bg-zinc-800 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-center text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                  {brand.name}
                </h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .scroll-container::-webkit-scrollbar {
          height: 8px;
          background: transparent;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: var(--scroll-thumb);
          border-radius: 8px;
          transition: background 0.2s;
        }
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: var(--scroll-thumb-hover);
        }
        .scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        @media (prefers-color-scheme: dark) {
          .scroll-container::-webkit-scrollbar-thumb {
            background: var(--scroll-thumb-dark);
          }
          .scroll-container::-webkit-scrollbar-thumb:hover {
            background: var(--scroll-thumb-dark-hover);
          }
        }
      `}</style>
    </section>
  );
}

function Header({
  scrollLeft,
  scrollRight,
}: {
  scrollLeft?: () => void;
  scrollRight?: () => void;
}) {
  const iconBtnClasses =
    "rounded-full hidden md:flex border border-border shadow-md bg-background hover:bg-primary/10 dark:hover:bg-primary/20 transition";
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
        Thương hiệu
      </h2>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className={iconBtnClasses}
          onClick={scrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={iconBtnClasses}
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Link
          href="/san-pham"
          className="text-sm font-medium hover:underline text-primary"
        >
          Xem tất cả
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="min-w-[180px] max-w-[180px]">
      <Card className="overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <Skeleton className="h-16 w-16 rounded-full mb-4" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    </div>
  );
}
