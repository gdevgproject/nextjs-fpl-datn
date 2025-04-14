import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

interface ProductInfoProps {
  product: any
}

export function ProductInfo({ product }: ProductInfoProps) {
  // Tìm giá thấp nhất và cao nhất từ các variants
  const variants = product.variants || []
  const prices = variants.map((v: any) => v.price).filter((p: any) => p !== null && p > 0)
  const salePrices = variants.map((v: any) => v.sale_price).filter((p: any) => p !== null && p > 0)

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
  const minSalePrice = salePrices.length > 0 ? Math.min(...salePrices) : null
  const maxSalePrice = salePrices.length > 0 ? Math.max(...salePrices) : null

  // Kiểm tra xem có giảm giá không
  const hasDiscount = minSalePrice !== null && minSalePrice < minPrice

  // Tính phần trăm giảm giá
  const discountPercentage = hasDiscount ? Math.round(((minPrice - minSalePrice!) / minPrice) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Thương hiệu */}
      {product.brand && (
        <Link
          href={`/san-pham?brand=${product.brand.id}`}
          className="text-sm font-medium text-muted-foreground hover:text-primary"
        >
          {product.brand.name}
        </Link>
      )}

      {/* Tên sản phẩm */}
      <h1 className="text-3xl font-bold">{product.name}</h1>

      {/* Giá */}
      <div className="flex items-center gap-2">
        {hasDiscount ? (
          <>
            <span className="text-2xl font-bold text-primary">{formatPrice(minSalePrice!)}</span>
            <span className="text-lg text-muted-foreground line-through">{formatPrice(minPrice)}</span>
            <Badge className="ml-2 bg-red-500 hover:bg-red-600">-{discountPercentage}%</Badge>
          </>
        ) : (
          <span className="text-2xl font-bold text-primary">
            {minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
          </span>
        )}
      </div>

      {/* Mô tả ngắn */}
      {product.short_description && <p className="text-muted-foreground">{product.short_description}</p>}

      {/* Thông tin cơ bản */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {product.gender && (
          <div>
            <p className="text-sm font-medium">Giới tính</p>
            <p className="text-sm text-muted-foreground">{product.gender.name}</p>
          </div>
        )}
        {product.concentration && (
          <div>
            <p className="text-sm font-medium">Nồng độ</p>
            <p className="text-sm text-muted-foreground">{product.concentration.name}</p>
          </div>
        )}
        {product.perfume_type && (
          <div>
            <p className="text-sm font-medium">Loại nước hoa</p>
            <p className="text-sm text-muted-foreground">{product.perfume_type.name}</p>
          </div>
        )}
      </div>
    </div>
  )
}

