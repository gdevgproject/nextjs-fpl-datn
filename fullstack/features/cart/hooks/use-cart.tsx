"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/providers/auth-context"
import { useToast } from "@/hooks/use-toast"
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config"
import { handleApiError } from "@/lib/utils/error-utils"

// Định nghĩa kiểu dữ liệu cho cart item
export interface CartItem {
  id: string
  variant_id: number
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    sale_price: number | null
    volume_ml: number
    images: any[]
  }
}

// Định nghĩa kiểu dữ liệu cho local cart
export type LocalCartItem = {
  variant_id: number
  quantity: number
  product_id: string
}

export function useCart() {
  const { user, isAuthenticated } = useAuth()
  const supabase = getSupabaseBrowserClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [localCart, setLocalCart] = useState<LocalCartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch cart từ database nếu user đã đăng nhập
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return []

      try {
        // Lấy cart_id của user
        const { data: cartData, error: cartError } = await supabase
          .from("shopping_carts")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (cartError || !cartData) {
          // Nếu không tìm thấy cart, có thể tạo mới
          if (cartError.code === "PGRST116") {
            const { data: newCart, error: createError } = await supabase
              .from("shopping_carts")
              .insert({ user_id: user.id })
              .select("id")
              .single()

            if (createError) throw createError
            return []
          }
          throw cartError
        }

        // Lấy cart items
        const { data, error } = await supabase
          .from("cart_items")
          .select(`
            id,
            variant_id,
            quantity,
            product_variants!inner (
              product_id,
              volume_ml,
              price,
              sale_price,
              products!inner (
                id,
                name,
                slug,
                images:product_images(*)
              )
            )
          `)
          .eq("cart_id", cartData.id)

        if (error) throw error

        if (!data) return []

        // Transform data để phù hợp với CartItem type
        return data.map((item) => ({
          id: item.id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          product: {
            id: item.product_variants.products.id,
            name: item.product_variants.products.name,
            slug: item.product_variants.products.slug,
            price: item.product_variants.price,
            sale_price: item.product_variants.sale_price,
            volume_ml: item.product_variants.volume_ml,
            images: item.product_variants.products.images,
          },
        })) as CartItem[]
      } catch (error) {
        console.error("Error fetching cart:", error)
        throw new Error(handleApiError(error))
      }
    },
    enabled: !!user,
    staleTime: QUERY_STALE_TIME.CART,
  })

  // Load local cart từ localStorage khi component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("mybeauty_cart")
        if (savedCart) {
          setLocalCart(JSON.parse(savedCart))
        }
      } catch (error) {
        console.error("Error parsing local cart:", error)
        localStorage.removeItem("mybeauty_cart")
      }
      setIsInitialized(true)
    }
  }, [])

  // Lưu local cart vào localStorage khi thay đổi
  useEffect(() => {
    if (isInitialized && !isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("mybeauty_cart", JSON.stringify(localCart))
    }
  }, [localCart, isInitialized, isAuthenticated])

  // Merge local cart với user cart khi đăng nhập
  useEffect(() => {
    const mergeLocalCartWithUserCart = async () => {
      if (isAuthenticated && user && localCart.length > 0) {
        try {
          // Lấy cart_id của user
          const { data: cartData, error: cartError } = await supabase
            .from("shopping_carts")
            .select("id")
            .eq("user_id", user.id)
            .single()

          if (cartError) {
            // Nếu không tìm thấy cart, tạo mới
            if (cartError.code === "PGRST116") {
              const { data: newCart, error: createError } = await supabase
                .from("shopping_carts")
                .insert({ user_id: user.id })
                .select("id")
                .single()

              if (createError) throw createError

              // Sử dụng newCart.id
              await mergeItems(newCart.id)
              return
            }
            throw cartError
          }

          await mergeItems(cartData.id)
        } catch (error) {
          console.error("Error merging carts:", error)
          toast({
            title: "Lỗi đồng bộ giỏ hàng",
            description: handleApiError(error),
            variant: "destructive",
          })
        }
      }
    }

    // Hàm helper để merge items
    const mergeItems = async (cartId: number) => {
      // Thêm các item từ local cart vào user cart
      for (const item of localCart) {
        await supabase.from("cart_items").upsert(
          {
            cart_id: cartId,
            variant_id: item.variant_id,
            quantity: item.quantity,
          },
          {
            onConflict: "cart_id, variant_id",
            ignoreDuplicates: false,
          },
        )
      }

      // Clear local cart sau khi merge
      setLocalCart([])
      localStorage.removeItem("mybeauty_cart")

      // Invalidate cart query để fetch lại cart items
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] })

      toast({
        title: "Giỏ hàng đã được đồng bộ",
        description: "Các sản phẩm trong giỏ hàng của bạn đã được lưu vào tài khoản.",
      })
    }

    mergeLocalCartWithUserCart()
  }, [isAuthenticated, user, localCart, supabase, queryClient, toast])

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = useMutation({
    mutationFn: async ({
      variantId,
      quantity,
      productId,
    }: { variantId: number; quantity: number; productId: string }) => {
      if (isAuthenticated && user) {
        try {
          // Lấy cart_id của user
          const { data: cartData, error: cartError } = await supabase
            .from("shopping_carts")
            .select("id")
            .eq("user_id", user.id)
            .single()

          if (cartError) {
            // Nếu không tìm thấy cart, tạo mới
            if (cartError.code === "PGRST116") {
              const { data: newCart, error: createError } = await supabase
                .from("shopping_carts")
                .insert({ user_id: user.id })
                .select("id")
                .single()

              if (createError) throw createError

              // Sử dụng newCart.id để thêm item
              await addItemToCart(newCart.id, variantId, quantity)
              return { success: true }
            }
            throw cartError
          }

          await addItemToCart(cartData.id, variantId, quantity)
          return { success: true }
        } catch (error) {
          console.error("Error adding to cart:", error)
          throw new Error(handleApiError(error))
        }
      } else {
        // Xử lý local cart
        const existingItemIndex = localCart.findIndex((item) => item.variant_id === variantId)

        if (existingItemIndex !== -1) {
          // Cập nhật số lượng
          const updatedCart = [...localCart]
          updatedCart[existingItemIndex].quantity += quantity
          setLocalCart(updatedCart)
        } else {
          // Thêm mới
          setLocalCart([...localCart, { variant_id: variantId, quantity, product_id: productId }])
        }

        return { success: true }
      }
    },
    onSuccess: () => {
      if (isAuthenticated && user) {
        queryClient.invalidateQueries({ queryKey: ["cart", user.id] })
      }

      toast({
        title: "Đã thêm vào giỏ hàng",
        description: "Sản phẩm đã được thêm vào giỏ hàng của bạn.",
      })
    },
    onError: (error) => {
      console.error("Error adding to cart:", error)
      toast({
        title: "Thêm vào giỏ hàng thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng.",
        variant: "destructive",
      })
    },
  })

  // Helper function để thêm item vào cart
  const addItemToCart = useCallback(
    async (cartId: number, variantId: number, quantity: number) => {
      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("variant_id", variantId)
        .single()

      if (checkError && checkError.code !== "PGRST116") throw checkError

      if (existingItem) {
        // Cập nhật số lượng
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        // Thêm mới
        const { error } = await supabase.from("cart_items").insert({
          cart_id: cartId,
          variant_id: variantId,
          quantity,
        })

        if (error) throw error
      }
    },
    [supabase],
  )

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateCartItem = useMutation({
    mutationFn: async ({ itemId, quantity, variantId }: { itemId?: string; quantity: number; variantId?: number }) => {
      if (isAuthenticated && user) {
        if (!itemId) throw new Error("Item ID is required")

        try {
          const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", itemId)

          if (error) throw error

          return { success: true }
        } catch (error) {
          console.error("Error updating cart item:", error)
          throw new Error(handleApiError(error))
        }
      } else {
        if (!variantId) throw new Error("Variant ID is required")

        // Cập nhật local cart
        const updatedCart = localCart.map((item) => (item.variant_id === variantId ? { ...item, quantity } : item))
        setLocalCart(updatedCart)

        return { success: true }
      }
    },
    onSuccess: () => {
      if (isAuthenticated && user) {
        queryClient.invalidateQueries({ queryKey: ["cart", user.id] })
      }
    },
    onError: (error) => {
      console.error("Error updating cart item:", error)
      toast({
        title: "Cập nhật giỏ hàng thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật sản phẩm trong giỏ hàng.",
        variant: "destructive",
      })
    },
  })

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = useMutation({
    mutationFn: async ({ itemId, variantId }: { itemId?: string; variantId?: number }) => {
      if (isAuthenticated && user) {
        if (!itemId) throw new Error("Item ID is required")

        try {
          const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

          if (error) throw error

          return { success: true }
        } catch (error) {
          console.error("Error removing from cart:", error)
          throw new Error(handleApiError(error))
        }
      } else {
        if (!variantId) throw new Error("Variant ID is required")

        // Xóa khỏi local cart
        const updatedCart = localCart.filter((item) => item.variant_id !== variantId)
        setLocalCart(updatedCart)

        return { success: true }
      }
    },
    onSuccess: () => {
      if (isAuthenticated && user) {
        queryClient.invalidateQueries({ queryKey: ["cart", user.id] })
      }

      toast({
        title: "Đã xóa khỏi giỏ hàng",
        description: "Sản phẩm đã được xóa khỏi giỏ hàng của bạn.",
      })
    },
    onError: (error) => {
      console.error("Error removing from cart:", error)
      toast({
        title: "Xóa khỏi giỏ hàng thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi xóa sản phẩm khỏi giỏ hàng.",
        variant: "destructive",
      })
    },
  })

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const cartItemCount = isAuthenticated
    ? cartItems?.reduce((total, item) => total + item.quantity, 0) || 0
    : localCart.reduce((total, item) => total + item.quantity, 0)

  // Tính tổng tiền giỏ hàng (sẽ cần fetch thêm thông tin sản phẩm cho local cart)
  const cartTotal = isAuthenticated
    ? cartItems?.reduce((total, item) => total + (item.product.sale_price || item.product.price) * item.quantity, 0) ||
      0
    : 0 // Cần fetch thêm thông tin sản phẩm để tính tổng tiền cho local cart

  return {
    cartItems: isAuthenticated ? cartItems || [] : [], // Cần fetch thông tin sản phẩm cho local cart
    localCart,
    isLoading,
    cartItemCount,
    cartTotal,
    addToCart: (variantId: number, quantity: number, productId: string) =>
      addToCart.mutate({ variantId, quantity, productId }),
    updateCartItem: (params: { itemId?: string; quantity: number; variantId?: number }) =>
      updateCartItem.mutate(params),
    removeFromCart: (params: { itemId?: string; variantId?: number }) => removeFromCart.mutate(params),
  }
}

