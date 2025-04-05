"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { OrderStatusBadge } from "@/components/admin/don-hang/order-status-badge"
import Link from "next/link"
import OrderQuickView from "@/components/admin/don-hang/order-quick-view"

interface OrderCalendarProps {
  status?: string
}

export default function OrderCalendar({ status }: OrderCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
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
  ]

  // Filter orders by status if provided
  const filteredOrders = status ? orders.filter((order) => order.orderStatus === status) : orders

  // Get days of current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  // Get orders for selected date
  const ordersForSelectedDate = filteredOrders.filter((order) => isSameDay(order.orderDate, selectedDate))

  // Get previous month
  const handlePreviousMonth = () => {
    const previousMonth = new Date(currentDate)
    previousMonth.setMonth(previousMonth.getMonth() - 1)
    setCurrentDate(previousMonth)
  }

  // Get next month
  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setCurrentDate(nextMonth)
  }

  // Get today
  const handleToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Get order count for a specific day
  const getOrderCountForDay = (day: Date) => {
    return filteredOrders.filter((order) => isSameDay(order.orderDate, day)).length
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-medium">{format(currentDate, "MMMM yyyy", { locale: vi })}</div>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleToday}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Hôm nay
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day, index) => (
          <div key={index} className="text-center text-sm font-medium py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, index) => (
          <div key={`empty-${index}`} className="h-24 border rounded-md bg-muted/20"></div>
        ))}

        {daysInMonth.map((day) => {
          const orderCount = getOrderCountForDay(day)
          const isSelected = isSameDay(day, selectedDate)
          const isCurrentDay = isToday(day)

          return (
            <Button
              key={day.toString()}
              variant="outline"
              className={`h-24 flex flex-col items-start justify-start p-2 hover:bg-muted ${
                isSelected ? "border-primary border-2" : ""
              } ${isCurrentDay ? "bg-muted/50" : ""}`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="self-end font-medium">{format(day, "d")}</div>
              {orderCount > 0 && (
                <Badge className="mt-auto self-end" variant="secondary">
                  {orderCount} đơn
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Đơn hàng ngày {format(selectedDate, "dd/MM/yyyy", { locale: vi })}</h3>

        {ordersForSelectedDate.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Không có đơn hàng nào vào ngày này
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {ordersForSelectedDate.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/don-hang/${order.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {order.id}
                        </Link>
                        <OrderStatusBadge status={order.orderStatus} />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(order.orderDate, "HH:mm", { locale: vi })} - {order.customerName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.totalAmount)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          setSelectedOrder(order)
                          setQuickViewOpen(true)
                        }}
                      >
                        Xem nhanh
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {selectedOrder && <OrderQuickView order={selectedOrder} open={quickViewOpen} onOpenChange={setQuickViewOpen} />}
    </div>
  )
}

