"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/providers/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type CartItem = {
  id?: string
  variant_id: number
  quantity: number
  product_id?: number
}

type CartContextType = {
  cartItems: CartItem[]
  cartItemCount: number
  addToCart: (variantId: number, quantity: number, productId?: string) => Promise<void>
  updateCartQuantity: (variantId: number, quantity: number) => Promise<void>
  removeFromCart: (variantId: number) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartItemCount: 0,
  addToCart: async () => {},
  updateCartQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
})

export const useCartContext = () => useContext(CartContext)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [localCart, setLocalCart] = useState<CartItem[]>([])
  const [cartId, setCartId] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const supabase = getSupabaseBrowserClient()

  // Calculate cart item count
  const cartItemCount = (isAuthenticated ? cartItems : localCart).reduce((total, item) => total + item.quantity, 0)

  // Add item to cart
  const addToCart = useCallback(
    async (variantId: number, quantity: number, productId?: string) => {
      if (isAuthenticated && cartId) {
        try {
          // Check if item already exists
          const { data: existingItem, error: checkError } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("cart_id", cartId)
            .eq("variant_id", variantId)
            .maybeSingle()

          if (checkError && checkError.code !== "PGRST116") throw checkError

          if (existingItem) {
            // Update quantity
            const { data, error: updateError } = await supabase
              .from("cart_items")
              .update({ quantity: existingItem.quantity + quantity })
              .eq("id", existingItem.id)
              .select()

            if (updateError) throw updateError

            // Update local state
            setCartItems((prev) =>
              prev.map((item) =>
                item.id === existingItem.id ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            )
          } else {
            // Insert new item
            const { data, error: insertError } = await supabase
              .from("cart_items")
              .insert({
                cart_id: cartId,
                variant_id: variantId,
                quantity,
              })
              .select()

            if (insertError) throw insertError

            // Refresh cart items
            const { data: refreshedItems, error: refreshError } = await supabase
              .from("cart_items")
              .select("*")
              .eq("cart_id", cartId)

            if (refreshError) throw refreshError

            setCartItems(refreshedItems)
          }

          toast({
            title: "Đã thêm vào giỏ hàng",
            description: "Sản phẩm đã được thêm vào giỏ hàng của bạn.",
          })
        } catch (error) {
          console.error("Error adding to cart:", error)
          throw error
        }
      } else {
        // Add to local cart
        const existingItemIndex = localCart.findIndex((item) => item.variant_id === variantId)

        if (existingItemIndex !== -1) {
          // Update quantity
          const updatedCart = [...localCart]
          updatedCart[existingItemIndex].quantity += quantity
          setLocalCart(updatedCart)
        } else {
          // Add new item
          setLocalCart([
            ...localCart,
            {
              variant_id: variantId,
              quantity,
              product_id: productId ? Number.parseInt(productId) : undefined,
            },
          ])
        }

        toast({
          title: "Đã thêm vào giỏ hàng",
          description: "Sản phẩm đã được thêm vào giỏ hàng của bạn.",
        })
      }
    },
    [isAuthenticated, cartId, supabase, localCart, toast],
  )

  // Remove item from cart - Định nghĩa trước updateCartQuantity để tránh lỗi
  const removeFromCart = useCallback(
    async (variantId: number) => {
      if (isAuthenticated && cartId) {
        try {
          // Find the item
          const { data: existingItem, error: findError } = await supabase
            .from("cart_items")
            .select("id")
            .eq("cart_id", cartId)
            .eq("variant_id", variantId)
            .single()

          if (findError) throw findError

          // Delete the item
          const { error: deleteError } = await supabase.from("cart_items").delete().eq("id", existingItem.id)

          if (deleteError) throw deleteError

          // Update local state
          setCartItems((prev) => prev.filter((item) => item.id !== existingItem.id))

          toast({
            title: "Đã xóa khỏi giỏ hàng",
            description: "Sản phẩm đã được xóa khỏi giỏ hàng của bạn.",
          })
        } catch (error) {
          console.error("Error removing from cart:", error)
          throw error
        }
      } else {
        // Remove from local cart
        setLocalCart((prev) => prev.filter((item) => item.variant_id !== variantId))

        toast({
          title: "Đã xóa khỏi giỏ hàng",
          description: "Sản phẩm đã được xóa khỏi giỏ hàng của bạn.",
        })
      }
    },
    [isAuthenticated, cartId, supabase, toast],
  )

  // Update item quantity - Định nghĩa sau removeFromCart để tránh lỗi circular reference
  const updateCartQuantity = useCallback(
    async (variantId: number, quantity: number) => {
      if (quantity <= 0) {
        return removeFromCart(variantId)
      }

      if (isAuthenticated && cartId) {
        try {
          // Find the item
          const { data: existingItem, error: findError } = await supabase
            .from("cart_items")
            .select("id")
            .eq("cart_id", cartId)
            .eq("variant_id", variantId)
            .single()

          if (findError) throw findError

          // Update quantity
          const { error: updateError } = await supabase
            .from("cart_items")
            .update({ quantity })
            .eq("id", existingItem.id)

          if (updateError) throw updateError

          // Update local state
          setCartItems((prev) => prev.map((item) => (item.id === existingItem.id ? { ...item, quantity } : item)))
        } catch (error) {
          console.error("Error updating cart quantity:", error)
          throw error
        }
      } else {
        // Update local cart
        const existingItemIndex = localCart.findIndex((item) => item.variant_id === variantId)

        if (existingItemIndex !== -1) {
          const updatedCart = [...localCart]
          updatedCart[existingItemIndex].quantity = quantity
          setLocalCart(updatedCart)
        }
      }
    },
    [isAuthenticated, cartId, supabase, localCart, removeFromCart],
  )

  // Clear cart
  const clearCart = useCallback(async () => {
    if (isAuthenticated && cartId) {
      try {
        // Delete all items
        const { error } = await supabase.from("cart_items").delete().eq("cart_id", cartId)

        if (error) throw error

        // Update local state
        setCartItems([])

        toast({
          title: "Đã xóa giỏ hàng",
          description: "Tất cả sản phẩm đã được xóa khỏi giỏ hàng của bạn.",
        })
      } catch (error) {
        console.error("Error clearing cart:", error)
        throw error
      }
    } else {
      // Clear local cart
      setLocalCart([])
      localStorage.removeItem("mybeauty_cart")

      toast({
        title: "Đã xóa giỏ hàng",
        description: "Tất cả sản phẩm đã được xóa khỏi giỏ hàng của bạn.",
      })
    }
  }, [isAuthenticated, cartId, supabase, toast])

  const value = {
    cartItems: isAuthenticated ? cartItems : localCart,
    cartItemCount,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  }

  // Fetch cart and cart items when user is authenticated
  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated || !user) return

      try {
        // Get user's cart
        const { data: cartData, error: cartError } = await supabase
          .from("shopping_carts")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (cartError) {
          if (cartError.code === "PGRST116") {
            // Cart doesn't exist, create one
            const { data: newCart, error: createError } = await supabase
              .from("shopping_carts")
              .insert({ user_id: user.id })
              .select("id")
              .single()

            if (createError) throw createError

            setCartId(newCart.id)
          } else {
            throw cartError
          }
        } else {
          setCartId(cartData.id)

          // Get cart items
          const { data: itemsData, error: itemsError } = await supabase
            .from("cart_items")
            .select("*")
            .eq("cart_id", cartData.id)

          if (itemsError) throw itemsError

          setCartItems(itemsData)
        }
      } catch (error) {
        console.error("Error fetching cart:", error)
      }
    }

    fetchCart()
  }, [isAuthenticated, user, supabase])

  // Load local cart from localStorage when component mounts
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

  // Save local cart to localStorage when it changes
  useEffect(() => {
    if (isInitialized && !isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("mybeauty_cart", JSON.stringify(localCart))
    }
  }, [localCart, isInitialized, isAuthenticated])

  // Merge local cart with database when user logs in
  useEffect(() => {
    const mergeCarts = async () => {
      if (isAuthenticated && user && cartId && localCart.length > 0) {
        try {
          // Add each local cart item to the database
          for (const item of localCart) {
            // Check if item already exists
            const { data: existingItem, error: checkError } = await supabase
              .from("cart_items")
              .select("id, quantity")
              .eq("cart_id", cartId)
              .eq("variant_id", item.variant_id)
              .maybeSingle()

            if (checkError && checkError.code !== "PGRST116") throw checkError

            if (existingItem) {
              // Update quantity
              const { error: updateError } = await supabase
                .from("cart_items")
                .update({ quantity: existingItem.quantity + item.quantity })
                .eq("id", existingItem.id)

              if (updateError) throw updateError
            } else {
              // Insert new item
              const { error: insertError } = await supabase.from("cart_items").insert({
                cart_id: cartId,
                variant_id: item.variant_id,
                quantity: item.quantity,
              })

              if (insertError) throw insertError
            }
          }

          // Clear local cart
          setLocalCart([])
          localStorage.removeItem("mybeauty_cart")

          // Refresh cart items
          const { data: refreshedItems, error: refreshError } = await supabase
            .from("cart_items")
            .select("*")
            .eq("cart_id", cartId)

          if (refreshError) throw refreshError

          setCartItems(refreshedItems)

          toast({
            title: "Đồng bộ thành công",
            description: "Giỏ hàng của bạn đã được đồng bộ.",
          })
        } catch (error) {
          console.error("Error merging carts:", error)
        }
      }
    }

    mergeCarts()
  }, [isAuthenticated, user, cartId, localCart, supabase, toast])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

