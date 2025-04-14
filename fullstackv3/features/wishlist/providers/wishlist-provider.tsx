"use client"

import type React from "react"
import type { WishlistContextType, WishlistFilter } from "../types"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/providers/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  isInWishlist: () => false,
  toggleWishlist: async () => {},
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
})

export const useWishlistContext = () => useContext(WishlistContext)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [wishlistItems, setWishlistItems] = useState<number[]>([])
  const [localWishlist, setLocalWishlist] = useState<number[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<WishlistFilter>({})

  const supabase = getSupabaseBrowserClient()

  // Load wishlist items from database when user is authenticated
  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (!isAuthenticated || !user) return

      try {
        const { data, error } = await supabase.from("wishlists").select("product_id").eq("user_id", user.id)

        if (error) throw error

        setWishlistItems(data.map((item) => item.product_id))
      } catch (error) {
        console.error("Error fetching wishlist items:", error)
      }
    }

    fetchWishlistItems()
  }, [isAuthenticated, user, supabase])

  // Load local wishlist from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedWishlist = localStorage.getItem("mybeauty_wishlist")
        if (savedWishlist) {
          setLocalWishlist(JSON.parse(savedWishlist))
        }
      } catch (error) {
        console.error("Error parsing local wishlist:", error)
        localStorage.removeItem("mybeauty_wishlist")
      }
      setIsInitialized(true)
    }
  }, [])

  // Save local wishlist to localStorage when it changes
  useEffect(() => {
    if (isInitialized && !isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("mybeauty_wishlist", JSON.stringify(localWishlist))
    }
  }, [localWishlist, isInitialized, isAuthenticated])

  // Merge local wishlist with database when user logs in
  useEffect(() => {
    const mergeWishlists = async () => {
      if (isAuthenticated && user && localWishlist.length > 0) {
        try {
          // Add each local wishlist item to the database
          for (const productId of localWishlist) {
            await supabase.from("wishlists").upsert(
              {
                user_id: user.id,
                product_id: productId,
              },
              {
                onConflict: "user_id, product_id",
                ignoreDuplicates: true,
              },
            )
          }

          // Clear local wishlist
          setLocalWishlist([])
          localStorage.removeItem("mybeauty_wishlist")

          // Refresh wishlist items
          const { data, error } = await supabase.from("wishlists").select("product_id").eq("user_id", user.id)

          if (error) throw error

          setWishlistItems(data.map((item) => item.product_id))

          toast({
            title: "Đồng bộ thành công",
            description: "Danh sách yêu thích của bạn đã được đồng bộ.",
          })
        } catch (error) {
          console.error("Error merging wishlists:", error)
        }
      }
    }

    mergeWishlists()
  }, [isAuthenticated, user, localWishlist, supabase, toast])

  // Check if a product is in the wishlist
  const isInWishlist = useCallback(
    (productId: number) => {
      if (isAuthenticated) {
        return wishlistItems.includes(productId)
      } else {
        return localWishlist.includes(productId)
      }
    },
    [isAuthenticated, wishlistItems, localWishlist],
  )

  // Add a product to the wishlist
  const addToWishlist = useCallback(
    async (productId: number) => {
      if (isAuthenticated && user) {
        try {
          const { error } = await supabase.from("wishlists").insert({
            user_id: user.id,
            product_id: productId,
          })

          if (error) throw error

          setWishlistItems((prev) => [...prev, productId])

          toast({
            title: "Đã thêm vào danh sách yêu thích",
            description: "Sản phẩm đã được thêm vào danh sách yêu thích của bạn.",
          })
        } catch (error) {
          console.error("Error adding to wishlist:", error)
          throw error
        }
      } else {
        // Add to local wishlist
        if (!localWishlist.includes(productId)) {
          setLocalWishlist((prev) => [...prev, productId])

          toast({
            title: "Đã thêm vào danh sách yêu thích",
            description: "Sản phẩm đã được thêm vào danh sách yêu thích của bạn.",
          })
        }
      }
    },
    [isAuthenticated, user, supabase, localWishlist, toast],
  )

  // Remove a product from the wishlist
  const removeFromWishlist = useCallback(
    async (productId: number) => {
      if (isAuthenticated && user) {
        try {
          const { error } = await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId)

          if (error) throw error

          setWishlistItems((prev) => prev.filter((id) => id !== productId))

          toast({
            title: "Đã xóa khỏi danh sách yêu thích",
            description: "Sản phẩm đã được xóa khỏi danh sách yêu thích của bạn.",
          })
        } catch (error) {
          console.error("Error removing from wishlist:", error)
          throw error
        }
      } else {
        // Remove from local wishlist
        setLocalWishlist((prev) => prev.filter((id) => id !== productId))

        toast({
          title: "Đã xóa khỏi danh sách yêu thích",
          description: "Sản phẩm đã được xóa khỏi danh sách yêu thích của bạn.",
        })
      }
    },
    [isAuthenticated, user, supabase, toast],
  )

  // Toggle a product in the wishlist
  const toggleWishlist = useCallback(
    async (productId: number) => {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId)
      } else {
        await addToWishlist(productId)
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist],
  )

  const value: WishlistContextType = {
    wishlistItems: isAuthenticated ? wishlistItems : localWishlist,
    isInWishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    isLoading,
    filter,
    setFilter,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

