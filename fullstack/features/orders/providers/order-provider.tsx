"use client"

import type React from "react"
import { createContext, useContext, useState, useMemo } from "react"
import { useAuth } from "@/lib/providers/auth-context"
import { useCartContext } from "@/features/cart/providers/cart-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Address } from "@/features/account/types"

// Định nghĩa các bước trong quy trình thanh toán
type CheckoutStep = "cart" | "address" | "payment" | "review" | "complete"

// Định nghĩa thông tin đơn hàng
type OrderInfo = {
  shippingAddress: Address | null
  paymentMethod: string | null
  deliveryNotes: string
  discountCode: string | null
}

// Định nghĩa context type
type OrderContextType = {
  currentStep: CheckoutStep
  orderInfo: OrderInfo
  isProcessing: boolean
  setStep: (step: CheckoutStep) => void
  setShippingAddress: (address: Address) => void
  setPaymentMethod: (method: string) => void
  setDeliveryNotes: (notes: string) => void
  setDiscountCode: (code: string | null) => void
  placeOrder: () => Promise<boolean>
  resetOrder: () => void
}

// Tạo context
const OrderContext = createContext<OrderContextType>({
  currentStep: "cart",
  orderInfo: {
    shippingAddress: null,
    paymentMethod: null,
    deliveryNotes: "",
    discountCode: null,
  },
  isProcessing: false,
  setStep: () => {},
  setShippingAddress: () => {},
  setPaymentMethod: () => {},
  setDeliveryNotes: () => {},
  setDiscountCode: () => {},
  placeOrder: async () => false,
  resetOrder: () => {},
})

// Hook để sử dụng context
export const useOrderContext = () => useContext(OrderContext)

// Provider component
export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const { cartItems, cartTotal, subtotal, discount, shippingFee, clearCart } = useCartContext()
  const { toast } = useToast()
  const router = useRouter()

  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("cart")
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({
    shippingAddress: null,
    paymentMethod: null,
    deliveryNotes: "",
    discountCode: null,
  })

  // Các hàm setter
  const setStep = (step: CheckoutStep) => {
    setCurrentStep(step)
  }

  const setShippingAddress = (address: Address) => {
    setOrderInfo((prev) => ({ ...prev, shippingAddress: address }))
  }

  const setPaymentMethod = (method: string) => {
    setOrderInfo((prev) => ({ ...prev, paymentMethod: method }))
  }

  const setDeliveryNotes = (notes: string) => {
    setOrderInfo((prev) => ({ ...prev, deliveryNotes: notes }))
  }

  const setDiscountCode = (code: string | null) => {
    setOrderInfo((prev) => ({ ...prev, discountCode: code }))
  }

  // Đặt hàng
  const placeOrder = async (): Promise<boolean> => {
    // Kiểm tra thông tin đơn hàng
    if (!orderInfo.shippingAddress) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn địa chỉ giao hàng",
        variant: "destructive",
      })
      return false
    }

    if (!orderInfo.paymentMethod) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn phương thức thanh toán",
        variant: "destructive",
      })
      return false
    }

    if (cartItems.length === 0) {
      toast({
        title: "Lỗi",
        description: "Giỏ hàng của bạn đang trống",
        variant: "destructive",
      })
      return false
    }

    setIsProcessing(true)

    try {
      // Giả lập API call để tạo đơn hàng
      // Trong thực tế, cần gọi API để tạo đơn hàng
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Xóa giỏ hàng sau khi đặt hàng thành công
      clearCart()

      // Chuyển đến bước hoàn thành
      setCurrentStep("complete")

      toast({
        title: "Đặt hàng thành công",
        description: "Cảm ơn bạn đã mua hàng tại MyBeauty",
      })

      // Chuyển hướng đến trang xác nhận đơn hàng
      router.push("/xac-nhan-don-hang")

      return true
    } catch (error) {
      toast({
        title: "Đặt hàng thất bại",
        description: "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset đơn hàng
  const resetOrder = () => {
    setCurrentStep("cart")
    setOrderInfo({
      shippingAddress: null,
      paymentMethod: null,
      deliveryNotes: "",
      discountCode: null,
    })
  }

  const value = useMemo(
    () => ({
      currentStep,
      orderInfo,
      isProcessing,
      setStep,
      setShippingAddress,
      setPaymentMethod,
      setDeliveryNotes,
      setDiscountCode,
      placeOrder,
      resetOrder,
    }),
    [currentStep, orderInfo, isProcessing],
  )

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

