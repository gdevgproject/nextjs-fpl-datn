"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "@/components/admin/don-hang/order-status-badge"
import { PaymentStatusBadge } from "@/components/admin/don-hang/payment-status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface OrderQuickViewProps {
  order: {
    id: string
    orderDate: Date
    customerName: string
    customerEmail: string
    customerAvatar: string
    orderStatus: string
    paymentStatus: string
    paymentMethod: string
    totalAmount: number
    items: number
    shippingAddress: string
    notes: string
    trackingNumber: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function OrderQuickView({ order, open, onOpenChange }: OrderQuickViewProps) {
  // Giả lập dữ liệu sản phẩm trong đơn hàng
  const orderItems = [
    {
      id: "PROD-001",
      name: "Chanel Coco Mademoiselle",
      variant: "100ml",
      price: 350000,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "PROD-002",
      name: "Dior Sauvage",
      variant: "50ml",
      price: 450000,
      quantity: 2,
      image: "/placeholder.svg?height=80&width=80",
    },
  ]

  // Giả lập lịch sử đơn hàng
  const orderHistory = [
    {
      status: "Pending",
      date: new Date("2023-06-01T10:00:00"),
      description: "Đơn hàng đã được tạo",
    },
    {
      status: "Processing",
      date: new Date("2023-06-01T10:30:00"),
      description: "Đơn hàng đang được xử lý",
    },
    {
      status: "Shipped",
      date: new Date("2023-06-02T14:00:00"),
      description: "Đơn hàng đã được giao cho đơn vị vận chuyển",
    },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center justify-between">
            <span>Đơn hàng {order.id}</span>
            <OrderStatusBadge status={order.orderStatus} />
          </SheetTitle>
          <SheetDescription>Ngày đặt: {format(order.orderDate, "dd/MM/yyyy HH:mm", { locale: vi })}</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Chi tiết</TabsTrigger>
            <TabsTrigger value="products">Sản phẩm</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Thông tin khách hàng</h4>
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={order.customerAvatar} alt={order.customerName} />
                  <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Thông tin thanh toán</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm text-muted-foreground">Phương thức</div>
                  <div>{order.paymentMethod}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Trạng thái</div>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Địa chỉ giao hàng</h4>
              <p className="text-sm">{order.shippingAddress}</p>
            </div>

            {order.trackingNumber && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Mã vận đơn</h4>
                  <Badge variant="outline">{order.trackingNumber}</Badge>
                </div>
              </>
            )}

            {order.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Ghi chú</h4>
                  <p className="text-sm bg-muted p-2 rounded">{order.notes}</p>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Tổng quan đơn hàng</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm text-muted-foreground">Số lượng sản phẩm</div>
                  <div>{order.items}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tổng tiền</div>
                  <div className="font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.totalAmount)}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4 mt-4">
            <h4 className="text-sm font-medium mb-2">Sản phẩm trong đơn hàng</h4>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="h-20 w-20 rounded-md overflow-hidden bg-muted">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">Phiên bản: {item.variant}</div>
                    <div className="text-sm">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.price)}{" "}
                      x {item.quantity}
                    </div>
                    <div className="font-medium mt-1">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(order.totalAmount - 50000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(50000)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Tổng cộng</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(order.totalAmount)}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <h4 className="text-sm font-medium mb-2">Lịch sử đơn hàng</h4>
            <div className="space-y-4">
              {orderHistory.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    {index < orderHistory.length - 1 && (
                      <div className="absolute top-8 bottom-0 left-1/2 w-px -translate-x-1/2 bg-border"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{event.description}</div>
                      <OrderStatusBadge status={event.status} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(event.date, "dd/MM/yyyy HH:mm", { locale: vi })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6 flex-col sm:flex-row gap-2">
          <SheetClose asChild>
            <Button variant="outline">Đóng</Button>
          </SheetClose>
          <Button asChild>
            <Link href={`/admin/don-hang/${order.id}`}>Xem chi tiết đầy đủ</Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

