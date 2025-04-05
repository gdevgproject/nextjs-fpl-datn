"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ActivityTypeBadge } from "./activity-type-badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

// Sample data for demonstration - would be fetched from the database
const timelineData = [
  {
    id: "1",
    activity_type: "product_create",
    description: "Thêm sản phẩm mới: Nước hoa Chanel No.5",
    admin_user_id: "1",
    admin_user_name: "Admin",
    timestamp: new Date("2023-06-15T08:30:00"),
  },
  {
    id: "2",
    activity_type: "product_update",
    description: "Cập nhật sản phẩm: Nước hoa Dior Sauvage",
    admin_user_id: "1",
    admin_user_name: "Admin",
    timestamp: new Date("2023-06-15T09:45:00"),
  },
  {
    id: "3",
    activity_type: "order_status_update",
    description: "Cập nhật trạng thái đơn hàng #ORD12345 từ 'Đang xử lý' sang 'Đang giao hàng'",
    admin_user_id: "2",
    admin_user_name: "Nhân viên",
    timestamp: new Date("2023-06-15T10:15:00"),
  },
  {
    id: "4",
    activity_type: "discount_create",
    description: "Tạo mã giảm giá mới: SUMMER2023",
    admin_user_id: "1",
    admin_user_name: "Admin",
    timestamp: new Date("2023-06-15T11:30:00"),
  },
  {
    id: "5",
    activity_type: "user_role_update",
    description: "Cập nhật quyền người dùng: tran.thi.b@example.com từ 'User' sang 'Staff'",
    admin_user_id: "1",
    admin_user_name: "Admin",
    timestamp: new Date("2023-06-15T13:45:00"),
  },
]

interface ActivityLogTimelineProps {
  onViewDetail: (log: any) => void
}

export function ActivityLogTimeline({ onViewDetail }: ActivityLogTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dòng thời gian hoạt động</CardTitle>
        <CardDescription>Các hoạt động gần đây của quản trị viên</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="relative border-l border-muted pl-6 pb-2">
            {timelineData.map((item, index) => (
              <div key={item.id} className="mb-8 relative">
                <div className="absolute -left-[27px] mt-1.5 h-4 w-4 rounded-full border border-background bg-muted"></div>
                <time className="mb-1 text-sm font-normal leading-none text-muted-foreground">
                  {format(item.timestamp, "HH:mm - dd/MM/yyyy", { locale: vi })}
                </time>
                <div className="flex items-center gap-2 mb-1 mt-2">
                  <ActivityTypeBadge type={item.activity_type} />
                  <span className="text-sm font-medium">{item.admin_user_name}</span>
                </div>
                <p className="mb-2 text-base font-normal">{item.description}</p>
                <Button variant="ghost" size="sm" onClick={() => onViewDetail(item)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Xem chi tiết
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

