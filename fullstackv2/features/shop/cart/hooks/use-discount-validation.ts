"use client"

import { useState, useCallback } from "react"
import { useClientFetch } from "@/shared/hooks/use-client-fetch"
import { createClient } from "@/shared/supabase/client"

const supabase = createClient()

interface ValidationError {
  type: "invalid_code" | "expired" | "not_started" | "min_order" | "no_uses_left" | "inactive" | "server_error"
  message: string
}

export function useDiscountValidation() {
  const [lastCheckedCode, setLastCheckedCode] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<ValidationError | null>(null)

  // Fetch active discount codes for suggestions
  const { data: activeDiscounts } = useClientFetch(
    ["discounts", "active"],
    "discounts",
    {
      filters: (query) =>
        query
          .select("code")
          .eq("is_active", true)
          .gte("remaining_uses", 1)
          .or("start_date.is.null,start_date.lte.now()")
          .or("end_date.is.null,end_date.gte.now()"),
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  )

  // Function to validate a discount code without applying it
  const validateCode = useCallback(async (code: string, subtotal: number) => {
    setLastCheckedCode(code)
    setValidationError(null)

    try {
      // Normalize code
      const normalizedCode = code.trim().toUpperCase()

      // Fetch the discount from the database
      const { data, error } = await supabase
        .from("discounts")
        .select(
          "id, code, discount_percentage, max_discount_amount, min_order_value, is_active, start_date, end_date, remaining_uses",
        )
        .eq("code", normalizedCode)
        .single()

      if (error) {
        setValidationError({
          type: "invalid_code",
          message: "Mã giảm giá không hợp lệ",
        })
        return false
      }

      // Check if discount is active
      if (!data.is_active) {
        setValidationError({
          type: "inactive",
          message: "Mã giảm giá không hoạt động",
        })
        return false
      }

      // Check start date
      const now = new Date()
      if (data.start_date && new Date(data.start_date) > now) {
        setValidationError({
          type: "not_started",
          message: "Mã giảm giá chưa có hiệu lực",
        })
        return false
      }

      // Check end date
      if (data.end_date && new Date(data.end_date) < now) {
        setValidationError({
          type: "expired",
          message: "Mã giảm giá đã hết hạn",
        })
        return false
      }

      // Check remaining uses
      if (data.remaining_uses !== null && data.remaining_uses <= 0) {
        setValidationError({
          type: "no_uses_left",
          message: "Mã giảm giá đã hết lượt sử dụng",
        })
        return false
      }

      // Check minimum order value
      if (data.min_order_value && subtotal < data.min_order_value) {
        setValidationError({
          type: "min_order",
          message: `Giá trị đơn hàng tối thiểu để sử dụng mã này là ${data.min_order_value.toLocaleString("vi-VN")}đ`,
        })
        return false
      }

      return true
    } catch (error) {
      console.error("Error validating discount code:", error)
      setValidationError({
        type: "server_error",
        message: "Có lỗi xảy ra khi kiểm tra mã giảm giá",
      })
      return false
    }
  }, [])

  // Function to get discount code suggestions
  const getCodeSuggestions = useCallback(() => {
    return activeDiscounts?.map((discount) => discount.code) || []
  }, [activeDiscounts])

  return {
    validateCode,
    validationError,
    lastCheckedCode,
    getCodeSuggestions,
    clearValidationError: () => setValidationError(null),
  }
}
