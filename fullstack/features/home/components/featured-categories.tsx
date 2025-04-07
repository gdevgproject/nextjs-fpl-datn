"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "../types";

interface FeaturedCategoriesProps {
  categories: Category[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  // Skip rendering if no categories
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Danh mục nổi bật</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Khám phá bộ sưu tập nước hoa đa dạng của chúng tôi theo danh mục
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/danh-muc/${category.slug}`}
      className={cn(
        "group relative block h-[240px] overflow-hidden rounded-lg shadow-sm",
        "transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
    >
      {/* Category Image with overlay */}
      <div className="relative h-full w-full">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-accent flex items-center justify-center">
            <span className="text-2xl font-bold">
              {category.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Category name and description */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-xl font-bold mb-2">{category.name}</h3>
        {category.description && (
          <p className="text-sm text-white/90 line-clamp-2 group-hover:line-clamp-3 transition-all duration-300">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
}
