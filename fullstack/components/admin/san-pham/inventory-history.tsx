"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { ArrowDown, ArrowUp } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface InventoryHistoryProps {
  variantId?: string
}

export function InventoryHistory({ variantId }: InventoryHistoryProps) {
  // Dữ liệu mẫu cho lịch sử cập nhật tồn kho
  const sampleHistory = [
    {
      id: "1",
      product_variant_id: "1",
      previous_quantity: 10,
      new_quantity: 15,
      change_reason: "Nhập hàng mới từ nhà cung cấp ABC",
      admin_user_id: "1",
      admin_user_name: "Nguyễn Văn Admin",
      admin_user_avatar: "/placeholder.svg?height=32&width=32",
      created_at: "2023-06-15T10:30:00Z",
      type: "import",
    },
    {
      id: "2",
      product_variant_id: "1",
      previous_quantity: 15,
      new_quantity: 12,
      change_reason: "Điều chỉnh sau kiểm kê hàng tháng",
      admin_user_id: "1",
      admin_user_name: "Nguyễn Văn Admin",
      admin_user_avatar: "/placeholder.svg?height=32&width=32",
      created_at: "2023-06-20T14:45:00Z",
      type: "adjustment",
    },
    {
      id: "3",
      product_variant_id: "1",
      previous_quantity: 12,
      new_quantity: 15,
      change_reason: "Nhập thêm hàng từ nhà cung cấp XYZ",
      admin_user_id: "2",
      admin_user_name: "Trần Thị Nhân Viên",
      admin_user_avatar: "/placeholder.svg?height=32&width=32",
      created_at: "2023-06-25T09:15:00Z",
      type: "import",
    },
    {
      id: "4",
      product_variant_id: "1",
      previous_quantity: 15,
      new_quantity: 14,
      change_reason: "Đơn hàng #12345",
      admin_user_id: "system",
      admin_user_name: "Hệ thống",
      admin_user_avatar: "/placeholder.svg?height=32&width=32",
      created_at: "2023-06-26T11:30:00Z",
      type: "order",
    },
    {
      id: "5",
      product_variant_id: "1",
      previous_quantity: 14,
      new_quantity: 13,
      change_reason: "Đơn hàng #12346",
      admin_user_id: "system",
      admin_user_name: "Hệ thống",
      admin_user_avatar: "/placeholder.svg?height=32&width=32",
      created_at: "2023-06-27T15:20:00Z",
      type: "order",
    },
    {
      id: "6",
      product_variant_id: "1",
      previous_quantity: 13,
      new_quantity: 15,
      change_reason: "Hoàn trả hàng từ đơn hàng #12345",
      admin_user_id: "2",
      admin_user_name: "Trần Thị Nhân Viên",
      admin_user_avatar: "/placeholder.svg?height=32&width=32",
      created_at: "2023-06-28T10:10:00Z",
      type: "return",
    },
  ]

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "HH:mm - dd/MM/yyyy", { locale: vi })
  }

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case "import":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Nhập hàng
          </Badge>
        )
      case "adjustment":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Điều chỉnh
          </Badge>
        )
      case "order":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Đơn hàng
          </Badge>
        )
      case "return":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Hoàn trả
          </Badge>
        )
      default:
        return <Badge variant="outline">Khác</Badge>
    }
  }

  return (
    <Tabs defaultValue="all">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Tất cả</TabsTrigger>
        <TabsTrigger value="import">Nhập hàng</TabsTrigger>
        <TabsTrigger value="order">Đơn hàng</TabsTrigger>
        <TabsTrigger value="adjustment">Điều chỉnh</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Lịch sử thay đổi</CardTitle>
            <CardDescription>Tất cả các thay đổi tồn kho của sản phẩm</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Trước</TableHead>
                    <TableHead>Sau</TableHead>
                    <TableHead>Thay đổi</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(history.created_at)}</TableCell>
                      <TableCell>{getChangeTypeLabel(history.type)}</TableCell>
                      <TableCell>{history.previous_quantity}</TableCell>
                      <TableCell>{history.new_quantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {history.new_quantity > history.previous_quantity ? (
                            <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                          )}
                          <span
                            className={
                              history.new_quantity > history.previous_quantity ? "text-green-600" : "text-red-600"
                            }
                          >
                            {history.new_quantity > history.previous_quantity ? "+" : ""}
                            {history.new_quantity - history.previous_quantity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={history.change_reason}>
                        {history.change_reason}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={history.admin_user_avatar} alt={history.admin_user_name} />
                            <AvatarFallback>{history.admin_user_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{history.admin_user_name}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="import" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Nhập hàng</CardTitle>
            <CardDescription>Lịch sử nhập hàng của sản phẩm</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trước</TableHead>
                    <TableHead>Sau</TableHead>
                    <TableHead>Thay đổi</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleHistory
                    .filter((history) => history.type === "import")
                    .map((history) => (
                      <TableRow key={history.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(history.created_at)}</TableCell>
                        <TableCell>{history.previous_quantity}</TableCell>
                        <TableCell>{history.new_quantity}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                            <span className="text-green-600">+{history.new_quantity - history.previous_quantity}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={history.change_reason}>
                          {history.change_reason}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={history.admin_user_avatar} alt={history.admin_user_name} />
                              <AvatarFallback>{history.admin_user_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{history.admin_user_name}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="order" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Đơn hàng</CardTitle>
            <CardDescription>Lịch sử thay đổi tồn kho từ đơn hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trước</TableHead>
                    <TableHead>Sau</TableHead>
                    <TableHead>Thay đổi</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleHistory
                    .filter((history) => history.type === "order")
                    .map((history) => (
                      <TableRow key={history.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(history.created_at)}</TableCell>
                        <TableCell>{history.previous_quantity}</TableCell>
                        <TableCell>{history.new_quantity}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                            <span className="text-red-600">{history.new_quantity - history.previous_quantity}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={history.change_reason}>
                          {history.change_reason}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={history.admin_user_avatar} alt={history.admin_user_name} />
                              <AvatarFallback>{history.admin_user_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{history.admin_user_name}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="adjustment" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Điều chỉnh</CardTitle>
            <CardDescription>Lịch sử điều chỉnh tồn kho</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trước</TableHead>
                    <TableHead>Sau</TableHead>
                    <TableHead>Thay đổi</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleHistory
                    .filter((history) => history.type === "adjustment" || history.type === "return")
                    .map((history) => (
                      <TableRow key={history.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(history.created_at)}</TableCell>
                        <TableCell>{history.previous_quantity}</TableCell>
                        <TableCell>{history.new_quantity}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {history.new_quantity > history.previous_quantity ? (
                              <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                            )}
                            <span
                              className={
                                history.new_quantity > history.previous_quantity ? "text-green-600" : "text-red-600"
                              }
                            >
                              {history.new_quantity > history.previous_quantity ? "+" : ""}
                              {history.new_quantity - history.previous_quantity}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={history.change_reason}>
                          {history.change_reason}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={history.admin_user_avatar} alt={history.admin_user_name} />
                              <AvatarFallback>{history.admin_user_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{history.admin_user_name}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

