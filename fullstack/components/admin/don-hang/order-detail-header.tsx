"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Copy, ExternalLink, Star, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { OrderStatusBadge } from "@/components/admin/don-hang/order-status-badge"
import { PaymentStatusBadge } from "@/components/admin/don-hang/payment-status-badge"

interface OrderDetailHeaderProps {
  orderId: string
}

export function OrderDetailHeader({ orderId }: OrderDetailHeaderProps) {
  const { toast } = useToast()
  const [isCopying, setIsCopying] = useState(false)

  // Mẫu dữ liệu đơn hàng
  const order = {
    id: orderId,
    orderDate: new Date("2023-06-01T15:30:00"),
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@example.com",
    orderStatus: "Processing",
    paymentStatus: "Paid",
    source: "website",
    priority: "normal",
    isReturningCustomer: true,
  }

  const handleCopyOrderId = () => {
    setIsCopying(true)
    navigator.clipboard.writeText(orderId)

    toast({
      title: "Đã sao chép",
      description: `Mã đơn hàng ${orderId} đã được sao chép vào clipboard`,
      duration: 2000,
    })

    setTimeout(() => {
      setIsCopying(false)
    }, 2000)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Đơn hàng #{orderId}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyOrderId}>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="sr-only">Sao chép mã đơn hàng</span>
                </Button>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/don-hang/xu-ly/${orderId}`} className="gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Xử lý đơn hàng</span>
                </Link>
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">
                Ngày đặt: {format(order.orderDate, "dd/MM/yyyy HH:mm", { locale: vi })}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">{order.customerName}</span>
                </div>
                {order.isReturningCustomer && (
                  <Badge variant="outline" className="gap-1 text-amber-500 border-amber-200 bg-amber-50">
                    <Star className="h-3 w-3 fill-amber-500" />
                    <span>Khách quen</span>
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="flex flex-wrap gap-2 justify-end">
              <OrderStatusBadge status={order.orderStatus} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <Badge variant="outline" className="capitalize">
                Nguồn: {order.source}
              </Badge>
              <Badge
                variant="outline"
                className={
                  order.priority === "high"
                    ? "text-red-500 border-red-200 bg-red-50"
                    : order.priority === "normal"
                      ? "text-blue-500 border-blue-200 bg-blue-50"
                      : "text-green-500 border-green-200 bg-green-50"
                }
              >
                Ưu tiên: {order.priority === "high" ? "Cao" : order.priority === "normal" ? "Thường" : "Thấp"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

