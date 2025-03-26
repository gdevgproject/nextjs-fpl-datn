import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/utils/helpers"

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
  activeCategory?: string
  categoryProducts?: CategoryProduct[]
  bestSellingProducts?: BestSellingProduct[]
}

export default function MegaMenuColumn({ activeCategory, categoryProducts, bestSellingProducts }: MegaMenuColumnProps) {
  return (
    <div
      className={cn(
        "space-y-6 bg-primary-5/10 p-6 rounded-xl w-full",
        activeCategory === "vitamin" ? "rounded-tl-none" : "",
      )}
    >
      {/* Category Products Grid */}
      {categoryProducts && categoryProducts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {categoryProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex items-center gap-3 rounded-[8px] bg-white p-3 shadow-md transition-shadow hover:shadow-xl"
            >
              <Image
                alt={product.name}
                className="h-10 w-10 object-contain"
                height={40}
                src={product.image || "/placeholder.svg"}
                width={40}
              />
              <span className="text-sm text-grayscale-90">{product.name}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Best Selling Section */}
      {bestSellingProducts && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center text-primary">
              <Image src="/placeholder.svg" alt="" width={20} height={20} className="h-5 w-5" />
            </div>
            <h3 className="font-medium text-grayscale-90">Bán chạy nhất</h3>
            <div className="h-5">
              <Separator orientation="vertical" />
            </div>
            <Link className="flex items-center gap-1 text-sm text-primary hover:underline" href="#">
              Xem thêm
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {bestSellingProducts.map((product) => (
              <Link key={product.id} className="group space-y-2" href={`/products/${product.id}`}>
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    fill
                    alt={product.name}
                    className="object-contain transition-transform group-hover:scale-105"
                    src={product.image || "/placeholder.svg"}
                  />
                </div>
                <h4 className="line-clamp-2 text-sm text-grayscale-90 group-hover:text-primary-40">{product.name}</h4>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-semibold text-primary">{product.price.toLocaleString()}đ</span>
                    <span className="text-xs font-normal text-primary">/{product.unit}</span>
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

