"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OrderDetailTimelineProps {
  orderId: string
}

export function OrderDetailTimeline({ orderId }: OrderDetailTimelineProps) {
  // Mẫu dữ liệu lịch sử đơn hàng
  const timeline = [
    {
      id: "step-1",
      status: "Đơn hàng được tạo",
      description: "Đơn hàng đã được tạo thành công",
      date: new Date("2023-06-01T15:30:00"),
      isCompleted: true,
      user: null,
    },
    {
      id: "step-2",
      status: "Thanh toán thành công",
      description: "Thanh toán đã được xác nhận qua Chuyển khoản ngân hàng",
      date: new Date("2023-06-01T15:35:00"),
      isCompleted: true,
      user: null,
    },
    {
      id: "step-3",
      status: "Đang xử lý",
      description: "Đơn hàng đang được xử lý",
      date: new Date("2023-06-01T16:45:00"),
      isCompleted: true,
      user: {
        id: "admin-001",
        name: "Nguyễn Thị B",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    },
    {
      id: "step-4",
      status: "Đã giao cho vận chuyển",
      description: "Đơn hàng đã được giao cho đơn vị vận chuyển",
      date: new Date("2023-06-02T09:15:00"),
      isCompleted: false,
      user: null,
    },
    {
      id: "step-5",
      status: "Đã giao hàng",
      description: "Đơn hàng đã được giao thành công",
      date: null,
      isCompleted: false,
      user: null,
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Lịch sử đơn hàng</CardTitle>
        <CardDescription>Theo dõi trạng thái đơn hàng</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative border-l border-muted">
          {timeline.map((item, index) => (
            <li key={item.id} className="mb-6 ml-6 last:mb-0">
              <span
                className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-background ${
                  item.isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </span>
              <div className="p-3 bg-muted/40 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="flex items-center text-base font-semibold">
                    {item.status}
                    {item.isCompleted && (
                      <Badge variant="success" className="ml-2">
                        Hoàn thành
                      </Badge>
                    )}
                  </h3>
                  {item.date && (
                    <time className="text-xs text-muted-foreground">
                      {format(item.date, "dd/MM/yyyy HH:mm", { locale: vi })}
                    </time>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                {item.user && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={item.user.avatar} alt={item.user.name} />
                      <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">Cập nhật bởi {item.user.name}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

