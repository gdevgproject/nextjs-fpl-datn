"use client"

import type React from "react"
import { createContext, useContext, useState, useMemo } from "react"
import { useWishlist } from "../hooks/use-wishlist"
import type { WishlistItem, WishlistFilter } from "../hooks/use-wishlist"

type WishlistContextType = {
  wishlistItems: WishlistItem[]
  isLoading: boolean
  isInWishlist: (productId: number) => boolean
  addToWishlist: (productId: number) => void
  removeFromWishlist: (productId: number) => void
  toggleWishlist: (productId: number) => void
  filter: WishlistFilter
  setFilter: (filter: WishlistFilter) => void
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  isLoading: false,
  isInWishlist: () => false,
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  toggleWishlist: () => {},
  filter: {},
  setFilter: () => {},
})

export const useWishlistContext = () => useContext(WishlistContext)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilter] = useState<WishlistFilter>({})
  const wishlist = useWishlist(filter)

  const value = useMemo(
    () => ({
      ...wishlist,
      filter,
      setFilter,
    }),
    [wishlist, filter],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

