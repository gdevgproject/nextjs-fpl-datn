"use client"

import { useCheckout } from "../../providers/checkout-provider"
import { useCartContext } from "../../providers/cart-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, MapPin, User, CreditCard, FileText } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import { useAuth } from "@/lib/providers/auth-context"

export function ReviewStep() {
  const { isAuthenticated } = useAuth()
  const { formData, placeOrderHandler, isProcessing, goToPreviousStep } = useCheckout()
  const { appliedDiscount } = useCartContext()

  // Get payment method name
  const getPaymentMethodName = (id?: number) => {
    switch (id) {
      case 1:
        return "Thanh toán khi nhận hàng (COD)"
      case 2:
        return "Chuyển khoản ngân hàng"
      case 3:
        return "Thanh toán qua ví điện tử"
      default:
        return "Chưa chọn phương thức thanh toán"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xác nhận đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shipping Address */}
        <div className="space-y-2">
          <h3 className="font-medium flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Địa chỉ giao hàng
          </h3>
          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium">{formData.fullName}</p>
            <p>{formData.phoneNumber}</p>
            <p>
              {formData.address}, {formData.ward}, {formData.district}, {formData.province}
            </p>
          </div>
        </div>

        {/* Guest Info (only for non-authenticated users) */}
        {!isAuthenticated && (
          <div className="space-y-2">
            <h3 className="font-medium flex items-center">
              <User className="h-4 w-4 mr-2" />
              Thông tin liên hệ
            </h3>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p>
                <span className="font-medium">Họ tên:</span> {formData.fullName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {formData.email}
              </p>
              <p>
                <span className="font-medium">Số điện thoại:</span> {formData.phoneNumber}
              </p>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="space-y-2">
          <h3 className="font-medium flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Phương thức thanh toán
          </h3>
          <div className="bg-muted p-3 rounded-md text-sm">
            <p>{getPaymentMethodName(formData.paymentMethod)}</p>
          </div>
        </div>

        {/* Delivery Notes */}
        {formData.deliveryNotes && (
          <div className="space-y-2">
            <h3 className="font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Ghi chú
            </h3>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p>{formData.deliveryNotes}</p>
            </div>
          </div>
        )}

        {/* Discount Info */}
        {appliedDiscount && (
          <div className="space-y-2">
            <h3 className="font-medium">Mã giảm giá</h3>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p>
                <span className="font-medium">{appliedDiscount.code}</span> - Giảm {appliedDiscount.discount_percentage}
                %
                {appliedDiscount.max_discount_amount
                  ? ` (tối đa ${formatCurrency(appliedDiscount.max_discount_amount)})`
                  : ""}
              </p>
            </div>
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={goToPreviousStep} disabled={isProcessing}>
            Quay lại
          </Button>
          <Button onClick={placeOrderHandler} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Hoàn tất đơn hàng"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

