import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/types/shared.types"
import { DEFAULT_AVATAR_URL } from "@/lib/constants"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.find((img) => img.is_main)?.image_url || DEFAULT_AVATAR_URL
  const hasDiscount = product.sale_price !== null && product.sale_price < product.price

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Link href={`/san-pham/${product.slug}`}>
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={mainImage || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {hasDiscount && (
              <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                -{Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 rounded-full bg-white/80 hover:bg-white"
            >
              <Heart className="h-4 w-4" />
              <span className="sr-only">Thêm vào yêu thích</span>
            </Button>
          </div>
        </Link>
        <div className="p-4">
          {product.brand && <div className="text-xs text-muted-foreground">{product.brand.name}</div>}
          <Link href={`/san-pham/${product.slug}`} className="line-clamp-2 mt-1 font-medium hover:underline">
            {product.name}
          </Link>
          <div className="mt-2 flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="font-medium text-primary">{formatPrice(product.sale_price!)}</span>
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="font-medium text-primary">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">Thêm vào giỏ hàng</Button>
      </CardFooter>
    </Card>
  )
}

