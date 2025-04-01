"use client"

import { AddToWishlistButton } from "@/components/san-pham/add-to-wishlist-button"
import { useAuth } from "@/lib/hooks/use-auth"

interface ProductInfoWishlistProps {
  productId: number
  productName: string
}

export function ProductInfoWishlist({ productId, productName }: ProductInfoWishlistProps) {
  const { user } = useAuth()

  if (!user) return null

  return (
    <AddToWishlistButton productId={productId} productName={productName} variant="outline" size="default" showText />
  )
}

