import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { Brand } from "../types"

interface FeaturedBrandsProps {
  brands: Brand[]
}

export function FeaturedBrands({ brands }: FeaturedBrandsProps) {
  // Nếu không có thương hiệu, hiển thị placeholder
  const displayBrands =
    brands.length > 0
      ? brands
      : Array.from({ length: 6 }).map((_, i) => ({
          id: i,
          name: `Thương hiệu ${i + 1}`,
          description: `Mô tả thương hiệu ${i + 1}`,
          logo_url: `/placeholder.svg?height=100&width=200&text=${encodeURIComponent(`Thương hiệu ${i + 1}`)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

  return (
    <section className="bg-primary/5 dark:bg-primary/10 py-12">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold tracking-tight">Thương hiệu nổi tiếng</h2>
            <p className="text-muted-foreground">Chúng tôi hợp tác với các thương hiệu nước hoa hàng đầu thế giới</p>
          </div>
          <Button asChild variant="outline" className="self-start sm:self-center">
            <Link href="/thuong-hieu">Xem tất cả</Link>
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {displayBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/san-pham?brand=${brand.id}`}
              className="group flex h-24 items-center justify-center rounded-lg bg-background p-4 transition-all hover:shadow-md hover:scale-105 border border-transparent hover:border-primary/20"
            >
              <div className="relative flex h-full w-full items-center justify-center">
                {brand.logo_url ? (
                  <Image
                    src={brand.logo_url || "/placeholder.svg"}
                    alt={brand.name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  />
                ) : (
                  <span className="text-center text-sm font-medium">{brand.name}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

