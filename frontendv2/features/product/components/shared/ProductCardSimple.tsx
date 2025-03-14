"use client"

import Image from "next/image"
import { useState } from "react"
import { useCart } from "@/features/cart/hooks/useCart"

interface ProductUnit {
  label: string
  value: string
}

interface ProductCardSimpleProps {
  product: {
    id: number | string
    image?: string
    name: string
    price: string | number
    originalPrice?: string | number
    unit?: string
    packageInfo?: string
    discount?: string | number
    units?: ProductUnit[]
  }
}

export default function ProductCardSimple({ product }: ProductCardSimpleProps) {
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

    if (price.includes("đ")) return price

    const numericPrice = Number.parseFloat(price.replace(/[^\d]/g, ""))
    return isNaN(numericPrice) ? "0đ" : `${numericPrice.toLocaleString()}đ`
  }

  const discountText = product.discount
    ? typeof product.discount === "string" && product.discount.includes("%")
      ? product.discount
      : `-${product.discount}%`
    : undefined

  return (
    // Thay đổi từ li thành div để tránh list-style mặc định
    <div className="rounded-lg border border-gray-100 bg-white p-2 shadow-sm">
      {/* Product Image */}
      <figure className="relative mb-3 aspect-square overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg?height=200&width=200"}
          alt={product.name}
          fill
          className="object-contain"
        />
        {discountText && (
          <span className="absolute left-2 top-2 rounded bg-error-5 px-1.5 py-0.5 text-xs font-bold text-white">
            {discountText}
          </span>
        )}
      </figure>

      {/* Product Info */}
      <h3 className="mb-2 min-h-[2.5rem] text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>

      {/* Unit Selection */}
      {product.units && product.units.length > 0 && (
        <div
          className="mb-2 flex w-full gap-1 rounded-md bg-gray-50 p-1"
          role="radiogroup"
          aria-label="Đơn vị sản phẩm"
        >
          {product.units.map((unit) => (
            <button
              key={unit.value}
              onClick={() => setSelectedUnit(unit.value)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                selectedUnit === unit.value ? "border border-primary text-primary" : "text-gray-600 hover:bg-gray-100"
              }`}
              role="radio"
              aria-checked={selectedUnit === unit.value}
            >
              {unit.label}
            </button>
          ))}
        </div>
      )}

      {/* Price */}
      <div className="mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-base font-semibold text-primary">{formatPrice(product.price)}</span>
          {product.unit && <span className="text-xs text-gray-500">/ {product.unit}</span>}
        </div>
        {product.originalPrice && (
          <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
        )}
      </div>

      {/* Package Info */}
      {product.packageInfo && (
        <div className="mb-3 rounded-md bg-gray-50 px-2 py-1">
          <p className="text-xs text-gray-600">{product.packageInfo}</p>
        </div>
      )}

      {/* Buy Button */}
      <button
        onClick={handleAddToCart}
        className="w-full rounded-full border border-primary bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        Chọn Mua
      </button>
    </div>
  )
}

