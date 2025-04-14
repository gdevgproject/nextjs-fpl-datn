"use client"

import React from "react"
import { createClient } from "@/shared/supabase/client"
import { createContext, useState, useEffect } from "react"
import { useAuth } from "@/features/auth/context/auth-context"
import { toast } from "sonner"

const supabase = createClient()

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

// Register data type
interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}

// Create the auth context
export const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = React.useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used inside an CartProvider")
  }
  return context
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)

  const isGuest = !user

  // Load cart from local storage on mount if guest
  useEffect(() => {
    if (isGuest) {
      const storedCart = localStorage.getItem("guestCart")
      if (storedCart) {
        setItems(JSON.parse(storedCart))
      }
    }
  }, [isGuest])

  // Save cart to local storage on change if guest
  useEffect(() => {
    if (isGuest) {
      localStorage.setItem("guestCart", JSON.stringify(items))
    }
  }, [items, isGuest])

  // Load cart from database on user login
  useEffect(() => {
    const loadCart = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("cart_items")
          .select(
            `
            id, 
            variant_id, 
            quantity,
            product_name:product_variants(products(name)),
            product_image:product_variants(products(product_images(image_url, is_main))),
            volume_ml:product_variants(volume_ml),
            price:product_variants(price),
            sale_price:product_variants(sale_price),
            stock_quantity:product_variants(stock_quantity),
            product_id:product_variants(product_id)
          `,
          )
          .eq("cart_id", `(SELECT id FROM shopping_carts WHERE user_id = '${user.id}')`)
        if (error) throw error

        const formattedItems = data?.map((item: any) => ({
          id: item.id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          product_name: item.product_name ? item.product_name[0]?.products?.name : null,
          product_image: item.product_image ? item.product_image[0]?.products?.product_images[0]?.image_url : null,
          volume_ml: item.volume_ml ? item.volume_ml[0]?.volume_ml : null,
          price: item.price ? item.price[0]?.price : null,
          sale_price: item.sale_price ? item.sale_price[0]?.sale_price : null,
          stock_quantity: item.stock_quantity ? item.stock_quantity[0]?.stock_quantity : null,
          product_id: item.product_id ? item.product_id[0]?.product_id : null,
        }))

        setItems(formattedItems || [])
      } catch (err: any) {
        setError(err)
        toast.error(`Lỗi khi tải giỏ hàng: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [user, toast])

  const addItem = async (variantId: number, quantity: number) => {
    setHasInteracted(true)
    if (isGuest) {
      // Guest cart logic
      const existingItemIndex = items.findIndex((item) => item.variant_id === variantId)
      if (existingItemIndex !== -1) {
        const newItems = [...items]
        newItems[existingItemIndex].quantity += quantity
        setItems(newItems)
      } else {
        setItems([...items, { id: Date.now(), variant_id: variantId, quantity }])
      }
    } else {
      // Authenticated user cart logic
      setIsLoading(true)
      try {
        const { data, error } = await supabase.rpc("add_to_cart", {
          p_variant_id: variantId,
          p_quantity: quantity,
        })
        if (error) throw error
        await refetchCart()
      } catch (err: any) {
        setError(err)
        toast.error(`Lỗi khi thêm sản phẩm vào giỏ hàng: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const updateItem = async (cartItemId: number, quantity: number) => {
    setHasInteracted(true)
    if (isGuest) {
      // Guest cart logic
      const newItems = items.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
      setItems(newItems)
    } else {
      // Authenticated user cart logic
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId).select()
        if (error) throw error
        setItems(items.map((item) => (item.id === cartItemId ? { ...item, quantity } : item)))
      } catch (err: any) {
        setError(err)
        toast.error(`Lỗi khi cập nhật giỏ hàng: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const removeItem = async (cartItemId: number) => {
    setHasInteracted(true)
    if (isGuest) {
      // Guest cart logic
      const newItems = items.filter((item) => item.id !== cartItemId)
      setItems(newItems)
    } else {
      // Authenticated user cart logic
      setIsLoading(true)
      try {
        const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)
        if (error) throw error
        setItems(items.filter((item) => item.id !== cartItemId))
      } catch (err: any) {
        setError(err)
        toast.error(`Lỗi khi xóa sản phẩm khỏi giỏ hàng: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const clearCart = async () => {
    setHasInteracted(true)
    if (isGuest) {
      // Guest cart logic
      setItems([])
    } else {
      // Authenticated user cart logic
      setIsLoading(true)
      try {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("cart_id", `(SELECT id FROM shopping_carts WHERE user_id = '${user?.id}')`)
        if (error) throw error
        setItems([])
      } catch (err: any) {
        setError(err)
        toast.error(`Lỗi khi xóa giỏ hàng: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const refetchCart = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          id, 
          variant_id, 
          quantity,
          product_name:product_variants(products(name)),
          product_image:product_variants(products(product_images(image_url, is_main))),
          volume_ml:product_variants(volume_ml),
          price:product_variants(price),
          sale_price:product_variants(sale_price),
          stock_quantity:product_variants(stock_quantity),
          product_id:product_variants(product_id)
        `,
        )
        .eq("cart_id", `(SELECT id FROM shopping_carts WHERE user_id = '${user.id}')`)
      if (error) throw error

      const formattedItems = data?.map((item: any) => ({
        id: item.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        product_name: item.product_name ? item.product_name[0]?.products?.name : null,
        product_image: item.product_image ? item.product_image[0]?.products?.product_images[0]?.image_url : null,
        volume_ml: item.volume_ml ? item.volume_ml[0]?.volume_ml : null,
        price: item.price ? item.price[0]?.price : null,
        sale_price: item.sale_price ? item.sale_price[0]?.sale_price : null,
        stock_quantity: item.stock_quantity ? item.stock_quantity[0]?.stock_quantity : null,
        product_id: item.product_id ? item.product_id[0]?.product_id : null,
      }))

      setItems(formattedItems || [])
    } catch (err: any) {
      setError(err)
      toast.error(`Lỗi khi tải giỏ hàng: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const isEmpty = items.length === 0

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        isLoading,
        error,
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
