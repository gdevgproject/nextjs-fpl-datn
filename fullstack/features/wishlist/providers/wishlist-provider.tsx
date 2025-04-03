"use client"

import type React from "react"
import { createContext, useContext, useMemo } from "react"
import { useWishlist } from "../hooks/use-wishlist"
import type { WishlistItem } from "../hooks/use-wishlist"

type WishlistContextType = {
  wishlistItems: WishlistItem[]
  isLoading: boolean
  isInWishlist: (productId: number) => boolean
  addToWishlist: (productId: number) => void
  removeFromWishlist: (productId: number) => void
  toggleWishlist: (productId: number) => void
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  isLoading: false,
  isInWishlist: () => false,
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  toggleWishlist: () => {},
})

export const useWishlistContext = () => useContext(WishlistContext)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const wishlist = useWishlist()

  const value = useMemo(() => wishlist, [wishlist])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

