import Link from "next/link"
import Image from "next/image"
import { cn } from "@/utils/helpers"
import type { ArticleCategory } from "../types/articleTypes"

interface CategoryListProps {
  categories: ArticleCategory[]
  activeSlug?: string
}

export default function CategoryList({ categories, activeSlug }: CategoryListProps) {
  return (
    <nav className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6" aria-label="Danh mục bài viết">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/health-news/category/${category.slug}`}
          className={cn(
            "flex flex-col items-center rounded-lg p-4 transition-colors",
            activeSlug === category.slug ? "bg-primary-5 text-white" : "bg-white hover:bg-primary-5/5",
          )}
          aria-current={activeSlug === category.slug ? "page" : undefined}
        >
          <div className="relative mb-3 h-12 w-12 overflow-hidden rounded-full">
            <Image src={category.thumbnailUrl || "/placeholder.svg"} alt="" fill className="object-cover" />
          </div>
          <span
            className={cn(
              "text-center text-sm font-medium",
              activeSlug === category.slug ? "text-white" : "text-grayscale-90",
            )}
          >
            {category.name}
          </span>
        </Link>
      ))}
    </nav>
  )
}

