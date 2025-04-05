"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { ActivityTypeBadge } from "./activity-type-badge"

// Sample data for demonstration - would be fetched from the database
const activityLogData = [
  {
    id: "1",
    activity_type: "product_create",
    description: "Thêm sản phẩm mới: Nước hoa Chanel No.5",
    admin_user_id: "1",
    admin_user_name: "Admin",
    timestamp: new Date("2023-06-15T08:30:00"),
    details: { product_id: 123, product_name: "Chanel No.5", price: 2500000 },
  },
  {
    id: "2",
    activity_type: "product_update",
    description: "Cập nhật sản phẩm: Nước hoa Dior Sauvage",
    admin_user_id: "1",
    admin_user_name: "Admin",
    timestamp: new Date("2023-06-15T09:45:00"),
    details: {
      product_id: 124,
      changes: {
        price: { old: 2300000, new: 2400000 },
        stock: { old: 10, new: 15 },
      },
    },
  },
  {
    id: "3",
    activity_type: "order_status_update",
    description: "Cập nhật trạng thái đơn hàng #ORD12345 từ 'Đang xử lý' sang 'Đang giao hàng'",
    admin_user_id: "2",
    admin_user_name: "Nhân viên",
    timestamp: new Date("2023-06-15T10:15:00"),
    details: {
      order_id: "ORD12345",
      old_status: "Đang xử lý",
      new_status: "Đang giao hàng",
    },
  },
  {
    id: "4",
    activity_type: "discount_create",
    description: "Tạo mã giảm giá mới: SUMMER2023",
    admin_user_id: "1",
    admin_user_name: "Admin",
    timestamp: new Date("2023-06-15T11:30:00"),
    details: {
      discount_code: "SUMMER2023",
      discount_amount: 15,
      discount_type: "percent",
      valid_until: "2023-08-31",
    },
  },
  {
    id: "5",
    activity_type: "user_role_update",
    description: "Cập nhật quyền người dùng: tran.thi.b@example.com từ 'User' sang 'Staff'",
    admin_user_id: "1",
    admin_user_name: "Admin",
    timestamp: new Date("2023-06-15T13:45:00"),
    details: {
      user_id: 456,
      user_email: "tran.thi.b@example.com",
      old_role: "User",
      new_role: "Staff",
    },
  },
]

interface ActivityLogListProps {
  onViewDetail?: (log: any) => void
}

export function ActivityLogList({ onViewDetail }: ActivityLogListProps) {
  return (
    <div className="rounded-md border hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Thời gian</TableHead>
            <TableHead className="w-[150px]">Loại hoạt động</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead className="w-[150px]">Người thực hiện</TableHead>
            <TableHead className="w-[100px] text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activityLogData.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">
                {format(log.timestamp, "HH:mm - dd/MM/yyyy", { locale: vi })}
              </TableCell>
              <TableCell>
                <ActivityTypeBadge type={log.activity_type} />
              </TableCell>
              <TableCell>{log.description}</TableCell>
              <TableCell>{log.admin_user_name}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onViewDetail?.(log)}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Xem chi tiết</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

