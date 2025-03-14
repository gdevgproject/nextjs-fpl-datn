import type { CartItem } from "../types"

/**
 * Đảm bảo số lượng là số nguyên dương
 */
export function validateQuantity(quantity: number): number {
  return Math.max(1, Math.floor(quantity) || 1)
}

/**
 * Tính tổng tiền hàng (chưa giảm giá)
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const price = typeof item.price === "number" && !isNaN(item.price) ? item.price : 0
    const quantity = typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 0
    return sum + price * quantity
  }, 0)
}

/**
 * Tính tổng tiền giảm giá
 */
export function calculateDiscount(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    if (!item.originalPrice || typeof item.originalPrice !== "number" || isNaN(item.originalPrice)) {
      return sum
    }
    const originalPrice = item.originalPrice
    const price = typeof item.price === "number" && !isNaN(item.price) ? item.price : 0
    const quantity = typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 0

    // Chỉ tính giảm giá nếu giá gốc lớn hơn giá hiện tại
    return sum + (originalPrice > price ? (originalPrice - price) * quantity : 0)
  }, 0)
}

/**
 * Tính điểm thưởng (1% của tổng tiền hàng)
 */
export function calculateRewardPoints(subtotal: number): number {
  return Math.floor(subtotal * 0.01)
}

/**
 * Tính tổng tiền phải trả
 */
export function calculateTotal(subtotal: number, discount: number, pointsValue: number): number {
  return Math.max(0, subtotal - discount - pointsValue)
}

