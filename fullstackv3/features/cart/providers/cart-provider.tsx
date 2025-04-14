"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/lib/providers/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { CartItem, CartState, Discount } from "../types"
import {
  addToCart as addToCartAction,
  updateCartItemQuantity as updateCartItemQuantityAction,
  removeCartItem as removeCartItemAction,
  clearCart as clearCartAction,
  removeDiscountCode as removeDiscountCodeAction,
  getProductVariantDetails,
} from "../actions/cart-actions"
import { useShopSettings } from "@/features/shared/hooks/use-shop-settings"

// Initial cart state
const initialCartState: CartState = {
  cartItems: [],
  cartItemCount: 0,
  subtotal: 0,
  discount: 0,
  shippingFee: 0,
  cartTotal: 0,
  discountCode: "",
  appliedDiscount: null,
  isUpdatingCart: false,
}

// Context type
type CartContextType = CartState & {
  addToCart: (variantId: number, quantity: number, productId?: string) => Promise<void>
  updateCartItemQuantity: (variantId: number, quantity: number, itemId?: string) => Promise<void>
  removeCartItem: (variantId: number, itemId?: string) => Promise<void>
  clearCart: () => Promise<void>
  applyDiscount: (code: string, discount: Discount, amount: number) => void
  removeDiscount: () => Promise<void>
  setDiscountCode: (code: string) => void
}

