"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface OrderDetailSummaryProps {
  orderId: string
}

export function OrderDetailSummary({ orderId }: OrderDetailSummaryProps) {
  // Mẫu dữ liệu đơn hàng
  const order = {
    id: orderId,
    totalAmount: 2150000,
    subtotal: 4300000,
    discount: 2150000,
    shippingFee: 0,
    customer: {
      id: "USR-001",
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0901234567",
      avatar: "/placeholder.svg?height=40&width=40",
      totalOrders: 5,
      totalSpent: 12500000,
      memberSince: "01/2023",
    },
    shippingAddress: {
      recipientName: "Nguyễn Văn A",
      recipientPhone: "0901234567",
      provinceCity: "Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      streetAddress: "123 Lê Lợi",
      fullAddress: "123 Lê Lợi, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
    },
    paymentMethod: {
      id: "banking",
      name: "Chuyển khoản ngân hàng",
      details: "Vietcombank - Chi nhánh Hồ Chí Minh",
    },
    deliveryNotes: "Gọi trước khi giao hàng",
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger
              value="summary"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 text-sm"
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="customer"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 text-sm"
            >
              Khách hàng
            </TabsTrigger>
            <TabsTrigger
              value="shipping"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 text-sm"
            >
              Giao hàng
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 text-sm"
            >
              Thanh toán
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Thông tin khách hàng</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                    <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Địa chỉ giao hàng</h3>
                <p className="font-medium">{order.shippingAddress.recipientName}</p>
                <p className="text-sm">{order.shippingAddress.fullAddress}</p>
                <p className="text-sm">{order.shippingAddress.recipientPhone}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Tổng quan đơn hàng</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tạm tính</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.subtotal)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Giảm giá</p>
                  <p className="font-medium text-destructive">
                    -
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.discount)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phí vận chuyển</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.shippingFee)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tổng cộng</p>
                  <p className="font-bold text-lg">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {order.deliveryNotes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Ghi chú giao hàng</h3>
                  <p className="text-sm p-3 bg-muted rounded-md">{order.deliveryNotes}</p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="customer" className="p-4 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{order.customer.name}</h3>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>{order.customer.email}</span>
                  <span className="hidden md:inline">•</span>
                  <span>{order.customer.phone}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="secondary">Khách hàng từ {order.customer.memberSince}</Badge>
                  <Badge variant="outline">{order.customer.totalOrders} đơn hàng</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium">Tổng đơn hàng</h4>
                <p className="text-2xl font-bold">{order.customer.totalOrders}</p>
              </div>

              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium">Tổng chi tiêu</h4>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(order.customer.totalSpent)}
                </p>
              </div>

              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium">Giá trị trung bình</h4>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(order.customer.totalSpent / order.customer.totalOrders)}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="p-4 md:p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Địa chỉ giao hàng</h3>
              <div className="p-4 border rounded-md">
                <p className="font-medium">{order.shippingAddress.recipientName}</p>
                <p className="text-sm">{order.shippingAddress.recipientPhone}</p>
                <p className="text-sm mt-2">{order.shippingAddress.fullAddress}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Phương thức vận chuyển</h3>
              <div className="p-4 border rounded-md">
                <p className="font-medium">Giao hàng tiêu chuẩn</p>
                <p className="text-sm text-muted-foreground">Thời gian giao hàng: 2-3 ngày làm việc</p>
                <p className="text-sm mt-2">
                  Phí vận chuyển:{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(order.shippingFee)}
                </p>
              </div>
            </div>

            {order.deliveryNotes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Ghi chú giao hàng</h3>
                  <div className="p-4 border rounded-md">
                    <p className="text-sm">{order.deliveryNotes}</p>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="payment" className="p-4 md:p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Phương thức thanh toán</h3>
              <div className="p-4 border rounded-md">
                <p className="font-medium">{order.paymentMethod.name}</p>
                {order.paymentMethod.details && (
                  <p className="text-sm text-muted-foreground mt-1">{order.paymentMethod.details}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Chi tiết thanh toán</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Tạm tính:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Giảm giá:</span>
                  <span className="font-medium text-destructive">
                    -
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.discount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Phí vận chuyển:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.shippingFee)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Tổng cộng:</span>
                  <span className="font-bold">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

