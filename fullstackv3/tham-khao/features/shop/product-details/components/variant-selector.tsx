"use client"

import { cn } from "@/shared/lib/utils"

interface Variant {
  id: number
  volume_ml: number
  price: number
  sale_price: number | null
  stock_quantity: number
}

interface VariantSelectorProps {
  variants: Variant[]
  selectedVariant: Variant | null
  onSelectVariant: (variant: Variant) => void
}

export default function VariantSelector({ variants, selectedVariant, onSelectVariant }: VariantSelectorProps) {
  // Sort variants by volume
  const sortedVariants = [...variants].sort((a, b) => a.volume_ml - b.volume_ml)

  return (
    <div className="flex flex-wrap gap-2">
      {sortedVariants.map((variant) => {
        const isSelected = selectedVariant?.id === variant.id
        const isOutOfStock = variant.stock_quantity <= 0

        return (
          <button
            key={variant.id}
            type="button"
            className={cn(
              "flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium",
              isSelected && !isOutOfStock && "border-primary bg-primary/10",
              isOutOfStock && "cursor-not-allowed opacity-50",
              !isSelected && !isOutOfStock && "border-input bg-background hover:bg-accent hover:text-accent-foreground",
            )}
            disabled={isOutOfStock}
            onClick={() => onSelectVariant(variant)}
          >
            {variant.volume_ml} ml
            {isOutOfStock && " (Hết hàng)"}
          </button>
        )
      })}
    </div>
  )
}
