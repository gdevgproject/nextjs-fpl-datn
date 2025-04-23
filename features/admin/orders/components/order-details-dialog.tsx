"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useOrderDetails } from "../hooks/use-order-details";
import { OrderItems } from "./order-items";
import { OrderStatusUpdate } from "./order-status-update";
import { OrderShipperAssignment } from "./order-shipper-assignment";
import { OrderStatusBadge } from "./order-status-badge";
import { PaymentStatusBadge } from "./payment-status-badge";
import { formatCurrency, formatPhoneNumber } from "@/lib/utils/format";
import { ClipboardCheck, CreditCard, ShoppingBasket, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderDetailsDialogProps {
  orderId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({
  orderId,
  open,
  onOpenChange,
}: OrderDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");

  const {
    data: orderData,
    isLoading,
    isError,
    refetch,
  } = useOrderDetails(open ? orderId : null);

  const order = orderData?.data;

  const handleSuccess = () => {
    refetch();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? (
              <Skeleton className="h-8 w-60" />
            ) : (
              <>
                Chi tiết đơn hàng #{order?.id}
                {order?.order_statuses && (
                  <span className="ml-3 inline-block">
                    <OrderStatusBadge status={order.order_statuses} />
                  </span>
                )}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">
            Có lỗi xảy ra khi tải thông tin đơn hàng
          </div>
        ) : order ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Thông tin
              </TabsTrigger>
              <TabsTrigger value="items">
                <ShoppingBasket className="mr-2 h-4 w-4" />
                Sản phẩm
              </TabsTrigger>
              <TabsTrigger value="management">
                <CreditCard className="mr-2 h-4 w-4" />
                Quản lý
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Thông tin đơn hàng</h3>
                    <Separator className="my-2" />
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="font-medium">Mã đơn hàng:</dt>
                        <dd>#{order.id}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Ngày đặt:</dt>
                        <dd>
                          {format(
                            new Date(order.order_date),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi }
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Trạng thái:</dt>
                        <dd>
                          <OrderStatusBadge status={order.order_statuses} />
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Thanh toán:</dt>
                        <dd>
                          <PaymentStatusBadge status={order.payment_status} />
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Phương thức:</dt>
                        <dd>
                          {order.payment_methods?.name || "Không xác định"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Chi tiết thanh toán</h3>
                    <Separator className="my-2" />
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="font-medium">Tạm tính:</dt>
                        <dd>{formatCurrency(order.subtotal_amount)}</dd>
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between">
                          <dt className="font-medium">Giảm giá:</dt>
                          <dd className="text-green-600">
                            -{formatCurrency(order.discount_amount)}
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="font-medium">Phí vận chuyển:</dt>
                        <dd>{formatCurrency(order.shipping_fee)}</dd>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-lg font-bold">
                        <dt>Tổng cộng:</dt>
                        <dd>{formatCurrency(order.total_amount)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Thông tin khách hàng
                    </h3>
                    <Separator className="my-2" />
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="font-medium">Tên người nhận:</dt>
                        <dd>{order.recipient_name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Số điện thoại:</dt>
                        <dd>{formatPhoneNumber(order.recipient_phone)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Người đặt:</dt>
                        <dd>
                          {order.user_id
                            ? order.profiles?.display_name || "User"
                            : order.guest_name || "Khách vãng lai"}
                        </dd>
                      </div>
                      {order.guest_email && (
                        <div className="flex justify-between">
                          <dt className="font-medium">Email:</dt>
                          <dd>{order.guest_email}</dd>
                        </div>
                      )}
                      {order.guest_phone && (
                        <div className="flex justify-between">
                          <dt className="font-medium">Số điện thoại khách:</dt>
                          <dd>{formatPhoneNumber(order.guest_phone)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Địa chỉ giao hàng</h3>
                    <Separator className="my-2" />
                    <p>
                      {order.street_address}, {order.ward}, {order.district},{" "}
                      {order.province_city}
                    </p>
                    {order.delivery_notes && (
                      <div className="mt-2">
                        <p className="font-medium">Ghi chú:</p>
                        <p className="text-sm">{order.delivery_notes}</p>
                      </div>
                    )}
                  </div>

                  {order.assigned_shipper_id && (
                    <div>
                      <h3 className="text-lg font-medium">Người giao hàng</h3>
                      <Separator className="my-2" />
                      <p>
                        {order.profiles?.display_name ||
                          "Shipper #" + order.assigned_shipper_id}
                      </p>
                      {order.profiles?.phone_number && (
                        <p>
                          SĐT: {formatPhoneNumber(order.profiles.phone_number)}
                        </p>
                      )}
                    </div>
                  )}

                  {order.cancellation_reason && (
                    <div className="bg-destructive/10 p-3 rounded-md">
                      <h3 className="font-medium text-destructive">
                        Lý do hủy đơn
                      </h3>
                      <p>{order.cancellation_reason}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Hủy bởi:{" "}
                        {order.cancelled_by === "user"
                          ? "Khách hàng"
                          : "Admin/Staff"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="items">
              <OrderItems orderId={order.id} />
            </TabsContent>

            <TabsContent value="management" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Cập nhật trạng thái
                  </h3>
                  <OrderStatusUpdate order={order} onSuccess={handleSuccess} />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Gán người giao hàng
                  </h3>
                  <OrderShipperAssignment
                    order={order}
                    onSuccess={handleSuccess}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            Không tìm thấy thông tin đơn hàng
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
