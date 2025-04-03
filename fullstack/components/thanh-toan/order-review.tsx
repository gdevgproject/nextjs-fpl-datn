"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Edit2, MapPin, CreditCard, Truck, FileText, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useCart } from "@/lib/hooks/use-cart"
import type { CheckoutFormValues } from "@/lib/validators/checkout-validators"

interface OrderReviewProps {
  formData: CheckoutFormValues
  onEdit: (step: number) => void
  onConfirm: () => void
  isSubmitting: boolean
}

export function OrderReview({ formData, onEdit, onConfirm, isSubmitting }: OrderReviewProps) {
  const { items, subtotal, discount, total } = useCart()
  const [showWarning, setShowWarning] = useState(false)

  // Lấy thông tin địa chỉ giao hàng
  const getShippingAddress = () => {
    if (formData.addressType === "existing") {
      // Giả lập lấy địa chỉ từ ID
      return "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
    } else if (formData.shippingAddress) {
      const address = formData.shippingAddress
      // Giả lập chuyển đổi ID thành tên
      const province = address.provinceCity === "hcm" ? "TP. Hồ Chí Minh" : "Hà Nội"
      const district = address.district === "q1" ? "Quận 1" : "Quận 2"
      const ward = address.ward === "p1" ? "Phường 1" : "Phường 2"
      return `${address.streetAddress}, ${ward}, ${district}, ${province}`
    }
    return "Không có thông tin"
  }

  // Lấy tên phương thức vận chuyển
  const getShippingMethodName = () => {
    const methodId = formData.shippingMethod.shippingMethod
    const methods: Record<string, string> = {
      standard: "Giao hàng tiêu chuẩn (Miễn phí)",
      express: "Giao hàng nhanh (50.000₫)",
      scheduled: "Giao hàng theo lịch hẹn (100.000₫)",
    }
    return methods[methodId] || "Không xác định"
  }

  // Lấy tên phương thức thanh toán
  const getPaymentMethodName = () => {
    const methodId = formData.paymentMethod.paymentMethod
    const methods: Record<string, string> = {
      cod: "Thanh toán khi nhận hàng (COD)",
      bank: "Chuyển khoản ngân hàng",
      card: "Thẻ tín dụng/ghi nợ",
      momo: "Ví điện tử MoMo",
    }
    return methods[methodId] || "Không xác định"
  }

  // Kiểm tra xem có sản phẩm nào có số lượng lớn không
  const hasLargeQuantity = items.some((item) => item.quantity > 5)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-medium">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Xem lại đơn hàng
          </h3>
          <Badge variant="outline" className="px-2 py-1">
            Bước cuối cùng
          </Badge>
        </div>

        {hasLargeQuantity && !showWarning && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Lưu ý</AlertTitle>
            <AlertDescription className="mt-1">
              Bạn đang đặt một số sản phẩm với số lượng lớn. Vui lòng kiểm tra lại để đảm bảo đơn hàng chính xác.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-start justify-between rounded-md bg-muted/50 p-3">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">Địa chỉ giao hàng</p>
                <p className="text-sm text-muted-foreground">{formData.customerInfo.fullName}</p>
                <p className="text-sm text-muted-foreground">{formData.customerInfo.phone}</p>
                <p className="text-sm text-muted-foreground">{getShippingAddress()}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={() => onEdit(2)}>
              <Edit2 className="h-3 w-3" />
              Sửa
            </Button>
          </div>

          <div className="flex items-start justify-between rounded-md bg-muted/50 p-3">
            <div className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">Phương thức vận chuyển</p>
                <p className="text-sm text-muted-foreground">{getShippingMethodName()}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={() => onEdit(3)}>
              <Edit2 className="h-3 w-3" />
              Sửa
            </Button>
          </div>

          <div className="flex items-start justify-between rounded-md bg-muted/50 p-3">
            <div className="flex items-start gap-2">
              <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">Phương thức thanh toán</p>
                <p className="text-sm text-muted-foreground">{getPaymentMethodName()}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={() => onEdit(3)}>
              <Edit2 className="h-3 w-3" />
              Sửa
            </Button>
          </div>

          {formData.notes?.notes && (
            <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">Ghi chú đơn hàng</p>
                <p className="text-sm text-muted-foreground">{formData.notes.notes}</p>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính ({items.length} sản phẩm)</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Giảm giá</span>
            <span className="text-green-600">{discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phí vận chuyển</span>
            <span>
              {formData.shippingMethod.shippingMethod === "standard"
                ? "Miễn phí"
                : formData.shippingMethod.shippingMethod === "express"
                  ? formatCurrency(50000)
                  : formatCurrency(100000)}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-medium">
            <span>Tổng cộng</span>
            <span className="text-lg">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onConfirm} className="min-w-[150px] gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-1">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Đang xử lý...
            </span>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Xác nhận đặt hàng
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

