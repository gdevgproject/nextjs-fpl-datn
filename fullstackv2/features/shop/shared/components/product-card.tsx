"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatCurrency } from "@/shared/lib/utils"
import { Heart, ShoppingCart, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useContext } from "react"
import { CartContext } from "@/features/shop/cart/context/cart-context"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/shared/lib/utils"

export interface ProductCardProps {
  id: number
  slug: string
  name: string
  brand_name?: string
  image_url?: string
  price: number
  sale_price?: number | null
  variant_id?: number
  stock_quantity?: number
  showAddToCart?: boolean
  gender_name?: string | null
  concentration_name?: string | null
  perfume_type_name?: string | null
  discount_percentage?: number
}

export default function ProductCard({
  id,
  slug,
  name,
  brand_name,
  image_url,
  price,
  sale_price,
  variant_id,
  stock_quantity = 0,
  showAddToCart = true,
  gender_name,
  concentration_name,
  perfume_type_name,
  discount_percentage,
}: ProductCardProps) {
  const { addItem } = useContext(CartContext)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variant_id || stock_quantity <= 0) return

    addItem({
      variant_id,
      quantity: 1,
    })
  }

  const calculatedDiscountPercentage =
    discount_percentage || (sale_price && price ? Math.round(((price - sale_price) / price) * 100) : 0)
  const isOnSale = sale_price && sale_price < price
  const isOutOfStock = stock_quantity <= 0

  return (
    <Card className="overflow-hidden group h-full flex flex-col border-0 shadow-sm hover:shadow-md transition-all duration-200">
      <Link href={`/san-pham/${slug}`} className="relative block overflow-hidden">
        {isOnSale && (
          <Badge className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-600 shadow-sm">
            -{calculatedDiscountPercentage}%
          </Badge>
        )}
        {isOutOfStock && (
          <Badge variant="outline" className="absolute top-2 right-2 z-10 bg-background/80 shadow-sm">
            Hết hàng
          </Badge>
        )}
        <div className="aspect-square relative overflow-hidden bg-muted/30">
          <Image
            src={image_url || "/placeholder.svg?height=300&width=300"}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="flex-grow p-3 sm:p-4">
        <div className="space-y-1.5">
          {brand_name && (
            <Link href={`/thuong-hieu/${brand_name.toLowerCase().replace(/\s+/g, "-")}`}>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium hover:text-primary transition-colors">
                {brand_name}
              </p>
            </Link>
          )}
          <Link href={`/san-pham/${slug}`} className="block group-hover:text-primary transition-colors">
            <h3 className="font-medium text-sm sm:text-base leading-tight line-clamp-2">{name}</h3>
          </Link>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {gender_name && (
              <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 h-5 font-normal">
                {gender_name}
              </Badge>
            )}
            {concentration_name && (
              <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 h-5 font-normal">
                {concentration_name}
              </Badge>
            )}
            {perfume_type_name && (
              <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 h-5 font-normal">
                {perfume_type_name}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0 flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <div>
            {isOnSale ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base">{formatCurrency(sale_price)}</span>
                <span className="text-xs sm:text-sm text-muted-foreground line-through">{formatCurrency(price)}</span>
              </div>
            ) : (
              <span className="font-semibold text-sm sm:text-base">{formatCurrency(price)}</span>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          >
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Thêm vào yêu thích</span>
          </Button>
        </div>
        {showAddToCart && (
          <Button
            className={cn("w-full text-xs sm:text-sm h-8 sm:h-9", !isOutOfStock && "bg-primary/90 hover:bg-primary")}
            size="sm"
            onClick={handleAddToCart}
            disabled={!variant_id || isOutOfStock}
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Thêm vào giỏ
          </Button>
        )}
        {isOutOfStock && (
          <div className="flex items-center text-red-600 text-xs sm:text-sm mt-1">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
            <span>Hết hàng</span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
