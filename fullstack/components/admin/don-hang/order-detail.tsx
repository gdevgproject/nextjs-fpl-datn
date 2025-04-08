"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatusBadge } from "@/components/admin/don-hang/order-status-badge"
import { PaymentStatusBadge } from "@/components/admin/don-hang/payment-status-badge"

interface OrderDetailProps {
  orderId: string
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  // Mẫu dữ liệu đơn hàng
  const order = {
    id: orderId,
    orderDate: new Date("2023-06-01T15:30:00"),
    orderStatus: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "Banking",
    totalAmount: 2150000,
    customer: {
      id: "USR-001",
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0901234567",
    },
    shippingAddress: {
      recipientName: "Nguyễn Văn A",
      recipientPhone: "0901234567",
      provinceCity: "Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      streetAddress: "123 Lê Lợi",
    },
    deliveryNotes: "Gọi trước khi giao hàng",
    trackingNumber: "TN123456789",
    items: [
      {
        id: "ITEM-001",
        productName: "Dior Sauvage EDP",
        variantName: "100ml",
        price: 2500000,
        quantity: 1,
        subtotal: 2500000,
      },
      {
        id: "ITEM-002",
        productName: "Chanel Bleu de Chanel EDP",
        variantName: "50ml",
        price: 1800000,
        quantity: 1,
        subtotal: 1800000,
      },
    ],
    subtotal: 4300000,
    discount: 2150000,
    shippingFee: 0,
    total: 2150000,
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đơn hàng</CardTitle>
          <CardDescription>Chi tiết đơn hàng #{orderId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mã đơn hàng</p>
              <p className="font-medium">{order.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ngày đặt hàng</p>
              <p className="font-medium">{format(order.orderDate, "dd/MM/yyyy HH:mm", { locale: vi })}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trạng thái đơn hàng</p>
              <OrderStatusBadge status={order.orderStatus} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trạng thái thanh toán</p>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phương thức thanh toán</p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng tiền</p>
              <p className="font-medium">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(order.totalAmount)}
              </p>
            </div>
            {order.trackingNumber && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Mã vận đơn</p>
                <p className="font-medium">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin khách hàng</CardTitle>
          <CardDescription>Chi tiết khách hàng đặt hàng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tên khách hàng</p>
            <p className="font-medium">{order.customer.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="font-medium">{order.customer.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
            <p className="font-medium">{order.customer.phone}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

