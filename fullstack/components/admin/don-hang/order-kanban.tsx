"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PaymentStatusBadge } from "@/components/admin/don-hang/payment-status-badge"
import OrderQuickView from "@/components/admin/don-hang/order-quick-view"

interface OrderKanbanProps {
  status?: string
}

export default function OrderKanban({ status }: OrderKanbanProps) {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  // Giả lập dữ liệu đơn hàng
  const orders = [
    {
      id: "ORD-001",
      orderDate: new Date("2023-06-01"),
      customerName: "Nguyễn Văn A",
      customerEmail: "nguyenvana@example.com",
      customerAvatar: "",
      orderStatus: "Pending",
      paymentStatus: "Pending",
      paymentMethod: "COD",
      totalAmount: 1250000,
      items: 3,
      shippingAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
      notes: "Gọi trước khi giao hàng",
      trackingNumber: "",
    },
    {
      id: "ORD-002",
      orderDate: new Date("2023-06-02"),
      customerName: "Trần Thị B",
      customerEmail: "tranthib@example.com",
      customerAvatar: "",
      orderStatus: "Processing",
      paymentStatus: "Paid",
      paymentMethod: "Banking",
      totalAmount: 2150000,
      items: 5,
      shippingAddress: "456 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      notes: "",
      trackingNumber: "",
    },
    {
      id: "ORD-003",
      orderDate: new Date("2023-06-03"),
      customerName: "Lê Văn C",
      customerEmail: "levanc@example.com",
      customerAvatar: "",
      orderStatus: "Shipped",
      paymentStatus: "Paid",
      paymentMethod: "Momo",
      totalAmount: 1850000,
      items: 2,
      shippingAddress: "789 Đường Lý Tự Trọng, Quận 1, TP.HCM",
      notes: "Để hàng tại bảo vệ",
      trackingNumber: "VN123456789",
    },
    {
      id: "ORD-004",
      orderDate: new Date("2023-06-04"),
      customerName: "Phạm Thị D",
      customerEmail: "phamthid@example.com",
      customerAvatar: "",
      orderStatus: "Delivered",
      paymentStatus: "Paid",
      paymentMethod: "Banking",
      totalAmount: 3250000,
      items: 7,
      shippingAddress: "101 Đường Hai Bà Trưng, Quận 1, TP.HCM",
      notes: "",
      trackingNumber: "VN987654321",
    },
    {
      id: "ORD-005",
      orderDate: new Date("2023-06-05"),
      customerName: "Hoàng Văn E",
      customerEmail: "hoangvane@example.com",
      customerAvatar: "",
      orderStatus: "Cancelled",
      paymentStatus: "Refunded",
      paymentMethod: "Banking",
      totalAmount: 1950000,
      items: 4,
      shippingAddress: "202 Đường Điện Biên Phủ, Quận 3, TP.HCM",
      notes: "Khách hàng đổi ý",
      trackingNumber: "",
    },
    {
      id: "ORD-006",
      orderDate: new Date("2023-06-06"),
      customerName: "Vũ Thị F",
      customerEmail: "vuthif@example.com",
      customerAvatar: "",
      orderStatus: "Pending",
      paymentStatus: "Pending",
      paymentMethod: "COD",
      totalAmount: 850000,
      items: 1,
      shippingAddress: "303 Đường Cách Mạng Tháng 8, Quận 3, TP.HCM",
      notes: "",
      trackingNumber: "",
    },
    {
      id: "ORD-007",
      orderDate: new Date("2023-06-07"),
      customerName: "Đặng Văn G",
      customerEmail: "dangvang@example.com",
      customerAvatar: "",
      orderStatus: "Processing",
      paymentStatus: "Paid",
      paymentMethod: "ZaloPay",
      totalAmount: 1650000,
      items: 3,
      shippingAddress: "404 Đường Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
      notes: "Giao hàng giờ hành chính",
      trackingNumber: "",
    },
    {
      id: "ORD-008",
      orderDate: new Date("2023-06-08"),
      customerName: "Bùi Thị H",
      customerEmail: "buithih@example.com",
      customerAvatar: "",
      orderStatus: "Shipped",
      paymentStatus: "Paid",
      paymentMethod: "VNPay",
      totalAmount: 2750000,
      items: 6,
      shippingAddress: "505 Đường Võ Văn Tần, Quận 3, TP.HCM",
      notes: "",
      trackingNumber: "VN456789123",
    },
  ]

  // Filter orders by status if provided
  const filteredOrders = status ? orders.filter((order) => order.orderStatus === status) : orders

  // Group orders by status
  const ordersByStatus = {
    Pending: filteredOrders.filter((order) => order.orderStatus === "Pending"),
    Processing: filteredOrders.filter((order) => order.orderStatus === "Processing"),
    Shipped: filteredOrders.filter((order) => order.orderStatus === "Shipped"),
    Delivered: filteredOrders.filter((order) => order.orderStatus === "Delivered"),
    Cancelled: filteredOrders.filter((order) => order.orderStatus === "Cancelled"),
  }

  const handleDragEnd = (result: any) => {
    // Handle drag and drop logic here
    console.log(result)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-700"
      case "Processing":
        return "bg-blue-50 border-blue-200 text-blue-700"
      case "Shipped":
        return "bg-indigo-50 border-indigo-200 text-indigo-700"
      case "Delivered":
        return "bg-green-50 border-green-200 text-green-700"
      case "Cancelled":
        return "bg-red-50 border-red-200 text-red-700"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Pending":
        return "Chờ xử lý"
      case "Processing":
        return "Đang xử lý"
      case "Shipped":
        return "Đang giao hàng"
      case "Delivered":
        return "Đã giao hàng"
      case "Cancelled":
        return "Đã hủy"
      default:
        return status
    }
  }

  return (
    <div className="overflow-x-auto pb-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 min-w-[1000px]">
          {Object.entries(ordersByStatus).map(([status, statusOrders]) => (
            <div key={status} className="flex-1 min-w-[250px]">
              <Card className={`${getStatusColor(status)} border`}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>{getStatusLabel(status)}</span>
                    <Badge variant="outline" className="bg-white">
                      {statusOrders.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 min-h-[200px]">
                        {statusOrders.map((order, index) => (
                          <Draggable key={order.id} draggableId={order.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white rounded-md shadow-sm border p-3"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <Link
                                    href={`/admin/don-hang/${order.id}`}
                                    className="font-medium text-blue-600 hover:underline"
                                  >
                                    {order.id}
                                  </Link>
                                  <div className="flex">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        setSelectedOrder(order)
                                        setQuickViewOpen(true)
                                      }}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>

                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-6 w-6 p-0">
                                          <span className="sr-only">Mở menu</span>
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                          <Link href={`/admin/don-hang/${order.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Xem chi tiết
                                          </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600">Hủy đơn hàng</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={order.customerAvatar} alt={order.customerName} />
                                    <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="text-sm">{order.customerName}</div>
                                </div>

                                <div className="flex justify-between items-center mb-2">
                                  <div className="text-xs text-muted-foreground">
                                    {format(order.orderDate, "dd/MM/yyyy", { locale: vi })}
                                  </div>
                                  <PaymentStatusBadge status={order.paymentStatus} />
                                </div>

                                <div className="flex justify-between items-center">
                                  <div className="text-xs text-muted-foreground">{order.items} sản phẩm</div>
                                  <div className="font-medium text-sm">
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(order.totalAmount)}
                                  </div>
                                </div>

                                {order.notes && (
                                  <div className="mt-2 text-xs bg-amber-50 p-1 rounded border border-amber-200">
                                    {order.notes}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>

      {selectedOrder && <OrderQuickView order={selectedOrder} open={quickViewOpen} onOpenChange={setQuickViewOpen} />}
    </div>
  )
}

