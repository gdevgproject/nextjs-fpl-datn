import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import type { Category } from "@/lib/types/shared.types"

interface CategoryCardProps {
  category: Category
  productCount: number
}

export function CategoryCard({ category, productCount }: CategoryCardProps) {
  return (
    <Link
      href={`/san-pham?category=${category.slug}`}
      className="group overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={`/placeholder.svg?height=300&width=300&text=${encodeURIComponent(category.name)}`}
          alt={category.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {category.is_featured && <Badge className="absolute left-2 top-2 bg-primary hover:bg-primary">Nổi bật</Badge>}
      </div>
      <div className="p-4">
        <h3 className="font-medium line-clamp-1">{category.name}</h3>
        {category.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{category.description}</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">{productCount} sản phẩm</p>
      </div>
    </Link>
  )
}

