"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Eye } from "lucide-react"
import { ActivityTypeBadge } from "./activity-type-badge"
import { cn } from "@/lib/utils"

// Sample data for demonstration - would be fetched from the database
const activityLogData = [
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

interface ActivityLogMobileViewProps {
  onViewDetail: (log: any) => void
}

export function ActivityLogMobileView({ onViewDetail }: ActivityLogMobileViewProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="space-y-4 md:hidden">
      {activityLogData.map((log) => (
        <Card key={log.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 cursor-pointer flex justify-between items-center" onClick={() => toggleExpand(log.id)}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ActivityTypeBadge type={log.activity_type} />
                  <span className="text-sm font-medium">{format(log.timestamp, "HH:mm", { locale: vi })}</span>
                </div>
                <p className={cn("text-sm", !expandedItems[log.id] && "line-clamp-1")}>{log.description}</p>
              </div>
              {expandedItems[log.id] ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>

            {expandedItems[log.id] && (
              <div className="px-4 pb-4 pt-0 border-t border-border mt-2 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Thời gian</p>
                    <p>{format(log.timestamp, "HH:mm - dd/MM/yyyy", { locale: vi })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Người thực hiện</p>
                    <p>{log.admin_user_name}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => onViewDetail(log)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

