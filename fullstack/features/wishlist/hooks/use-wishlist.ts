"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/providers/auth-context"
import { useToast } from "@/hooks/use-toast"
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config"
import { handleApiError } from "@/lib/utils/error-utils"

// Định nghĩa kiểu dữ liệu cho wishlist item
export interface WishlistItem {
  id: string
  product_id: number
  added_at: string
  product: {
    id: number
    name: string
    slug: string
    price: number
    sale_price: number | null
    images: any[]
  }
}

export function useWishlist() {
  const { user, isAuthenticated } = useAuth()
  const supabase = getSupabaseBrowserClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [localWishlist, setLocalWishlist] = useState<number[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch wishlist từ database nếu user đã đăng nhập
  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      if (!user) return []

      try {
        const { data, error } = await supabase
          .from("wishlists")
          .select(`
            id,
            product_id,
            added_at,
            products:products (
              id,
              name,
              slug,
              price,
              sale_price,
              images:product_images(*)
            )
          `)
          .eq("user_id", user.id)

        if (error) throw error

        return data as WishlistItem[]
      } catch (error) {
        console.error("Error fetching wishlist:", error)
        throw new Error(handleApiError(error))
      }
    },
    enabled: !!user,
    staleTime: QUERY_STALE_TIME.USER,
  })

  // Load local wishlist từ localStorage khi component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWishlist = localStorage.getItem("mybeauty_wishlist")
      if (savedWishlist) {
        try {
          setLocalWishlist(JSON.parse(savedWishlist))
        } catch (error) {
          console.error("Error parsing local wishlist:", error)
          localStorage.removeItem("mybeauty_wishlist")
        }
      }
    }
    setIsInitialized(true)
  }, [])

  // Lưu local wishlist vào localStorage khi thay đổi
  useEffect(() => {
    if (isInitialized && !isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("mybeauty_wishlist", JSON.stringify(localWishlist))
    }
  }, [localWishlist, isInitialized, isAuthenticated])

  // Merge local wishlist với user wishlist khi đăng nhập
  useEffect(() => {
    const mergeLocalWishlistWithUserWishlist = async () => {
      if (isAuthenticated && user && localWishlist.length > 0) {
        try {
          // Thêm các item từ local wishlist vào user wishlist
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

          // Clear local wishlist sau khi merge
          setLocalWishlist([])
          localStorage.removeItem("mybeauty_wishlist")

          // Invalidate wishlist query để fetch lại wishlist items
          queryClient.invalidateQueries({ queryKey: ["wishlist", user.id] })

          toast({
            title: "Danh sách yêu thích đã được đồng bộ",
            description: "Các sản phẩm yêu thích của bạn đã được lưu vào tài khoản.",
          })
        } catch (error) {
          console.error("Error merging wishlists:", error)
          toast({
            title: "Lỗi đồng bộ danh sách yêu thích",
            description: handleApiError(error),
            variant: "destructive",
          })
        }
      }
    }

    mergeLocalWishlistWithUserWishlist()
  }, [isAuthenticated, user, localWishlist, supabase, queryClient, toast])

  // Kiểm tra sản phẩm có trong wishlist không
  const isInWishlist = (productId: number): boolean => {
    if (isAuthenticated) {
      return !!wishlistItems?.some((item) => item.product_id === productId)
    } else {
      return localWishlist.includes(productId)
    }
  }

  // Thêm sản phẩm vào wishlist
  const addToWishlist = useMutation({
    mutationFn: async (productId: number) => {
      if (isAuthenticated && user) {
        try {
          const { error } = await supabase.from("wishlists").insert({
            user_id: user.id,
            product_id: productId,
          })

          if (error) throw error

          return { success: true }
        } catch (error) {
          console.error("Error adding to wishlist:", error)
          throw new Error(handleApiError(error))
        }
      } else {
        // Xử lý local wishlist
        if (!localWishlist.includes(productId)) {
          setLocalWishlist([...localWishlist, productId])
        }

        return { success: true }
      }
    },
    onSuccess: () => {
      if (isAuthenticated && user) {
        queryClient.invalidateQueries({ queryKey: ["wishlist", user.id] })
      }

      toast({
        title: "Đã thêm vào danh sách yêu thích",
        description: "Sản phẩm đã được thêm vào danh sách yêu thích của bạn.",
      })
    },
    onError: (error) => {
      console.error("Error adding to wishlist:", error)
      toast({
        title: "Thêm vào danh sách yêu thích thất bại",
        description:
          error instanceof Error ? error.message : "Đã xảy ra lỗi khi thêm sản phẩm vào danh sách yêu thích.",
        variant: "destructive",
      })
    },
  })

  // Xóa sản phẩm khỏi wishlist
  const removeFromWishlist = useMutation({
    mutationFn: async (productId: number) => {
      if (isAuthenticated && user) {
        try {
          const { error } = await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId)

          if (error) throw error

          return { success: true }
        } catch (error) {
          console.error("Error removing from wishlist:", error)
          throw new Error(handleApiError(error))
        }
      } else {
        // Xử lý local wishlist
        setLocalWishlist(localWishlist.filter((id) => id !== productId))

        return { success: true }
      }
    },
    onSuccess: () => {
      if (isAuthenticated && user) {
        queryClient.invalidateQueries({ queryKey: ["wishlist", user.id] })
      }

      toast({
        title: "Đã xóa khỏi danh sách yêu thích",
        description: "Sản phẩm đã được xóa khỏi danh sách yêu thích của bạn.",
      })
    },
    onError: (error) => {
      console.error("Error removing from wishlist:", error)
      toast({
        title: "Xóa khỏi danh sách yêu thích thất bại",
        description:
          error instanceof Error ? error.message : "Đã xảy ra lỗi khi xóa sản phẩm khỏi danh sách yêu thích.",
        variant: "destructive",
      })
    },
  })

  // Toggle wishlist
  const toggleWishlist = (productId: number) => {
    if (isInWishlist(productId)) {
      removeFromWishlist.mutate(productId)
    } else {
      addToWishlist.mutate(productId)
    }
  }

  return {
    wishlistItems: wishlistItems || [],
    isLoading,
    isInWishlist,
    addToWishlist: (productId: number) => addToWishlist.mutate(productId),
    removeFromWishlist: (productId: number) => removeFromWishlist.mutate(productId),
    toggleWishlist,
  }
}

