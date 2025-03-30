import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
  category: {
    id: number
    name: string
    slug: string
    image: string
    productCount: number
  }
  className?: string
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      href={`/danh-muc/${category.slug}`}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="aspect-square overflow-hidden">
        <Image
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          width={300}
          height={300}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
          <div className="text-white">
            <h3 className="font-medium">{category.name}</h3>
            <p className="text-sm text-white/80">{category.productCount} sản phẩm</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

