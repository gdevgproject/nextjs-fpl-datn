import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { ProductCard } from "@/components/san-pham/product-card"

interface Product {
  id: number
  name: string
  slug: string
  brand: string
  price: number
  salePrice: number | null
  image: string
  rating: number
  isNew?: boolean
  isBestSeller?: boolean
  isSale?: boolean
  description?: string
  reviewCount?: number
}

interface BrandTopProductsProps {
  products: Product[]
  brandName: string
}

export function BrandTopProducts({ products, brandName }: BrandTopProductsProps) {
  if (!products.length) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
        <Link
          href={{
            pathname: `/thuong-hieu/${brandName.toLowerCase().replace(/\s+/g, "-")}`,
            query: { tab: "products" },
          }}
          className="text-sm font-medium text-primary flex items-center hover:underline"
        >
          Xem tất cả
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

