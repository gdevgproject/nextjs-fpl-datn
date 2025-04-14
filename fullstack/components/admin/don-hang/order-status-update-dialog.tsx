"use client"

import { useState } from "react"
import { AlertCircle, Check, Clock, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { OrderStatusBadge } from "@/components/admin/don-hang/order-status-badge"

interface OrderStatusUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  currentStatus: string
  newStatus: string
  onConfirm: () => void
  isUpdating: boolean
}

export function OrderStatusUpdateDialog({
  open,
  onOpenChange,
  orderId,
  currentStatus,
  newStatus,
  onConfirm,
  isUpdating,
}: OrderStatusUpdateDialogProps) {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [sendEmail, setSendEmail] = useState(true)

  // Xác định nội dung dialog dựa trên trạng thái mới
  const getDialogContent = () => {
    switch (newStatus) {
      case "Processing":
        return {
          title: "Bắt đầu xử lý đơn hàng",
          description: "Xác nhận bắt đầu xử lý đơn hàng này?",
          showTracking: false,
          showInventoryWarning: false,
          confirmText: "Bắt đầu xử lý",
        }
      case "Shipped":
        return {
          title: "Giao đơn hàng cho vận chuyển",
          description: "Xác nhận đơn hàng đã được giao cho đơn vị vận chuyển?",
          showTracking: true,
          showInventoryWarning: true,
          confirmText: "Xác nhận giao cho vận chuyển",
        }
      case "Delivered":
        return {
          title: "Xác nhận đã giao hàng",
          description: "Xác nhận đơn hàng đã được giao thành công cho khách hàng?",
          showTracking: false,
          showInventoryWarning: false,
          confirmText: "Xác nhận đã giao hàng",
        }
      case "Cancelled":
        return {
          title: "Hủy đơn hàng",
          description: "Bạn có chắc chắn muốn hủy đơn hàng này?",
          showTracking: false,
          showInventoryWarning: false,
          confirmText: "Xác nhận hủy đơn hàng",
        }
      default:
        return {
          title: "Cập nhật trạng thái đơn hàng",
          description: "Xác nhận cập nhật trạng thái đơn hàng?",
          showTracking: false,
          showInventoryWarning: false,
          confirmText: "Xác nhận",
        }
    }
  }

  const dialogContent = getDialogContent()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogContent.title}</DialogTitle>
          <DialogDescription>{dialogContent.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trạng thái hiện tại:</span>
            <OrderStatusBadge status={currentStatus} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trạng thái mới:</span>
            <OrderStatusBadge status={newStatus} />
          </div>

          {dialogContent.showTracking && (
            <div className="space-y-2">
              <Label htmlFor="tracking-number">Mã vận đơn</Label>
              <Input
                id="tracking-number"
                placeholder="Nhập mã vận đơn"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              placeholder="Nhập ghi chú (nếu có)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {dialogContent.showInventoryWarning && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cập nhật tồn kho</AlertTitle>
              <AlertDescription>
                Khi chuyển trạng thái sang "Đã giao cho vận chuyển", hệ thống sẽ tự động cập nhật tồn kho cho các sản
                phẩm trong đơn hàng.
              </AlertDescription>
            </Alert>
          )}

          {newStatus === "Cancelled" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cảnh báo</AlertTitle>
              <AlertDescription>
                Hủy đơn hàng là hành động không thể hoàn tác. Nếu đơn hàng đã thanh toán, bạn sẽ cần xử lý hoàn tiền cho
                khách hàng.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox id="send-email" checked={sendEmail} onCheckedChange={(checked) => setSendEmail(!!checked)} />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            <X className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          <Button onClick={onConfirm} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                <span>Đang cập nhật...</span>
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                <span>{dialogContent.confirmText}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

