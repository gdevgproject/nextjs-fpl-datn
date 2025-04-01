"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency } from "@/lib/utils"
import { ProductCardWishlist } from "@/components/san-pham/product-card-wishlist"

interface ProductCardProps {
  product: {
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
  }
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAddingToWishlist(true)

    // Giả lập API call
    setTimeout(() => {
      setIsWishlisted(!isWishlisted)
      setIsAddingToWishlist(false)
    }, 500)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAddingToCart(true)

    // Giả lập API call
    setTimeout(() => {
      setIsAddingToCart(false)
      // Hiển thị thông báo thành công
    }, 500)
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md",
        className,
      )}
    >
      <Link href={`/san-pham/${product.slug}`} className="block">
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

        {/* Product Actions */}
        <div className="absolute right-2 top-2 z-10 flex flex-col gap-2">
          <ProductCardWishlist
            productId={product.id}
            productName={product.name}
            className="h-8 w-8 rounded-full bg-background/80 shadow-sm"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                >
                  <Heart className={cn("h-4 w-4", isWishlisted ? "fill-destructive text-destructive" : "")} />
                  <span className="sr-only">Thêm vào yêu thích</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isWishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="sr-only">Thêm vào giỏ hàng</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Thêm vào giỏ hàng</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Product Image */}
        <div className="aspect-square overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={300}
            height={300}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="mb-1 text-sm text-muted-foreground">{product.brand}</div>
          <h3 className="mb-2 line-clamp-2 font-medium">{product.name}</h3>

          <div className="mb-2 flex items-center">
            <div className="flex items-center">
              <Star className="mr-1 h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
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
          </div>
        </div>
      </Link>
    </div>
  )
}