// Create context
const CartContext = createContext<CartContextType>({
  ...initialCartState,
  addToCart: async () => {},
  updateCartItemQuantity: async () => {},
  removeCartItem: async () => {},
  clearCart: async () => {},
  applyDiscount: () => {},
  removeDiscount: async () => {},
  setDiscountCode: () => {},
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>(initialCartState)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { settings } = useShopSettings()

  // Get shipping fee from settings
  const shippingFee = settings?.shipping_fee || 0
  const freeShippingThreshold = settings?.free_shipping_threshold || null

  // Fetch cart items on mount and when auth state changes
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }))

        // Fetch cart items from localStorage for guest users
        if (!isAuthenticated) {
          const localCart = localStorage.getItem("guestCart")
          if (localCart) {
            try {
              const parsedCart = JSON.parse(localCart) as CartItem[]

              // Fetch complete product details for each cart item
              const updatedCartItems = await Promise.all(
                parsedCart.map(async (item) => {
                  // If the item already has complete product data, use it
                  if (item.product && item.product.name !== "Loading..." && item.product.price > 0) {
                    return item
                  }

                  // Otherwise fetch the product details
                  try {
                    const variantDetails = await getProductVariantDetails(item.variant_id)
                    if (variantDetails.success && variantDetails.data) {
                      return {
                        ...item,
                        product: variantDetails.data,
                      }
                    }
                    return item
                  } catch (error) {
                    console.error("Error fetching product details:", error)
                    return item
                  }
                }),
              )

              // Save the updated cart with complete product details
              localStorage.setItem("guestCart", JSON.stringify(updatedCartItems))
              updateCartState(updatedCartItems)
            } catch (error) {
              console.error("Error parsing local cart:", error)
              localStorage.removeItem("guestCart")
              setState((prev) => ({ ...prev, isLoading: false }))
            }
          } else {
            setState((prev) => ({ ...prev, isLoading: false }))
          }
          return
        }

        // For authenticated users, fetch from server
        const response = await fetch("/api/cart", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch cart")
        }

        const data = await response.json()
        updateCartState(data.items || [], data.appliedDiscount)
      } catch (error) {
        console.error("Error fetching cart:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải giỏ hàng",
          variant: "destructive",
        })
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    fetchCartItems()
  }, [isAuthenticated, user?.id, toast])

  // Update cart state with new items and calculate totals
  const updateCartState = (items: CartItem[], appliedDiscount = null) => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    const subtotal = items.reduce((sum, item) => {
      const price = item.product?.sale_price || item.product?.price || 0
      return sum + price * item.quantity
    }, 0)

    // Calculate discount amount if discount is applied
    let discountAmount = 0
    if (appliedDiscount) {
      discountAmount = calculateDiscountAmount(subtotal, appliedDiscount)
    }

    // Calculate shipping fee based on subtotal and free shipping threshold
    let calculatedShippingFee = shippingFee
    if (freeShippingThreshold !== null && subtotal >= freeShippingThreshold) {
      calculatedShippingFee = 0
    }

    // Calculate total (subtotal - discount + shipping)
    const total = Math.max(0, subtotal - discountAmount) + calculatedShippingFee

    setState({
      cartItems: items,
      cartItemCount: itemCount,
      subtotal,
      discount: discountAmount,
      shippingFee: calculatedShippingFee,
      cartTotal: total,
      discountCode: appliedDiscount?.code || "",
      appliedDiscount,
      isUpdatingCart: false,
    })
  }

  // Calculate discount amount based on discount object
  const calculateDiscountAmount = (subtotal: number, discount: Discount): number => {
    if (!discount) return 0

    let amount = (discount.discount_percentage / 100) * subtotal

    // Apply max discount amount if specified
    if (discount.max_discount_amount && amount > discount.max_discount_amount) {
      amount = discount.max_discount_amount
    }

    return amount
  }

  // Add to cart
  const addToCart = async (variantId: number, quantity: number, productId?: string) => {
    try {
      setState((prev) => ({ ...prev, isUpdatingCart: true }))

      if (!isAuthenticated) {
        // Handle guest cart in localStorage
        const localCart = localStorage.getItem("guestCart")
        const cartItems: CartItem[] = localCart ? JSON.parse(localCart) : []

        // Check if item exists in cart
        const existingItemIndex = cartItems.findIndex((item) => item.variant_id === variantId)

        if (existingItemIndex >= 0) {
          // Update existing item
          cartItems[existingItemIndex].quantity += quantity
        } else {
          // Fetch product details before adding to cart
          const result = await getProductVariantDetails(variantId)

          if (result.success && result.data) {
            // Add new item with complete product info
            cartItems.push({
              id: String(Date.now()),
              variant_id: variantId,
              quantity,
              product: result.data,
            })
          } else {
            // Fallback with minimal info if fetch fails
            cartItems.push({
              id: String(Date.now()),
              variant_id: variantId,
              quantity,
              product: {
                id: productId ? Number.parseInt(productId) : 0,
                name: "Loading...",
                slug: "",
                price: 0,
                sale_price: null,
                volume_ml: 0,
                images: [],
              },
            })
          }
        }

        // Save to localStorage
        localStorage.setItem("guestCart", JSON.stringify(cartItems))
        updateCartState(cartItems)

        toast({
          title: "Thành công",
          description: "Đã thêm sản phẩm vào giỏ hàng",
        })

        setState((prev) => ({ ...prev, isUpdatingCart: false }))
        return
      }

      // For authenticated users
      const result = await addToCartAction(variantId, quantity)

      if (result.error) {
        throw new Error(result.error)
      }

      // Refresh cart items after adding
      const response = await fetch("/api/cart", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to refresh cart")
      }

      const data = await response.json()
      updateCartState(data.items || [], data.appliedDiscount)

      toast({
        title: "Thành công",
        description: "Đã thêm sản phẩm vào giỏ hàng",
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể thêm sản phẩm vào giỏ hàng",
        variant: "destructive",
      })
    } finally {
      setState((prev) => ({ ...prev, isUpdatingCart: false }))
    }
  }

  // Update cart item quantity
  const updateCartItemQuantity = async (variantId: number, quantity: number, itemId?: string) => {
    try {
      setState((prev) => ({ ...prev, isUpdatingCart: true }))

      if (!isAuthenticated) {
        // Handle guest cart in localStorage
        const localCart = localStorage.getItem("guestCart")
        let cartItems: CartItem[] = localCart ? JSON.parse(localCart) : []

        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          cartItems = cartItems.filter((item) => item.variant_id !== variantId)
        } else {
          // Update quantity
          const itemIndex = cartItems.findIndex((item) => item.variant_id === variantId)
          if (itemIndex >= 0) {
            cartItems[itemIndex].quantity = quantity
          }
        }

        // Save to localStorage
        localStorage.setItem("guestCart", JSON.stringify(cartItems))
        updateCartState(cartItems)

        setState((prev) => ({ ...prev, isUpdatingCart: false }))
        return
      }

      // For authenticated users
      // If we have the actual cart item ID, use it directly
      if (itemId) {
        const result = await updateCartItemQuantityAction(itemId, quantity)

        if (result.error) {
          throw new Error(result.error)
        }
      } else {
        // Otherwise, find the cart item with matching variant ID
        const cartItem = state.cartItems.find((item) => item.variant_id === variantId)

        if (!cartItem) {
          throw new Error("Cart item not found")
        }

        const result = await updateCartItemQuantityAction(String(cartItem.id), quantity)

        if (result.error) {
          throw new Error(result.error)
        }
      }

      // Refresh cart items after updating
      const response = await fetch("/api/cart", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to refresh cart")
      }

      const data = await response.json()
      updateCartState(data.items || [], data.appliedDiscount)
    } catch (error) {
      console.error("Error updating cart item:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật số lượng sản phẩm",
        variant: "destructive",
      })
    } finally {
      setState((prev) => ({ ...prev, isUpdatingCart: false }))
    }
  }

  // Remove from cart
  const removeCartItem = async (variantId: number, itemId?: string) => {
    try {
      setState((prev) => ({ ...prev, isUpdatingCart: true }))

      if (!isAuthenticated) {
        // Handle guest cart in localStorage
        const localCart = localStorage.getItem("guestCart")
        let cartItems: CartItem[] = localCart ? JSON.parse(localCart) : []

        // Remove item
        cartItems = cartItems.filter((item) => item.variant_id !== variantId)

        // Save to localStorage
        localStorage.setItem("guestCart", JSON.stringify(cartItems))
        updateCartState(cartItems)

        toast({
          title: "Thành công",
          description: "Đã xóa sản phẩm khỏi giỏ hàng",
        })

        setState((prev) => ({ ...prev, isUpdatingCart: false }))
        return
      }

      // For authenticated users
      // If we have the actual cart item ID, use it directly
      if (itemId) {
        const result = await removeCartItemAction(itemId)

        if (result.error) {
          throw new Error(result.error)
        }
      } else {
        // Otherwise, find the cart item with matching variant ID
        const cartItem = state.cartItems.find((item) => item.variant_id === variantId)

        if (!cartItem) {
          throw new Error("Cart item not found")
        }

        const result = await removeCartItemAction(String(cartItem.id))

        if (result.error) {
          throw new Error(result.error)
        }
      }

      // Refresh cart items after removing
      const response = await fetch("/api/cart", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to refresh cart")
      }

      const data = await response.json()
      updateCartState(data.items || [], data.appliedDiscount)

      toast({
        title: "Thành công",
        description: "Đã xóa sản phẩm khỏi giỏ hàng",
      })
    } catch (error) {
      console.error("Error removing from cart:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa sản phẩm khỏi giỏ hàng",
        variant: "destructive",
      })
    } finally {
      setState((prev) => ({ ...prev, isUpdatingCart: false }))
    }
  }

  // Clear cart
  const clearCart = async () => {
    try {
      setState((prev) => ({ ...prev, isUpdatingCart: true }))

      if (!isAuthenticated) {
        // Clear guest cart in localStorage
        localStorage.removeItem("guestCart")
        updateCartState([])

        setState((prev) => ({ ...prev, isUpdatingCart: false }))
        return
      }

      // For authenticated users
      const result = await clearCartAction()

      if (result.error) {
        throw new Error(result.error)
      }

      // Reset cart state
      updateCartState([])
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa giỏ hàng",
        variant: "destructive",
      })
    } finally {
      setState((prev) => ({ ...prev, isUpdatingCart: false }))
    }
  }

  // Apply discount
  const applyDiscount = (code: string, discount: Discount, amount: number) => {
    setState((prev) => ({
      ...prev,
      discountCode: code,
      appliedDiscount: discount,
      discount: amount,
      cartTotal: Math.max(0, prev.subtotal - amount) + prev.shippingFee,
    }))
  }

  // Remove discount
  const removeDiscount = async () => {
    try {
      if (!isAuthenticated || !state.appliedDiscount) {
        setState((prev) => ({
          ...prev,
          discountCode: "",
          appliedDiscount: null,
          discount: 0,
          cartTotal: prev.subtotal + prev.shippingFee,
        }))
        return
      }

      // For authenticated users
      const result = await removeDiscountCodeAction()

      if (result.error) {
        throw new Error(result.error)
      }

      setState((prev) => ({
        ...prev,
        discountCode: "",
        appliedDiscount: null,
        discount: 0,
        cartTotal: prev.subtotal + prev.shippingFee,
      }))
    } catch (error) {
      console.error("Error removing discount:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa mã giảm giá",
        variant: "destructive",
      })
    }
  }

  // Set discount code (without applying it)
  const setDiscountCode = (code: string) => {
    setState((prev) => ({ ...prev, discountCode: code }))
  }

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateCartItemQuantity,
        removeCartItem,
        clearCart,
        applyDiscount,
        removeDiscount,
        setDiscountCode,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCartContext = () => useContext(CartContext)

