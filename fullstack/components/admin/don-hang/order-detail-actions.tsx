"use client"

import { useState } from "react"
import { Check, ChevronDown, Clock, Mail, Package, Truck } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { OrderStatusBadge } from "@/components/admin/don-hang/order-status-badge"
import { PaymentStatusBadge } from "@/components/admin/don-hang/payment-status-badge"

interface OrderDetailActionsProps {
  orderId: string
}

export function OrderDetailActions({ orderId }: OrderDetailActionsProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isShippingOpen, setIsShippingOpen] = useState(false)

  // Mẫu dữ liệu đơn hàng
  const order = {
    id: orderId,
    orderStatus: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "Banking",
    trackingNumber: "",
    sendEmail: true,
  }

  const [formState, setFormState] = useState({
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber,
    sendEmail: order.sendEmail,
  })

  const handleUpdateStatus = () => {
    setIsUpdating(true)

    // Giả lập cập nhật trạng thái
    setTimeout(() => {
      setIsUpdating(false)

      toast({
        title: "Cập nhật thành công",
        description: "Trạng thái đơn hàng đã được cập nhật",
      })
    }, 1000)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Cập nhật đơn hàng</CardTitle>
        <CardDescription>Cập nhật trạng thái và thông tin đơn hàng</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="status">Trạng thái đơn hàng</Label>
            <OrderStatusBadge status={formState.orderStatus} />
          </div>
          <Select
            value={formState.orderStatus}
            onValueChange={(value) => setFormState({ ...formState, orderStatus: value })}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Chờ xử lý</SelectItem>
              <SelectItem value="Processing">Đang xử lý</SelectItem>
              <SelectItem value="Shipped">Đã giao cho vận chuyển</SelectItem>
              <SelectItem value="Delivered">Đã giao hàng</SelectItem>
              <SelectItem value="Cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="payment-status">Trạng thái thanh toán</Label>
            <PaymentStatusBadge status={formState.paymentStatus} />
          </div>
          <Select
            value={formState.paymentStatus}
            onValueChange={(value) => setFormState({ ...formState, paymentStatus: value })}
          >
            <SelectTrigger id="payment-status">
              <SelectValue placeholder="Chọn trạng thái thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Chờ thanh toán</SelectItem>
              <SelectItem value="Paid">Đã thanh toán</SelectItem>
              <SelectItem value="Failed">Thanh toán thất bại</SelectItem>
              <SelectItem value="Refunded">Đã hoàn tiền</SelectItem>
              <SelectItem value="Partially Refunded">Hoàn tiền một phần</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <Collapsible open={isShippingOpen} onOpenChange={setIsShippingOpen} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base">Thông tin vận chuyển</Label>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tracking">Mã vận đơn</Label>
              <Input
                id="tracking"
                placeholder="Nhập mã vận đơn"
                value={formState.trackingNumber}
                onChange={(e) => setFormState({ ...formState, trackingNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carrier">Đơn vị vận chuyển</Label>
              <Select defaultValue="ghn">
                <SelectTrigger id="carrier">
                  <SelectValue placeholder="Chọn đơn vị vận chuyển" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ghn">Giao hàng nhanh</SelectItem>
                  <SelectItem value="ghtk">Giao hàng tiết kiệm</SelectItem>
                  <SelectItem value="vnpost">VN Post</SelectItem>
                  <SelectItem value="jt">J&T Express</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Package className="h-4 w-4" />
                <span>Cập nhật tồn kho</span>
              </Button>

              <Button variant="outline" size="sm" className="gap-2">
                <Truck className="h-4 w-4" />
                <span>In vận đơn</span>
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={isPaymentOpen} onOpenChange={setIsPaymentOpen} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base">Thông tin thanh toán</Label>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transaction">Mã giao dịch</Label>
              <Input id="transaction" placeholder="Nhập mã giao dịch" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-date">Ngày thanh toán</Label>
              <Input id="payment-date" type="date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-note">Ghi chú thanh toán</Label>
              <Input id="payment-note" placeholder="Nhập ghi chú thanh toán" />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="send-email"
            checked={formState.sendEmail}
            onCheckedChange={(checked) => setFormState({ ...formState, sendEmail: !!checked })}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="send-email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Gửi email thông báo
            </label>
            <p className="text-sm text-muted-foreground">
              Gửi email thông báo cập nhật trạng thái đơn hàng đến khách hàng
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" />
          <span>Xem trước email</span>
        </Button>

        <Button onClick={handleUpdateStatus} disabled={isUpdating} className="gap-2">
          {isUpdating ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              <span>Đang cập nhật...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Cập nhật</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

