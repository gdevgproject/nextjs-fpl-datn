"use client"

import { AddToWishlistButton } from "@/components/san-pham/add-to-wishlist-button"
import { useAuth } from "@/lib/hooks/use-auth"

interface ProductCardWishlistProps {
  productId: number
  productName: string
  className?: string
}

export function ProductCardWishlist({ productId, productName, className }: ProductCardWishlistProps) {
  const { user } = useAuth()

  if (!user) return null

  return (
    <AddToWishlistButton
      productId={productId}
      productName={productName}
      variant="ghost"
      size="icon"
      className={className}
      withFeedback={false}
    />
  )
}

