"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OrderActivityLogProps {
  orderId: string
}

export function OrderActivityLog({ orderId }: OrderActivityLogProps) {
  // Mẫu dữ liệu nhật ký hoạt động
  const activityLogs = [
    {
      id: "log-001",
      timestamp: new Date("2023-06-01T15:30:00"),
      activityType: "order_created",
      description: "Đơn hàng được tạo",
      adminUser: null,
    },
    {
      id: "log-002",
      timestamp: new Date("2023-06-01T15:35:00"),
      activityType: "payment_received",
      description: "Thanh toán đã được xác nhận",
      adminUser: null,
    },
    {
      id: "log-003",
      timestamp: new Date("2023-06-01T16:45:00"),
      activityType: "status_updated",
      description: "Trạng thái đơn hàng được cập nhật từ 'Pending' sang 'Processing'",
      adminUser: {
        id: "admin-001",
        name: "Nguyễn Thị B",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    },
    {
      id: "log-004",
      timestamp: new Date("2023-06-02T09:15:00"),
      activityType: "note_added",
      description: "Ghi chú nội bộ được thêm: 'Đã liên hệ với khách hàng để xác nhận đơn hàng'",
      adminUser: {
        id: "admin-002",
        name: "Trần Văn C",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    },
    {
      id: "log-005",
      timestamp: new Date("2023-06-02T14:30:00"),
      activityType: "status_updated",
      description: "Trạng thái đơn hàng được cập nhật từ 'Processing' sang 'Shipped'",
      adminUser: {
        id: "admin-001",
        name: "Nguyễn Thị B",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    },
    {
      id: "log-006",
      timestamp: new Date("2023-06-02T14:31:00"),
      activityType: "inventory_updated",
      description: "Tồn kho được cập nhật tự động",
      adminUser: null,
    },
    {
      id: "log-007",
      timestamp: new Date("2023-06-02T14:35:00"),
      activityType: "email_sent",
      description: "Email thông báo đã được gửi đến khách hàng",
      adminUser: {
        id: "admin-001",
        name: "Nguyễn Thị B",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    },
  ]

  // Hàm lấy màu badge dựa trên loại hoạt động
  const getActivityBadgeVariant = (activityType: string) => {
    switch (activityType) {
      case "order_created":
        return "default"
      case "payment_received":
        return "success"
      case "status_updated":
        return "info"
      case "note_added":
        return "secondary"
      case "inventory_updated":
        return "warning"
      case "email_sent":
        return "outline"
      default:
        return "default"
    }
  }

  // Hàm lấy tên hiển thị của loại hoạt động
  const getActivityTypeDisplay = (activityType: string) => {
    switch (activityType) {
      case "order_created":
        return "Tạo đơn hàng"
      case "payment_received":
        return "Nhận thanh toán"
      case "status_updated":
        return "Cập nhật trạng thái"
      case "note_added":
        return "Thêm ghi chú"
      case "inventory_updated":
        return "Cập nhật tồn kho"
      case "email_sent":
        return "Gửi email"
      default:
        return activityType
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nhật ký hoạt động</CardTitle>
        <CardDescription>Lịch sử các hoạt động trên đơn hàng #{orderId}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Thời gian</TableHead>
              <TableHead className="w-[150px]">Loại hoạt động</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-[200px]">Người thực hiện</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {format(log.timestamp, "dd/MM/yyyy HH:mm", { locale: vi })}
                </TableCell>
                <TableCell>
                  <Badge variant={getActivityBadgeVariant(log.activityType) as any}>
                    {getActivityTypeDisplay(log.activityType)}
                  </Badge>
                </TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell>
                  {log.adminUser ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={log.adminUser.avatar} alt={log.adminUser.name} />
                        <AvatarFallback>{log.adminUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{log.adminUser.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Hệ thống</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

