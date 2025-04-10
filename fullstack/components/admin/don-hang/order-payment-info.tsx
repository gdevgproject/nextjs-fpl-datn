"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentStatusBadge } from "@/components/admin/don-hang/payment-status-badge"

interface OrderPaymentInfoProps {
  orderId: string
}

export default function OrderPaymentInfo({ orderId }: OrderPaymentInfoProps) {
  // Mẫu dữ liệu thanh toán
  const payment = {
    id: "PAY-001",
    orderId: orderId,
    paymentMethod: "Banking",
    paymentStatus: "Paid",
    amount: 2150000,
    transactionId: "TXN123456789",
    paymentDate: new Date("2023-06-01T15:35:00"),
    bankName: "Vietcombank",
    accountNumber: "XXXX-XXXX-1234",
    notes: "Thanh toán đơn hàng #ORD-001",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin thanh toán</CardTitle>
        <CardDescription>Chi tiết thanh toán cho đơn hàng #{orderId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Mã thanh toán</p>
            <p className="font-medium">{payment.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Phương thức thanh toán</p>
            <p className="font-medium">{payment.paymentMethod}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Trạng thái thanh toán</p>
            <PaymentStatusBadge status={payment.paymentStatus} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Số tiền</p>
            <p className="font-medium">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(payment.amount)}
            </p>
          </div>
          {payment.transactionId && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mã giao dịch</p>
              <p className="font-medium">{payment.transactionId}</p>
            </div>
          )}
          {payment.paymentDate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ngày thanh toán</p>
              <p className="font-medium">{format(payment.paymentDate, "dd/MM/yyyy HH:mm", { locale: vi })}</p>
            </div>
          )}
          {payment.bankName && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ngân hàng</p>
              <p className="font-medium">{payment.bankName}</p>
            </div>
          )}
          {payment.accountNumber && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Số tài khoản</p>
              <p className="font-medium">{payment.accountNumber}</p>
            </div>
          )}
          {payment.notes && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Ghi chú</p>
              <p className="font-medium">{payment.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

