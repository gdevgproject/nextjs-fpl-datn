"use client"

import type React from "react"
import { createContext, useContext, useCallback, useEffect, useState } from "react"
import { useClientFetch } from "@/shared/hooks/use-client-fetch"
import { createClient } from "@/shared/supabase/client"
import { useAuth } from "@/features/auth/context/auth-context"
import { toast } from "sonner"

// Supabase client for direct operations
const supabase = createClient()

// Cart item type
export interface CartItem {
  id: number
  variant_id: number
  quantity: number
  product_name?: string
  product_image?: string
  volume_ml?: number
  price?: number
  sale_price?: number
  stock_quantity?: number
  product_id?: number
}

// Cart context type
interface CartContextType {
  items: CartItem[]
  itemCount: number
  isLoading: boolean
  error: Error | null
  addItem: (variantId: number, quantity: number) => Promise<void>
  updateItem: (cartItemId: number, quantity: number) => Promise<void>
  removeItem: (cartItemId: number) => Promise<void>
  clearCart: () => Promise<void>
  refetchCart: () => Promise<void>
  isEmpty: boolean
  isGuest: boolean
  hasInteracted: boolean
}

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Local storage key for cart
const CART_STORAGE_KEY = "mybeauty_cart"
// Local storage key to track if guest has interacted with cart
const CART_INTERACTION_KEY = "mybeauty_cart_interaction"

