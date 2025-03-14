"use client"

import { Button } from "@/components/ui/Button"
import { useCart } from "@/features/cart/hooks/useCart"
import type { Product } from "@/features/product/types/productTypes"
import { ShoppingCart, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    // Use the current variant or first variant if available
    const variant = product.currentVariant || product.variants?.[0]

    addItem({
      id: `${product.id}-${variant?.id || "default"}`,
      name: product.name,
      price: variant?.price || product.price,
      originalPrice: variant?.originalPrice || product.originalPrice,
      quantity: 1,
      unit: variant?.name || product.unit || "Hộp",
      image: product.images?.[0]?.url,
    })
  }

  // Get price and originalPrice from current variant or product
  const price = product.currentVariant?.price || product.price
  const originalPrice = product.currentVariant?.originalPrice || product.originalPrice

  return (
    <div className="group rounded-lg border border-grayscale-20 bg-white p-4 transition-shadow hover:shadow-md">
      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative mb-4 aspect-square overflow-hidden rounded-lg">
          <Image
            src={product.images[0]?.url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
          {originalPrice && price < originalPrice && (
            <div className="absolute left-2 top-2 rounded bg-error-5 px-2 py-1 text-xs font-bold text-white">
              -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-2">
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-warning-5 text-warning-5" />
          <span className="text-xs font-medium text-grayscale-90">{product.rating}</span>
          <span className="text-xs text-grayscale-50">({product.reviewCount})</span>
        </div>

        {/* Title */}
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-grayscale-90 group-hover:text-primary-40">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-base font-bold text-primary-5">{price?.toLocaleString()}đ</span>
          <span className="text-xs text-grayscale-50">
            /{product.currentVariant?.name || product.unit || "Hộp"}
          </span>
        </div>
        {originalPrice && price < originalPrice && (
          <div className="text-xs text-grayscale-40 line-through">
            {originalPrice.toLocaleString()}đ
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className="mt-2 w-full bg-primary-5 text-white hover:bg-primary-20"
          size="sm"
        >
          <ShoppingCart className="mr-1 h-4 w-4" />
          Thêm vào giỏ
        </Button>
      </div>
    </div>
  )
}
