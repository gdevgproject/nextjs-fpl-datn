"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/shared/supabase/client"
import { toast } from "sonner"

const supabase = createClient()

interface DiscountCodeResult {
  isValid: boolean
  discount: {
    id: number
    code: string
    discount_percentage?: number | null
    max_discount_amount?: number | null
    min_order_value?: number | null
  } | null
  discountAmount: number
  error?: string
}

export function useDiscountCode() {
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCodeResult["discount"]>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Cache for discount code validation results
  const [discountCache, setDiscountCache] = useState<Record<string, DiscountCodeResult>>({})

  const validateDiscount = useCallback(
    async ({ code, subtotal }: { code: string; subtotal: number }): Promise<DiscountCodeResult> => {
      setIsValidating(true)
      try {
        // Check cache first for better performance
        const cacheKey = `${code}-${subtotal}`
        if (discountCache[cacheKey]) {
          const cachedResult = discountCache[cacheKey]
          if (cachedResult.isValid) {
            setAppliedDiscount(cachedResult.discount)
            toast.success(`Mã giảm giá ${cachedResult.discount?.code} đã được áp dụng`)
          }
          return cachedResult
        }

        // Validate the discount code against the database
        const { data, error } = await supabase
          .from("discounts")
          .select(
            "id, code, discount_percentage, max_discount_amount, min_order_value, is_active, start_date, end_date, remaining_uses",
          )
          .eq("code", code.toUpperCase())
          .eq("is_active", true)
          .single()

        if (error) {
          const result: DiscountCodeResult = {
            isValid: false,
            discount: null,
            discountAmount: 0,
            error: "Mã giảm giá không hợp lệ",
          }
          setDiscountCache((prev) => ({ ...prev, [cacheKey]: result }))
          return result
        }

        // Check if discount is valid
        const now = new Date()

        // Check start date
        if (data.start_date && new Date(data.start_date) > now) {
          const result: DiscountCodeResult = {
            isValid: false,
            discount: null,
            discountAmount: 0,
            error: "Mã giảm giá chưa có hiệu lực",
          }
          setDiscountCache((prev) => ({ ...prev, [cacheKey]: result }))
          return result
        }

        // Check end date
        if (data.end_date && new Date(data.end_date) < now) {
          const result: DiscountCodeResult = {
            isValid: false,
            discount: null,
            discountAmount: 0,
            error: "Mã giảm giá đã hết hạn",
          }
          setDiscountCache((prev) => ({ ...prev, [cacheKey]: result }))
          return result
        }

        // Check remaining uses
        if (data.remaining_uses !== null && data.remaining_uses <= 0) {
          const result: DiscountCodeResult = {
            isValid: false,
            discount: null,
            discountAmount: 0,
            error: "Mã giảm giá đã hết lượt sử dụng",
          }
          setDiscountCache((prev) => ({ ...prev, [cacheKey]: result }))
          return result
        }

        // Check minimum order value
        if (data.min_order_value && subtotal < data.min_order_value) {
          const result: DiscountCodeResult = {
            isValid: false,
            discount: null,
            discountAmount: 0,
            error: `Giá trị đơn hàng tối thiểu để sử dụng mã này là ${data.min_order_value.toLocaleString("vi-VN")}đ`,
          }
          setDiscountCache((prev) => ({ ...prev, [cacheKey]: result }))
          return result
        }

        // Calculate discount amount
        let discountAmount = 0

        if (data.discount_percentage) {
          // Percentage discount
          discountAmount = subtotal * (data.discount_percentage / 100)

          // Apply max discount amount if specified
          if (data.max_discount_amount && discountAmount > data.max_discount_amount) {
            discountAmount = data.max_discount_amount
          }
        } else if (data.max_discount_amount) {
          // Fixed amount discount
          discountAmount = data.max_discount_amount
        }

        // Ensure discount doesn't exceed subtotal
        if (discountAmount > subtotal) {
          discountAmount = subtotal
        }

        const result: DiscountCodeResult = {
          isValid: true,
          discount: {
            id: data.id,
            code: data.code,
            discount_percentage: data.discount_percentage,
            max_discount_amount: data.max_discount_amount,
            min_order_value: data.min_order_value,
          },
          discountAmount,
        }

        // Cache the result
        setDiscountCache((prev) => ({ ...prev, [cacheKey]: result }))

        // Apply the discount
        if (result.isValid) {
          setAppliedDiscount(result.discount)
          toast.success(`Mã giảm giá ${result.discount?.code} đã được áp dụng`)
        }

        return result
      } catch (error) {
        console.error("Error validating discount code:", error)
        return {
          isValid: false,
          discount: null,
          discountAmount: 0,
          error: "Có lỗi xảy ra khi kiểm tra mã giảm giá",
        }
      } finally {
        setIsValidating(false)
      }
    },
    [discountCache],
  )

  const removeDiscount = useCallback(() => {
    setAppliedDiscount(null)
    toast.success("Đã xóa mã giảm giá")
  }, [])

  // Calculate discount amount for a given subtotal
  const calculateDiscountAmount = useCallback(
    (subtotal: number): number => {
      if (!appliedDiscount) return 0

      let discountAmount = 0

      if (appliedDiscount.discount_percentage) {
        // Percentage discount
        discountAmount = subtotal * (appliedDiscount.discount_percentage / 100)

        // Apply max discount amount if specified
        if (appliedDiscount.max_discount_amount && discountAmount > appliedDiscount.max_discount_amount) {
          discountAmount = appliedDiscount.max_discount_amount
        }
      } else if (appliedDiscount.max_discount_amount) {
        // Fixed amount discount
        discountAmount = appliedDiscount.max_discount_amount
      }

      // Ensure discount doesn't exceed subtotal
      if (discountAmount > subtotal) {
        discountAmount = subtotal
      }

      return discountAmount
    },
    [appliedDiscount],
  )

  return {
    appliedDiscount,
    validateDiscount,
    isValidating,
    removeDiscount,
    calculateDiscountAmount,
  }
}