// Cart provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const isAuthenticated = !!user
  const isGuest = !isAuthenticated
  const [localCart, setLocalCart] = useState<CartItem[]>([])
  const [isMergingCart, setIsMergingCart] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Function to get cart from local storage
  const getLocalCart = useCallback((): CartItem[] => {
    if (typeof window === "undefined") return []

    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY)
      return storedCart ? JSON.parse(storedCart) : []
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error)
      return []
    }
  }, [])

  // Function to check if guest has interacted with cart
  const getHasInteracted = useCallback((): boolean => {
    if (typeof window === "undefined") return false

    try {
      return localStorage.getItem(CART_INTERACTION_KEY) === "true"
    } catch (error) {
      return false
    }
  }, [])

  // Function to save cart to local storage
  const saveLocalCart = useCallback((items: CartItem[]) => {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      // Mark that guest has interacted with cart
      localStorage.setItem(CART_INTERACTION_KEY, "true")
      setLocalCart(items)
      setHasInteracted(true)
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
    }
  }, [])

  // Initialize local cart and interaction state
  useEffect(() => {
    if (!isAuthenticated) {
      setLocalCart(getLocalCart())
      setHasInteracted(getHasInteracted())
    }
  }, [isAuthenticated, getLocalCart, getHasInteracted])

  // Use useClientFetch to get user's cart ID
  const { data: cartData, error: cartError } = useClientFetch(
    ["cart", "id", user?.id],
    "shopping_carts",
    {
      filters: (query) => query.select("id").eq("user_id", user?.id),
      single: true,
    },
    {
      enabled: isAuthenticated,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  )

  // Use useClientFetch to get cart items
  const {
    data: cartItems,
    isLoading,
    error,
    refetch: refetchCartItems,
  } = useClientFetch(
    ["cart", "items", cartData?.id],
    "cart_items",
    {
      filters: (query) =>
        query
          .select(`
            id, 
            variant_id, 
            quantity,
            product_variants!inner(
              volume_ml,
              price,
              sale_price,
              stock_quantity,
              product_id,
              products!inner(
                name,
                product_images(image_url, is_main)
              )
            )
          `)
          .eq("cart_id", cartData?.id),
    },
    {
      enabled: isAuthenticated && !!cartData?.id,
      staleTime: 1000 * 60, // 1 minute
    },
  )

  // Transform cart items to match our CartItem interface
  const transformedCartItems: CartItem[] = isAuthenticated
    ? (cartItems || []).map((item: any) => ({
        id: item.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        product_name: item.product_variants.products.name,
        product_image: item.product_variants.products.product_images.find((img: any) => img.is_main)?.image_url,
        volume_ml: item.product_variants.volume_ml,
        price: item.product_variants.price,
        sale_price: item.product_variants.sale_price,
        stock_quantity: item.product_variants.stock_quantity,
        product_id: item.product_variants.product_id,
      }))
    : localCart

  // Function to remove item from cart
  const removeItem = useCallback(
    async (cartItemId: number) => {
      if (!isAuthenticated) {
        // Remove from local cart for unauthenticated users
        const currentCart = getLocalCart()
        const updatedCart = currentCart.filter((item) => item.id !== cartItemId)

        saveLocalCart(updatedCart)
        toast.success("Sản phẩm đã được xóa khỏi giỏ hàng")
        return
      }

      try {
        // Remove item from Supabase
        const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)

        if (error) {
          throw new Error(`Failed to remove cart item: ${error.message}`)
        }

        // Refetch cart items
        await refetchCartItems()
        toast.success("Sản phẩm đã được xóa khỏi giỏ hàng")
      } catch (error) {
        toast.error(`Xóa sản phẩm thất bại: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    },
    [isAuthenticated, getLocalCart, saveLocalCart, refetchCartItems],
  )

  // Function to add item to cart
  const addItem = useCallback(
    async (variantId: number, quantity: number) => {
      if (!isAuthenticated) {
        // Add to local cart for unauthenticated users
        const currentCart = getLocalCart()
        const existingItemIndex = currentCart.findIndex((item) => item.variant_id === variantId)

        if (existingItemIndex >= 0) {
          // Update existing item
          currentCart[existingItemIndex].quantity += quantity
        } else {
          // Add new item
          currentCart.push({
            id: Date.now(), // Temporary ID for local cart
            variant_id: variantId,
            quantity,
          })
        }

        saveLocalCart(currentCart)

        // Fetch product details for better UX
        try {
          const { data: variantData } = await supabase
            .from("product_variants")
            .select(`
              volume_ml,
              price,
              sale_price,
              stock_quantity,
              product_id,
              products!inner(
                name,
                product_images(image_url, is_main)
              )
            `)
            .eq("id", variantId)
            .single()

          if (variantData) {
            // Enhance local cart item with product details
            const enhancedCart = getLocalCart().map((item) => {
              if (item.variant_id === variantId) {
                return {
                  ...item,
                  product_name: variantData.products.name,
                  product_image: variantData.products.product_images.find((img: any) => img.is_main)?.image_url,
                  volume_ml: variantData.volume_ml,
                  price: variantData.price,
                  sale_price: variantData.sale_price,
                  stock_quantity: variantData.stock_quantity,
                  product_id: variantData.product_id,
                }
              }
              return item
            })
            saveLocalCart(enhancedCart)
          }
        } catch (error) {
          // Silent fail - the cart will still work without the enhanced data
          console.error("Failed to fetch product details for cart:", error)
        }

        toast.success("Sản phẩm đã được thêm vào giỏ hàng")
        return
      }

      // Add to Supabase cart for authenticated users
      if (!cartData?.id) {
        toast.error("Không thể thêm sản phẩm vào giỏ hàng")
        return
      }

      try {
        // Check if item already exists
        const { data: existingItems, error: existingError } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("cart_id", cartData.id)
          .eq("variant_id", variantId)
          .single()

        if (existingError && existingError.code !== "PGRST116") {
          throw new Error(`Failed to check existing item: ${existingError.message}`)
        }

        if (existingItems) {
          // Update existing item
          const { error: updateError } = await supabase
            .from("cart_items")
            .update({ quantity: existingItems.quantity + quantity })
            .eq("id", existingItems.id)

          if (updateError) {
            throw new Error(`Failed to update cart item: ${updateError.message}`)
          }
        } else {
          // Add new item
          const { error: insertError } = await supabase.from("cart_items").insert({
            cart_id: cartData.id,
            variant_id: variantId,
            quantity,
          })

          if (insertError) {
            throw new Error(`Failed to add item to cart: ${insertError.message}`)
          }
        }

        // Refetch cart items
        await refetchCartItems()
        toast.success("Sản phẩm đã được thêm vào giỏ hàng")
      } catch (error) {
        toast.error(`Thêm sản phẩm thất bại: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    },
    [isAuthenticated, cartData?.id, getLocalCart, saveLocalCart, refetchCartItems],
  )

  // Function to update item in cart
  const updateItem = useCallback(
    async (cartItemId: number, quantity: number) => {
      // Prevent negative quantities
      if (quantity <= 0) {
        // If quantity is zero or negative, remove the item instead
        return removeItem(cartItemId)
      }

      if (!isAuthenticated) {
        // Update local cart for unauthenticated users
        const currentCart = getLocalCart()
        const itemToUpdate = currentCart.find((item) => item.id === cartItemId)

        // Check stock limit if we have that information
        if (itemToUpdate?.stock_quantity && quantity > itemToUpdate.stock_quantity) {
          toast.error(`Chỉ còn ${itemToUpdate.stock_quantity} sản phẩm trong kho`)
          return
        }

        const updatedCart = currentCart.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))

        saveLocalCart(updatedCart)
        return
      }

      // For authenticated users, first check stock limit
      const item = transformedCartItems.find((item) => item.id === cartItemId)

      if (item?.stock_quantity && quantity > item.stock_quantity) {
        toast.error(`Chỉ còn ${item.stock_quantity} sản phẩm trong kho`)
        return
      }

      try {
        // Update item in Supabase
        const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId)

        if (error) {
          throw new Error(`Failed to update cart item: ${error.message}`)
        }

        // Refetch cart items
        await refetchCartItems()
      } catch (error) {
        toast.error(`${error instanceof Error ? error.message : "Unknown error"}`)
      }
    },
    [isAuthenticated, getLocalCart, saveLocalCart, transformedCartItems, refetchCartItems, removeItem],
  )

  // Function to clear cart
  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      // Clear local cart for unauthenticated users
      saveLocalCart([])
      toast.success("Giỏ hàng đã được xóa")
      return
    }

    if (!cartData?.id) {
      toast.error("Không thể xóa giỏ hàng")
      return
    }

    try {
      // Clear cart in Supabase
      const { error } = await supabase.from("cart_items").delete().eq("cart_id", cartData.id)

      if (error) {
        throw new Error(`Failed to clear cart: ${error.message}`)
      }

      // Refetch cart items
      await refetchCartItems()
      toast.success("Giỏ hàng đã được xóa")
    } catch (error) {
      toast.error(`Xóa giỏ hàng thất bại: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }, [isAuthenticated, cartData?.id, saveLocalCart, refetchCartItems])

  // Function to refetch cart
  const refetchCart = useCallback(async () => {
    if (isAuthenticated) {
      await refetchCartItems()
    } else {
      setLocalCart(getLocalCart())
    }
  }, [isAuthenticated, refetchCartItems, getLocalCart])

  // Sync local cart to server when user logs in
  useEffect(() => {
    const syncLocalCartToServer = async () => {
      if (isAuthenticated && !isLoading && cartData?.id && !isMergingCart) {
        const localCart = getLocalCart()

        // If local cart is empty, no need to sync
        if (localCart.length === 0) return

        try {
          setIsMergingCart(true)
          // Show a toast to inform the user that their cart is being merged
          const toastId = toast.loading("Đang đồng bộ giỏ hàng của bạn...")

          // Fetch current server cart to compare with local cart
          const { data: serverCartItems, error: serverCartError } = await supabase
            .from("cart_items")
            .select("variant_id, quantity")
            .eq("cart_id", cartData.id)

          if (serverCartError && serverCartError.code !== "PGRST116") {
            console.error(`Failed to fetch server cart items: ${serverCartError.message}`)
          }

          // Create a map of server cart items for quick lookup
          const serverCartMap = new Map()
          if (serverCartItems) {
            serverCartItems.forEach((item) => {
              serverCartMap.set(item.variant_id, item.quantity)
            })
          }

          // Process local cart items in batches for better performance
          const batchSize = 5
          const batches = []

          for (let i = 0; i < localCart.length; i += batchSize) {
            batches.push(localCart.slice(i, i + batchSize))
          }

          for (const batch of batches) {
            const promises = batch.map(async (item) => {
              const serverQuantity = serverCartMap.get(item.variant_id) || 0

              if (serverQuantity > 0) {
                // Item exists in server cart, update quantity
                return supabase
                  .from("cart_items")
                  .update({ quantity: serverQuantity + item.quantity })
                  .eq("cart_id", cartData.id)
                  .eq("variant_id", item.variant_id)
              } else {
                // Item doesn't exist in server cart, insert new
                return supabase.from("cart_items").insert({
                  cart_id: cartData.id,
                  variant_id: item.variant_id,
                  quantity: item.quantity,
                })
              }
            })

            await Promise.all(promises)
          }

          // Clear local cart after sync
          saveLocalCart([])

          // Refetch cart to get updated data
          await refetchCartItems()

          // Update toast to success
          toast.success("Giỏ hàng đã được đồng bộ thành công", {
            id: toastId,
          })
        } catch (error) {
          console.error("Failed to sync local cart to server:", error)
          toast.error("Đồng bộ giỏ hàng thất bại")
        } finally {
          setIsMergingCart(false)
        }
      }
    }

    syncLocalCartToServer()
  }, [isAuthenticated, isLoading, cartData?.id, getLocalCart, saveLocalCart, refetchCartItems, isMergingCart])

  // Calculate item count
  const items = transformedCartItems || []
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const isEmpty = items.length === 0

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        isLoading: isLoading || isMergingCart,
        error: error as Error | null,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refetchCart,
        isEmpty,
        isGuest,
        hasInteracted,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook to use the cart context
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider")
  }
  return context
}
