"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface OrderEditDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderEditDialog({ orderId, open, onOpenChange }: OrderEditDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mẫu dữ liệu đơn hàng
  const order = {
    id: orderId,
    orderNumber: `ORD-${orderId}`,
    orderDate: new Date("2023-06-01T15:30:00"),
    priority: "Normal",
    source: "Website",
    deliveryNotes: "Gọi trước khi giao hàng",
    customer: {
      id: "USR-001",
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0901234567",
    },
  }

  const [formState, setFormState] = useState({
    orderDate: order.orderDate,
    priority: order.priority,
    source: order.source,
    deliveryNotes: order.deliveryNotes,
    customerName: order.customer.name,
    customerEmail: order.customer.email,
    customerPhone: order.customer.phone,
  })

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Giả lập cập nhật
    setTimeout(() => {
      setIsSubmitting(false)
      onOpenChange(false)

      toast({
        title: "Cập nhật thành công",
        description: "Thông tin đơn hàng đã được cập nhật",
      })
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin đơn hàng</DialogTitle>
          <DialogDescription>Cập nhật thông tin cho đơn hàng #{orderId}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order-number">Mã đơn hàng</Label>
              <Input id="order-number" value={order.orderNumber} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-date">Ngày đặt hàng</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formState.orderDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formState.orderDate ? (
                      format(formState.orderDate, "dd/MM/yyyy", { locale: vi })
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formState.orderDate}
                    onSelect={(date) => setFormState({ ...formState, orderDate: date || new Date() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Mức độ ưu tiên</Label>
              <Select
                value={formState.priority}
                onValueChange={(value) => setFormState({ ...formState, priority: value })}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Chọn mức độ ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Thấp</SelectItem>
                  <SelectItem value="Normal">Bình thường</SelectItem>
                  <SelectItem value="High">Cao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Nguồn đơn hàng</Label>
              <Select value={formState.source} onValueChange={(value) => setFormState({ ...formState, source: value })}>
                <SelectTrigger id="source">
                  <SelectValue placeholder="Chọn nguồn đơn hàng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Mobile App">Ứng dụng di động</SelectItem>
                  <SelectItem value="Phone">Điện thoại</SelectItem>
                  <SelectItem value="In-store">Tại cửa hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-notes">Ghi chú giao hàng</Label>
            <Textarea
              id="delivery-notes"
              placeholder="Nhập ghi chú giao hàng"
              value={formState.deliveryNotes}
              onChange={(e) => setFormState({ ...formState, deliveryNotes: e.target.value })}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Thông tin khách hàng</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Tên khách hàng</Label>
                <Input
                  id="customer-name"
                  placeholder="Nhập tên khách hàng"
                  value={formState.customerName}
                  onChange={(e) => setFormState({ ...formState, customerName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-phone">Số điện thoại</Label>
                <Input
                  id="customer-phone"
                  placeholder="Nhập số điện thoại"
                  value={formState.customerPhone}
                  onChange={(e) => setFormState({ ...formState, customerPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                placeholder="Nhập email"
                value={formState.customerEmail}
                onChange={(e) => setFormState({ ...formState, customerEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

