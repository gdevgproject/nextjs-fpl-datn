"use client"

import { useMemo } from "react"
import { useCart as useCartContext } from "../context/cart-context"
import { calculateCartTotals } from "../utils/cart-calculations"
import { useDiscountCode } from "./use-discount-code"

interface UseCartTotalsOptions {
  shippingFee?: number
}

export function useCartTotals(options: UseCartTotalsOptions = {}) {
  const { items } = useCartContext()
  const { appliedDiscount, calculateDiscountAmount } = useDiscountCode()
  const { shippingFee = 0 } = options

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.sale_price && item.sale_price > 0 ? item.sale_price : item.price || 0
      return total + price * item.quantity
    }, 0)
  }, [items])

  // Calculate discount amount based on subtotal
  const discountAmount = useMemo(() => {
    return calculateDiscountAmount(subtotal)
  }, [calculateDiscountAmount, subtotal])

  // Calculate final totals
  const totals = useMemo(() => {
    return calculateCartTotals(items, discountAmount, shippingFee)
  }, [items, discountAmount, shippingFee])

  return {
    ...totals,
    subtotal,
    appliedDiscount,
    hasDiscount: !!appliedDiscount,
  }
}
