import type { CartItem } from "../context/cart-context"

interface CartTotals {
  subtotal: number
  discountAmount: number
  shippingFee: number
  total: number
}

export function calculateCartTotals(items: CartItem[], discountAmount = 0, shippingFee = 0): CartTotals {
  // Calculate subtotal
  const subtotal = items.reduce((total, item) => {
    const price = item.sale_price && item.sale_price > 0 ? item.sale_price : item.price || 0
    return total + price * item.quantity
  }, 0)

  // Calculate total
  const total = Math.max(0, subtotal - discountAmount + shippingFee)

  return {
    subtotal,
    discountAmount,
    shippingFee,
    total,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
