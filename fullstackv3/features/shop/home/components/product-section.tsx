import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/shared/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "../types"

interface ProductSectionProps {
  title: string
  description: string
  products: Product[]
  viewAllLink: string
  isLoading?: boolean
  bgColor?: "default" | "muted" | "accent" | "subtle"
}

export function ProductSection({
  title,
  description,
  products,
  viewAllLink,
  isLoading = false,
  bgColor = "default",
}: ProductSectionProps) {
  // Get background color class based on the bgColor prop
  const getBgClass = () => {
    switch (bgColor) {
      case "muted":
        return "bg-muted/60 dark:bg-muted/30"
      case "accent":
        return "bg-primary/5 dark:bg-primary/10"
      case "subtle":
        return "bg-secondary/5 dark:bg-secondary/10"
      default:
        return "bg-background"
    }
  }

  // Nếu đang loading, hiển thị skeleton
  if (isLoading) {
    return (
      <section className={getBgClass()}>
        <div className="container py-12">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Nếu không có sản phẩm, hiển thị placeholder
  const displayProducts =
    products.length > 0
      ? products
      : Array.from({ length: 4 }).map((_, i) => ({
          id: i,
          name: `Sản phẩm mẫu ${i + 1}`,
          slug: `san-pham-mau-${i + 1}`,
          short_description: `Mô tả sản phẩm mẫu ${i + 1}`,
          price: 1000000 + i * 100000,
          sale_price: i % 2 === 0 ? 800000 + i * 100000 : null,
          brand_id: null,
          gender_id: null,
          concentration_id: null,
          perfume_type_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          images: [
            {
              id: i,
              product_id: i,
              image_url: `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(`Sản phẩm ${i + 1}`)}`,
              is_main: true,
              display_order: 0,
              created_at: new Date().toISOString(),
              updated_at: null,
            },
          ],
          variants: [
            {
              id: i,
              product_id: i,
              volume_ml: 100,
              price: 1000000 + i * 100000,
              sale_price: i % 2 === 0 ? 800000 + i * 100000 : null,
              sku: `SKU-${i}`,
              stock_quantity: 10,
              created_at: new Date().toISOString(),
              updated_at: null,
              deleted_at: null,
            },
          ],
        }))

  return (
    <section className={getBgClass()}>
      <div className="container py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <Button asChild variant="outline" className="self-start sm:self-center">
            <Link href={viewAllLink}>Xem tất cả</Link>
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

