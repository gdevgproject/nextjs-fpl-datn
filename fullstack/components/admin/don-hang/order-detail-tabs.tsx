"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

interface OrderDetailTabsProps {
  orderId: string
}

export function OrderDetailTabs({ orderId }: OrderDetailTabsProps) {
  const [note, setNote] = useState("")

  // Mẫu dữ liệu đơn hàng
  const order = {
    id: orderId,
    items: [
      {
        id: "ITEM-001",
        productId: "PROD-001",
        productName: "Dior Sauvage EDP",
        productSlug: "dior-sauvage-edp",
        variantName: "100ml",
        price: 2500000,
        quantity: 1,
        subtotal: 2500000,
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "ITEM-002",
        productId: "PROD-002",
        productName: "Chanel Bleu de Chanel EDP",
        productSlug: "chanel-bleu-de-chanel-edp",
        variantName: "50ml",
        price: 1800000,
        quantity: 1,
        subtotal: 1800000,
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
    ],
    notes: [
      {
        id: "NOTE-001",
        content: "Khách hàng yêu cầu giao hàng vào buổi sáng",
        createdAt: new Date("2023-06-01T16:30:00"),
        createdBy: {
          id: "USR-001",
          name: "Admin",
          avatar: "/placeholder.svg?height=32&width=32",
        },
      },
      {
        id: "NOTE-002",
        content: "Đã liên hệ với khách hàng để xác nhận đơn hàng",
        createdAt: new Date("2023-06-02T09:15:00"),
        createdBy: {
          id: "USR-002",
          name: "Nhân viên",
          avatar: "/placeholder.svg?height=32&width=32",
        },
      },
    ],
    activityLogs: [
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
    ],
  }

  const handleAddNote = () => {
    // Xử lý thêm ghi chú ở đây
    console.log({
      orderId,
      note,
    })
    setNote("")
  }

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
      <CardContent className="p-0">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger
              value="products"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 text-sm"
            >
              Sản phẩm
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 text-sm"
            >
              Ghi chú
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 text-sm"
            >
              Lịch sử
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 text-sm"
            >
              Tài liệu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="p-4 md:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Hình ảnh</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-center">Số lượng</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="relative h-16 w-16 overflow-hidden rounded-md">
                          <Image
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            href={`/admin/san-pham/${item.productSlug}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-sm text-muted-foreground">Phiên bản: {item.variantName}</p>
                          <p className="text-xs text-muted-foreground">SKU: {item.productId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.price)}
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="p-4 md:p-6 space-y-4">
            <div className="space-y-4">
              {order.notes.length > 0 ? (
                <div className="space-y-4">
                  {order.notes.map((item) => (
                    <div key={item.id} className="flex space-x-4 p-4 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.createdBy.avatar} alt={item.createdBy.name} />
                        <AvatarFallback>{item.createdBy.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{item.createdBy.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(item.createdAt, "dd/MM/yyyy HH:mm", { locale: vi })}
                          </p>
                        </div>
                        <p className="text-sm">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Chưa có ghi chú nào cho đơn hàng này.</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Thêm ghi chú mới</h3>
              <div className="space-y-2">
                <Textarea
                  placeholder="Nhập ghi chú mới..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddNote} disabled={!note.trim()}>
                    Thêm ghi chú
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-4 md:p-6">
            <div className="space-y-4">
              {order.activityLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="mt-0.5">
                    <Badge
                      variant={getActivityBadgeVariant(log.activityType) as any}
                      className="h-8 w-8 rounded-full flex items-center justify-center p-0"
                    >
                      {log.activityType.charAt(0).toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getActivityTypeDisplay(log.activityType)}</Badge>
                        {log.adminUser && (
                          <span className="text-sm">
                            bởi <span className="font-medium">{log.adminUser.name}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(log.timestamp, "dd/MM/yyyy HH:mm", { locale: vi })}
                      </p>
                    </div>
                    <p className="text-sm">{log.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="p-4 md:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Tài liệu đơn hàng</h3>
              <Button variant="outline" size="sm">
                Tải lên tài liệu
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Hóa đơn</p>
                    <p className="text-xs text-muted-foreground">PDF • 256 KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Tải xuống
                </Button>
              </div>

              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Phiếu giao hàng</p>
                    <p className="text-xs text-muted-foreground">PDF • 128 KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Tải xuống
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Tạo tài liệu mới</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>Hóa đơn</span>
                </Button>

                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>Phiếu giao hàng</span>
                </Button>

                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>Biên nhận</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

