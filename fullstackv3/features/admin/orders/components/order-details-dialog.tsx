"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "./order-status-badge"
import { PaymentStatusBadge } from "./payment-status-badge"
import { OrderItems } from "./order-items"
import { OrderStatusUpdate } from "./order-status-update"
import { OrderShipperAssignment } from "./order-shipper-assignment"
import { useOrderDetails } from "../hooks/use-order-details"
import { useOrderItems } from "../hooks/use-order-items"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"
import { Loader2 } from "lucide-react"

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: number | null
}

export function OrderDetailsDialog({ open, onOpenChange, orderId }: OrderDetailsDialogProps) {
  const toast = useSonnerToast()
  const [activeTab, setActiveTab] = useState("details")

  const {
    data: orderData,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
  } = useOrderDetails(orderId)

  const {
    data: itemsData,
    isLoading: isItemsLoading,
    isError: isItemsError,
    error: itemsError,
  } = useOrderItems(orderId)

  const order = orderData?.data
  const items = itemsData?.data || []

  if (isOrderError) {
    toast.error(`Error loading order details: ${orderError?.message || "Unknown error"}`)
  }

  if (isItemsError) {
    toast.error(`Error loading order items: ${itemsError?.message || "Unknown error"}`)
  }

  const isLoading = isOrderLoading || isItemsLoading

  // Reset active tab when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setActiveTab("details")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !order ? (
          <div className="text-center py-8">
            <p>Không tìm thấy thông tin đơn hàng</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Chi tiết đơn hàng #{order.id}</span>
                <OrderStatusBadge status={order.order_statuses} />
              </DialogTitle>
              <DialogDescription>
                Đặt lúc: {format(new Date(order.order_date), "HH:mm - dd/MM/yyyy", { locale: vi })}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="details">Thông tin đơn hàng</TabsTrigger>
                <TabsTrigger value="status">Cập nhật trạng thái</TabsTrigger>
                <TabsTrigger value="shipper">Gán người giao hàng</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Thông tin khách hàng</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3">
                        <span className="text-muted-foreground">Tên:</span>
                        <span className="col-span-2 font-medium">{order.recipient_name}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-muted-foreground">Điện thoại:</span>
                        <span className="col-span-2">{order.recipient_phone}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-muted-foreground">Địa chỉ:</span>
                        <span className="col-span-2">
                          {order.street_address}, {order.ward}, {order.district}, {order.province_city}
                        </span>
                      </div>
                      {order.delivery_notes && (
                        <div className="grid grid-cols-3">
                          <span className="text-muted-foreground">Ghi chú:</span>
                          <span className="col-span-2">{order.delivery_notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Thông tin thanh toán</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3">
                        <span className="text-muted-foreground">Phương thức:</span>
                        <span className="col-span-2">{order.payment_methods?.name || "N/A"}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-muted-foreground">Trạng thái:</span>
                        <span className="col-span-2">
                          <PaymentStatusBadge status={order.payment_status} />
                        </span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="text-muted-foreground">Tổng tiền hàng:</span>
                        <span className="col-span-2">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(order.subtotal_amount)}
                        </span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="grid grid-cols-3">
                          <span className="text-muted-foreground">Giảm giá:</span>
                          <span className="col-span-2 text-red-500">
                            -
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(order.discount_amount)}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-3">
                        <span className="text-muted-foreground">Phí vận chuyển:</span>
                        <span className="col-span-2">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(order.shipping_fee)}
                        </span>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-3">
                        <span className="text-muted-foreground">Tổng thanh toán:</span>
                        <span className="col-span-2 font-bold">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Sản phẩm</h3>
                  <OrderItems items={items} />
                </div>

                {/* Additional Information */}
                {order.cancelled_by && (
                  <div className="space-y-2 p-4 border rounded-md bg-destructive/10">
                    <h3 className="font-medium">Thông tin hủy đơn</h3>
                    <div className="grid grid-cols-3">
                      <span className="text-muted-foreground">Hủy bởi:</span>
                      <span className="col-span-2">{order.cancelled_by === "user" ? "Khách hàng" : "Admin/Staff"}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-muted-foreground">Lý do:</span>
                      <span className="col-span-2">{order.cancellation_reason || "Không có lý do"}</span>
                    </div>
                  </div>
                )}

                {order.delivery_failure_reason && (
                  <div className="space-y-2 p-4 border rounded-md bg-warning/10">
                    <h3 className="font-medium">Thông tin giao hàng thất bại</h3>
                    <div className="grid grid-cols-3">
                      <span className="text-muted-foreground">Thời gian:</span>
                      <span className="col-span-2">
                        {format(new Date(order.delivery_failure_timestamp), "HH:mm - dd/MM/yyyy", { locale: vi })}
                      </span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-muted-foreground">Lý do:</span>
                      <span className="col-span-2">{order.delivery_failure_reason}</span>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="status">
                <OrderStatusUpdate order={order} onSuccess={() => setActiveTab("details")} />
              </TabsContent>

              <TabsContent value="shipper">
                <OrderShipperAssignment order={order} onSuccess={() => setActiveTab("details")} />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
