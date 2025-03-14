import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"

interface CategoryProduct {
  id: string
  name: string
  image: string
}

interface BestSellingProduct {
  id: string
  name: string
  image: string
  price: number
  originalPrice: number
  unit: string
}

interface MegaMenuColumnProps {
  categoryProducts?: CategoryProduct[]
  bestSellingProducts?: BestSellingProduct[]
}

export default function MegaMenuColumn({ categoryProducts, bestSellingProducts }: MegaMenuColumnProps) {
  return (
    <div className="space-y-6">
      {/* Category Products Grid */}
      {categoryProducts && (
        <div className="grid grid-cols-3 gap-4">
          {categoryProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <span className="text-sm text-grayscale-90">{product.name}</span>
            </Link>
          ))}
          <Link
            href="#"
            className="flex items-center justify-center gap-2 rounded-lg bg-white p-3 text-sm text-grayscale-50"
          >
            <span>Xem thêm</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Best Selling Section */}
      {bestSellingProducts && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-5">
                <Image src="/placeholder.svg" alt="" width={16} height={16} className="text-white" />
              </div>
              <h3 className="font-medium text-grayscale-90">Bán chạy nhất</h3>
            </div>
            <Link href="#" className="flex items-center gap-1 text-sm text-primary-40 hover:underline">
              Xem tất cả
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {bestSellingProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group space-y-2">
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain transition-transform group-hover:scale-105"
                  />
                </div>
                <h4 className="line-clamp-2 text-sm text-grayscale-90 group-hover:text-primary-40">{product.name}</h4>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-medium text-primary-5">{product.price.toLocaleString()}đ</span>
                    <span className="text-sm text-grayscale-50">/{product.unit}</span>
                  </div>
                  <span className="text-sm text-grayscale-40 line-through">
                    {product.originalPrice.toLocaleString()}đ
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

