"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function ProductCardSimple({ product }) {
  const [selectedUnit, setSelectedUnit] = useState(product.units[0].value)

  return (
    <div className="relative rounded-xl border border-grayscale-20 bg-white p-3 sm:p-4 shadow-sm h-full flex flex-col">
      {/* Discount Badge */}
      {product.discount && (
        <span className="absolute top-0 left-0 z-10">
          <div className="bg-gradient-5 text-white text-xs font-medium px-2 py-1 rounded-tl-xl rounded-br-xl">
            {product.discount}
          </div>
        </span>
      )}

      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="block mb-3 hover:no-underline">
        <div className="relative mb-1 aspect-square">
          <Image fill alt={product.name} className="object-contain" src={product.image || "/placeholder.svg"} />
        </div>

        {/* Product Name */}
        <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-grayscale-90">{product.name}</h3>
      </Link>

      {/* Unit Selection */}
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

      {/* Price */}
      <div className="mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-primary">{product.price}</span>
          <span className="text-xs sm:text-sm text-grayscale-50">/ {product.unit}</span>
        </div>
        {product.originalPrice && (
          <span className="text-xs sm:text-sm text-grayscale-40 line-through">{product.originalPrice}</span>
        )}
      </div>

      {/* Package Info */}
      <p className="mb-3 text-[10px] sm:text-xs text-grayscale-50">{product.packageInfo}</p>

      {/* Buy Button */}
      <Link
        href={`/product/${product.slug}`}
        className="mt-auto w-full rounded-full bg-primary hover:bg-primary-60 text-white py-2 px-4 text-center text-sm sm:text-base font-medium transition-colors no-underline"
      >
        Chọn Mua
      </Link>
    </div>
  )
}

