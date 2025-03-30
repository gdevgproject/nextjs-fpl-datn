import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

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

interface ProductListViewProps {
  products: Product[]
}

export function ProductListView({ products }: ProductListViewProps) {
  if (!products.length) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Không tìm thấy sản phẩm phù hợp.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex flex-col sm:flex-row gap-4 border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          {/* Product Image */}
          <div className="relative sm:w-48 h-48 flex-shrink-0">
            <Link href={`/san-pham/${product.slug}`}>
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover rounded-md"
              />
            </Link>

            {/* Product Labels */}
            <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
              {product.isNew && (
                <Badge variant="default" className="px-2 py-1">
                  Mới
                </Badge>
              )}
              {product.isBestSeller && (
                <Badge variant="secondary" className="px-2 py-1">
                  Bán chạy
                </Badge>
              )}
              {product.isSale && (
                <Badge variant="destructive" className="px-2 py-1">
                  Giảm giá
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 flex flex-col">
            <div className="mb-1 text-sm text-muted-foreground">{product.brand}</div>
            <Link href={`/san-pham/${product.slug}`}>
              <h3 className="font-medium hover:text-primary transition-colors">{product.name}</h3>
            </Link>

            <div className="mt-1 mb-2 flex items-center">
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              </div>
              {product.reviewCount && (
                <span className="text-sm text-muted-foreground ml-2">({product.reviewCount} đánh giá)</span>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-auto">{product.description}</p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {product.salePrice ? (
                  <>
                    <span className="font-medium">{formatCurrency(product.salePrice)}</span>
                    <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.price)}</span>
                  </>
                ) : (
                  <span className="font-medium">{formatCurrency(product.price)}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="rounded-full w-9 h-9 p-0">
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">Thêm vào yêu thích</span>
                </Button>
                <Button size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Thêm vào giỏ
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

