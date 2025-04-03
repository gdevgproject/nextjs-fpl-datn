"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { useCart, type CartItem, type LocalCartItem } from "../hooks/use-cart"
import { useAuth } from "@/lib/providers/auth-context"
import { useToast } from "@/hooks/use-toast"

type CartContextType = {
  cartItems: CartItem[]
  localCart: LocalCartItem[]
  isLoading: boolean
  cartItemCount: number
  cartTotal: number
  subtotal: number
  discount: number
  shippingFee: number
  addToCart: (variantId: number, quantity: number, productId: string) => void
  updateCartItem: (params: { itemId?: string; quantity: number; variantId?: number }) => void
  removeFromCart: (params: { itemId?: string; variantId?: number }) => void
  clearCart: () => void
  applyDiscount: (code: string) => Promise<boolean>
  removeDiscount: () => void
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  localCart: [],
  isLoading: false,
  cartItemCount: 0,
  cartTotal: 0,
  subtotal: 0,
  discount: 0,
  shippingFee: 0,
  addToCart: () => {},
  updateCartItem: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  applyDiscount: async () => false,
  removeDiscount: () => {},
})

export const useCartContext = () => useContext(CartContext)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [discount, setDiscount] = useState(0)
  const [shippingFee, setShippingFee] = useState(0)
  const [discountCode, setDiscountCode] = useState<string | null>(null)

  // Tính toán subtotal và total
  const subtotal = useMemo(() => {
    return cart.cartItems.reduce(
      (total, item) => total + (item.product.sale_price || item.product.price) * item.quantity,
      0,
    )
  }, [cart.cartItems])

  const cartTotal = subtotal - discount + shippingFee

  // Xóa discount khi đăng xuất
  useEffect(() => {
    if (!isAuthenticated) {
      setDiscount(0)
      setDiscountCode(null)
    }
  }, [isAuthenticated])

  // Áp dụng mã giảm giá
  const applyDiscount = async (code: string): Promise<boolean> => {
    try {
      // Giả lập API call để kiểm tra mã giảm giá
      // Trong thực tế, cần gọi API để kiểm tra mã giảm giá
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Giả sử mã giảm giá hợp lệ và giảm 10% tổng giá trị đơn hàng
      const discountAmount = subtotal * 0.1
      setDiscount(discountAmount)
      setDiscountCode(code)

      toast({
        title: "Áp dụng mã giảm giá thành công",
        description: `Bạn được giảm ${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(discountAmount)}`,
      })

      return true
    } catch (error) {
      toast({
        title: "Áp dụng mã giảm giá thất bại",
        description: "Mã giảm giá không hợp lệ hoặc đã hết hạn",
        variant: "destructive",
      })

      return false
    }
  }

  // Xóa mã giảm giá
  const removeDiscount = () => {
    setDiscount(0)
    setDiscountCode(null)

    toast({
      title: "Đã xóa mã giảm giá",
    })
  }

  // Xóa giỏ hàng
  const clearCart = () => {
    // Xóa tất cả sản phẩm trong giỏ hàng
    cart.cartItems.forEach((item) => {
      cart.removeFromCart({ itemId: item.id })
    })

    // Xóa discount
    setDiscount(0)
    setDiscountCode(null)

    toast({
      title: "Đã xóa giỏ hàng",
    })
  }

  const value = useMemo(
    () => ({
      ...cart,
      subtotal,
      discount,
      shippingFee,
      cartTotal,
      clearCart,
      applyDiscount,
      removeDiscount,
    }),
    [cart, subtotal, discount, shippingFee, cartTotal],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

