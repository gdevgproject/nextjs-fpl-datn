import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { Category } from "@/lib/types/shared.types"

interface FeaturedCategoriesProps {
  categories: Category[]
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  // Nếu không có danh mục, hiển thị placeholder
  const displayCategories =
    categories.length > 0
      ? categories
      : Array.from({ length: 6 }).map((_, i) => ({
          id: i,
          name: `Danh mục ${i + 1}`,
          slug: `danh-muc-${i + 1}`,
          description: `Mô tả danh mục ${i + 1}`,
          is_featured: true,
          display_order: i,
          parent_category_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

  return (
    <section className="bg-background py-12">
      <div className="container">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Danh mục nổi bật</h2>
            <p className="text-muted-foreground">Khám phá các danh mục sản phẩm đa dạng của chúng tôi</p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/danh-muc">Xem tất cả</Link>
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              href={`/danh-muc/${category.slug}`}
              className="group overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={`/placeholder.svg?height=200&width=200&text=${encodeURIComponent(category.name)}`}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium line-clamp-1">{category.name}</h3>
                {category.description && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{category.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

