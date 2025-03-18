"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useCart } from "@/features/cart/hooks/useCart"
import { cn } from "@/lib/utils"

export interface ProductUnit {
  label: string
  value: string
}

export interface ProductCardProps {
  product: {
    id: number | string
    slug: string
    image?: string
    name: string
    price: string | number
    originalPrice?: string | number
    unit?: string
    packageInfo?: string
    discount?: string | number
    units?: ProductUnit[]
  }
  variant?: "default" | "simple"
  className?: string
}

export default function ProductCard({ product, variant = "default", className }: ProductCardProps) {
  const { addItem } = useCart()
  const [selectedUnit, setSelectedUnit] = useState(product.units?.[0]?.value || "hop")

  const handleAddToCart = () => {
    if (!product) return

    const priceAsNumber =
      typeof product.price === "string" ? Number.parseFloat(product.price.replace(/[^\d]/g, "")) : product.price

    const originalPriceAsNumber = product.originalPrice
      ? typeof product.originalPrice === "string"
        ? Number.parseFloat(product.originalPrice.replace(/[^\d]/g, ""))
        : product.originalPrice
      : undefined

    addItem({
      id: `${product.id}-${selectedUnit}`,
      name: product.name,
      price: priceAsNumber || 0,
      originalPrice: originalPriceAsNumber,
      quantity: 1,
      unit: product.unit || "Hộp",
      image: product.image,
    })
  }

  if (!product) return null

  const formatPrice = (price: string | number | undefined) => {
    if (price === undefined) return "0đ"

    if (typeof price === "number") {
      return `${price.toLocaleString()}đ`
    }

    if (typeof price === "string" && price.includes("đ")) return price

    const numericPrice = typeof price === "string" ? Number.parseFloat(price.replace(/[^\d]/g, "")) : price
    return isNaN(numericPrice) ? "0đ" : `${numericPrice.toLocaleString()}đ`
  }

  const discountText = product.discount
    ? typeof product.discount === "string" && product.discount.includes("%")
      ? product.discount
      : `-${product.discount}%`
    : undefined

  return (
    <div
      className={cn(
        "relative rounded-xl border border-grayscale-20 bg-white p-3 sm:p-4 shadow-sm h-full flex flex-col",
        className,
      )}
    >
      {/* Discount Badge */}
      {discountText && (
        <span className="absolute top-0 left-0 z-10">
          <div className="bg-gradient-5 text-white text-xs font-medium px-2 py-1 rounded-tl-xl rounded-br-xl">
            {discountText}
          </div>
        </span>
      )}

      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="block mb-3 hover:no-underline">
        <div className="relative mb-1 aspect-square">
          <Image
            fill
            alt={product.name}
            className="object-contain"
            src={product.image || "/placeholder.svg?height=200&width=200"}
          />
        </div>

        {/* Product Name */}
        <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-grayscale-90">{product.name}</h3>
      </Link>

      {/* Unit Selection */}
      {product.units && product.units.length > 0 && (
        <div className="mb-3">
          <div className="flex w-full rounded-lg border border-grayscale-20 overflow-hidden">
            {product.units.map((unit) => (
              <button
                key={unit.value}
                className={`flex-1 py-1 text-xs sm:text-sm ${
                  selectedUnit === unit.value
                    ? "bg-primary text-white"
                    : "bg-white text-grayscale-60 hover:bg-grayscale-5"
                }`}
                onClick={() => setSelectedUnit(unit.value)}
              >
                {unit.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-primary">{formatPrice(product.price)}</span>
          {product.unit && <span className="text-xs sm:text-sm text-grayscale-50">/ {product.unit}</span>}
        </div>
        {product.originalPrice && (
          <span className="text-xs sm:text-sm text-grayscale-40 line-through">
            {formatPrice(product.originalPrice)}
          </span>
        )}
      </div>

      {/* Package Info */}
      {product.packageInfo && <p className="mb-3 text-[10px] sm:text-xs text-grayscale-50">{product.packageInfo}</p>}

      {/* Buy Button */}
      {variant === "default" ? (
        <button
          onClick={handleAddToCart}
          className="mt-auto w-full rounded-full bg-primary hover:bg-primary-60 text-white py-2 px-4 text-center text-sm sm:text-base font-medium transition-colors"
        >
          Thêm vào giỏ
        </button>
      ) : (
        <Link
          href={`/product/${product.slug}`}
          className="mt-auto w-full rounded-full bg-primary hover:bg-primary-60 text-white py-2 px-4 text-center text-sm sm:text-base font-medium transition-colors no-underline"
        >
          Chọn Mua
        </Link>
      )}
    </div>
  )
}

