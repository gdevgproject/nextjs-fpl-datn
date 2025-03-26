"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { formatCurrency } from "@/utils/format"
import { Button } from "@/components/ui/button"
import { useCart } from "@/features/cart/hooks/useCart"
import type { CartItem as CartItemType } from "@/features/cart/types"

export function CartDropdown() {
  const { items, removeFromCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-grayscale-40">Giỏ hàng trống</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg divide-y divide-grayscale-20">
      <div className="p-4">
        <h3 className="text-base font-semibold text-grayscale-90 text-center">Giỏ hàng</h3>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {items.map((item) => (
          <CartItem key={item.id} item={item} onRemove={() => removeFromCart(item.id)} />
        ))}
      </div>

      <div className="p-4 flex items-center justify-between">
        <p className="text-sm text-grayscale-40">{items.length} sản phẩm</p>
        <Button asChild className="rounded-full bg-primary hover:bg-primary/90 text-white px-6">
          <Link href="/cart">Xem giỏ hàng</Link>
        </Button>
      </div>
    </div>
  )
}

function CartItem({ item, onRemove }: { item: CartItemType; onRemove: () => void }) {
  return (
    <div className="p-4 flex gap-3 hover:bg-grayscale-5">
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image
          src={item.image || "/placeholder.svg?height=64&width=64"}
          alt={item.name}
          fill
          className="object-cover rounded-md"
        />
      </div>

      <div className="flex-1 min-w-0">
        <Link href={`/product/${item.slug}`} className="text-sm text-grayscale-90 line-clamp-2 hover:text-primary">
          {item.name}
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-medium text-primary">{formatCurrency(item.price)}</span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-xs text-grayscale-40 line-through">{formatCurrency(item.originalPrice)}</span>
          )}
          <span className="text-xs text-grayscale-40">
            x{item.quantity} {item.unit}
          </span>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 text-error hover:text-error-60 transition-colors"
        aria-label="Xóa sản phẩm"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

