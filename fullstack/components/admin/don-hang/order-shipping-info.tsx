"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface OrderShippingInfoProps {
  orderId: string
}

export default function OrderShippingInfo({ orderId }: OrderShippingInfoProps) {
  // Mẫu dữ liệu giao hàng
  const shipping = {
    orderId: orderId,
    recipientName: "Nguyễn Văn A",
    recipientPhone: "0901234567",
    provinceCity: "Hồ Chí Minh",
    district: "Quận 1",
    ward: "Phường Bến Nghé",
    streetAddress: "123 Lê Lợi",
    fullAddress: "123 Lê Lợi, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
    shippingMethod: "Giao hàng tiêu chuẩn",
    trackingNumber: "TN123456789",
    deliveryNotes: "Gọi trước khi giao hàng",
    estimatedDelivery: "2-3 ngày làm việc",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin giao hàng</CardTitle>
        <CardDescription>Chi tiết giao hàng cho đơn hàng #{orderId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Người nhận</p>
            <p className="font-medium">{shipping.recipientName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
            <p className="font-medium">{shipping.recipientPhone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Địa chỉ giao hàng</p>
            <p className="font-medium">{shipping.fullAddress}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Phương thức vận chuyển</p>
            <p className="font-medium">{shipping.shippingMethod}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Thời gian dự kiến</p>
            <p className="font-medium">{shipping.estimatedDelivery}</p>
          </div>
          {shipping.trackingNumber && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mã vận đơn</p>
              <p className="font-medium">{shipping.trackingNumber}</p>
            </div>
          )}
          {shipping.deliveryNotes && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Ghi chú giao hàng</p>
              <p className="font-medium">{shipping.deliveryNotes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

