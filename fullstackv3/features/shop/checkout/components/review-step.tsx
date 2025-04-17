"use client";

import { useCheckout } from "@/features/shop/checkout/checkout-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, User, CreditCard, FileText } from "lucide-react";
import { useAuthQuery } from "@/features/auth/hooks";
import { formatCurrency } from "@/lib/utils/format";

export function ReviewStep() {
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;
  const {
    formData,
    paymentMethods,
    placeOrderHandler,
    isProcessing,
    goToPreviousStep,
    discountCode,
    discountInfo,
  } = useCheckout();

  // Lookup payment method name from fetched list
  const selectedPayment = paymentMethods.find(
    (m) => m.id === formData.paymentMethod
  );
  const paymentName =
    selectedPayment?.name || "Chưa chọn phương thức thanh toán";

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
              {formData.address}, {formData.ward}, {formData.district},{" "}
              {formData.province}
            </p>
          </div>
        </div>

        {/* Guest Info */}
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
                <span className="font-medium">Số điện thoại:</span>{" "}
                {formData.phoneNumber}
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
            <p>{paymentName}</p>
          </div>
        </div>

        {/* Discount Info */}
        {discountInfo && (
          <div className="space-y-2">
            <h3 className="font-medium">Mã giảm giá</h3>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p>
                Mã: <b>{discountCode}</b>
              </p>
              <p>Giảm: {formatCurrency(discountInfo.discountAmount)}</p>
              {discountInfo.discount.max_discount_amount && (
                <p>
                  Tối đa:{" "}
                  {formatCurrency(discountInfo.discount.max_discount_amount)}
                </p>
              )}
              {discountInfo.discount.min_order_value && (
                <p>
                  Đơn tối thiểu:{" "}
                  {formatCurrency(discountInfo.discount.min_order_value)}
                </p>
              )}
            </div>
          </div>
        )}

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

        <Separator />

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={isProcessing}
          >
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
  );
}
