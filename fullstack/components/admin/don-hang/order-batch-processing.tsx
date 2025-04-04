"use client"

import { useState } from "react"
import {
  Check,
  ChevronDown,
  Filter,
  Loader2,
  Package,
  Printer,
  RefreshCw,
  Search,
  Truck,
  X,
  ArrowLeft,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderStatusBadge } from "@/components/admin/don-hang/order-status-badge"
import { PaymentStatusBadge } from "@/components/admin/don-hang/payment-status-badge"

interface OrderBatchProcessingProps {
  onBack: () => void
}

export function OrderBatchProcessing({ onBack }: OrderBatchProcessingProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Mẫu dữ liệu đơn hàng
  const orders = [
    {
      id: "ORD-001",
      customerName: "Nguyễn Văn A",
      orderDate: "01/06/2023",
      status: "Pending",
      paymentStatus: "Paid",
      total: 1250000,
      items: 3,
    },
    {
      id: "ORD-002",
      customerName: "Trần Thị B",
      orderDate: "01/06/2023",
      status: "Pending",
      paymentStatus: "Pending",
      total: 850000,
      items: 2,
    },
    {
      id: "ORD-003",
      customerName: "Lê Văn C",
      orderDate: "02/06/2023",
      status: "Processing",
      paymentStatus: "Paid",
      total: 1750000,
      items: 4,
    },
    {
      id: "ORD-004",
      customerName: "Phạm Thị D",
      orderDate: "02/06/2023",
      status: "Pending",
      paymentStatus: "Paid",
      total: 950000,
      items: 2,
    },
    {
      id: "ORD-005",
      customerName: "Hoàng Văn E",
      orderDate: "03/06/2023",
      status: "Pending",
      paymentStatus: "Paid",
      total: 2150000,
      items: 5,
    },
  ]

  // Lọc đơn hàng theo trạng thái và tìm kiếm
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Xử lý khi chọn/bỏ chọn tất cả
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id))
    }
    setSelectAll(!selectAll)
  }

  // Xử lý khi chọn/bỏ chọn một đơn hàng
  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId))
    } else {
      setSelectedOrders((prev) => [...prev, orderId])
    }
  }

  // Xử lý khi cập nhật trạng thái hàng loạt
  const handleBatchUpdateStatus = (newStatus: string) => {
    if (selectedOrders.length === 0) {
      toast({
        title: "Chưa chọn đơn hàng",
        description: "Vui lòng chọn ít nhất một đơn hàng để cập nhật",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Giả lập cập nhật trạng thái
    setTimeout(() => {
      setIsProcessing(false)

      toast({
        title: "Cập nhật thành công",
        description: `Đã cập nhật ${selectedOrders.length} đơn hàng sang trạng thái ${newStatus}`,
      })

      // Reset selection
      setSelectedOrders([])
      setSelectAll(false)
    }, 1500)
  }

  // Xử lý khi in đơn hàng hàng loạt
  const handleBatchPrint = () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "Chưa chọn đơn hàng",
        description: "Vui lòng chọn ít nhất một đơn hàng để in",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Đang chuẩn bị in",
      description: `Đang chuẩn bị in ${selectedOrders.length} đơn hàng`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Quay lại</span>
            </Button>
            <div>
              <CardTitle>Xử lý hàng loạt</CardTitle>
              <CardDescription>Xử lý nhiều đơn hàng cùng lúc</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <span>Đã chọn:</span>
              <span className="font-bold">{selectedOrders.length}</span>
            </Badge>

            <Button variant="outline" size="sm" className="gap-1" onClick={() => setSelectedOrders([])}>
              <X className="h-3 w-3" />
              <span>Bỏ chọn tất cả</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm đơn hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] gap-1">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Pending">Chờ xử lý</SelectItem>
                <SelectItem value="Processing">Đang xử lý</SelectItem>
                <SelectItem value="Shipped">Đã giao cho vận chuyển</SelectItem>
                <SelectItem value="Delivered">Đã giao hàng</SelectItem>
                <SelectItem value="Cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Làm mới</span>
            </Button>
          </div>
        </div>

        <Separator />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Chọn tất cả" />
                </TableHead>
                <TableHead>Mã đơn hàng</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Không tìm thấy đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => handleSelectOrder(order.id)}
                        aria-label={`Chọn đơn hàng ${order.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("vi-VN").format(order.total)} VND
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchPrint}
            disabled={selectedOrders.length === 0}
            className="gap-1"
          >
            <Printer className="h-4 w-4" />
            <span>In đơn hàng</span>
          </Button>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={selectedOrders.length === 0 || isProcessing} className="gap-2">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span>Cập nhật trạng thái</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Chọn trạng thái</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBatchUpdateStatus("Processing")} className="gap-2">
                <Package className="h-4 w-4" />
                <span>Bắt đầu xử lý</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBatchUpdateStatus("Shipped")} className="gap-2">
                <Truck className="h-4 w-4" />
                <span>Giao cho vận chuyển</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBatchUpdateStatus("Delivered")} className="gap-2">
                <Check className="h-4 w-4" />
                <span>Xác nhận đã giao</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBatchUpdateStatus("Cancelled")} className="gap-2 text-destructive">
                <X className="h-4 w-4" />
                <span>Hủy đơn hàng</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  )
}

