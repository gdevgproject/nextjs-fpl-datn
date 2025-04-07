"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/shared/product-card";
import type { Product } from "../types";

interface ProductSectionProps {
  title: string;
  description?: string;
  products: Product[];
  viewAllLink?: string;
  bgColor?: "default" | "muted" | "accent" | "subtle";
}

export function ProductSection({
  title,
  description,
  products,
  viewAllLink,
  bgColor = "default",
}: ProductSectionProps) {
  // Skip rendering if no products
  if (!products || products.length === 0) {
    return null;
  }

  const backgroundClasses = {
    default: "",
    muted: "bg-muted/50",
    accent: "bg-accent/30",
    subtle: "bg-secondary/10",
  };

  return (
    <section className={cn("py-12 md:py-16", backgroundClasses[bgColor])}>
      <div className="container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
            {description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {viewAllLink && (
            <Button variant="outline" asChild>
              <Link href={viewAllLink}>Xem tất cả</Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
