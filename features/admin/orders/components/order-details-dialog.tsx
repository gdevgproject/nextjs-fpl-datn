"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "./order-status-badge";
import { PaymentStatusBadge } from "./payment-status-badge";
import { OrderItems } from "./order-items";
import { OrderStatusUpdate } from "./order-status-update";
import { OrderShipperAssignment } from "./order-shipper-assignment";
import { useOrderDetails } from "../hooks/use-order-details";
import { formatCurrency } from "@/lib/utils/format";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Clock,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  ClipboardCheck,
  PackageOpen,
  ShieldAlert,
  ReceiptText,
  ExternalLink,
  CalendarClock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  const toast = useSonnerToast();

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

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-8 w-60" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span>Chi tiết đơn hàng #{order?.id}</span>
                  {order?.order_statuses && (
                    <OrderStatusBadge status={order?.order_statuses} />
                  )}
                  {order?.payment_status && (
                    <PaymentStatusBadge status={order?.payment_status} />
                  )}
                </div>
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
                <PackageOpen className="mr-2 h-4 w-4" />
                Sản phẩm
              </TabsTrigger>
              <TabsTrigger value="management">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Quản lý đơn
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ReceiptText className="h-4 w-4" /> Thông tin đơn hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-[120px_1fr] gap-1 text-sm">
                      <div className="text-muted-foreground">Mã đơn hàng:</div>
                      <div className="font-medium">#{order.id}</div>

                      <div className="text-muted-foreground">Ngày đặt:</div>
                      <div className="font-medium">
                        {format(
                          new Date(order.order_date),
                          "HH:mm - dd/MM/yyyy",
                          { locale: vi }
                        )}
                      </div>

                      <div className="text-muted-foreground">Trạng thái:</div>
                      <div>
                        <OrderStatusBadge status={order.order_statuses} />
                      </div>

                      <div className="text-muted-foreground">Thanh toán:</div>
                      <div className="flex items-center gap-2">
                        <PaymentStatusBadge status={order.payment_status} />
                        <span className="text-xs">
                          {order.payment_methods?.name}
                        </span>
                      </div>

                      {order.cancellation_reason && (
                        <>
                          <div className="text-muted-foreground text-destructive">
                            Lý do hủy:
                          </div>
                          <div className="text-destructive">
                            {order.cancellation_reason}
                          </div>

                          <div className="text-muted-foreground text-destructive">
                            Hủy bởi:
                          </div>
                          <div className="text-destructive">
                            {order.cancelled_by === "user"
                              ? "Khách hàng"
                              : "Admin/Staff"}
                          </div>
                        </>
                      )}

                      {order.delivery_failure_reason && (
                        <>
                          <div className="text-muted-foreground text-amber-500">
                            Lỗi giao hàng:
                          </div>
                          <div className="text-amber-500">
                            {order.delivery_failure_reason}
                          </div>

                          {order.delivery_failure_timestamp && (
                            <>
                              <div className="text-muted-foreground text-amber-500">
                                Thời gian:
                              </div>
                              <div className="text-amber-500">
                                {format(
                                  new Date(order.delivery_failure_timestamp),
                                  "HH:mm - dd/MM/yyyy",
                                  { locale: vi }
                                )}
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {order.completed_at && (
                        <>
                          <div className="text-muted-foreground text-green-600">
                            <CalendarClock className="h-3 w-3 inline mr-1" />
                            Hoàn thành:
                          </div>
                          <div className="text-green-600">
                            {format(
                              new Date(order.completed_at),
                              "HH:mm - dd/MM/yyyy",
                              { locale: vi }
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Order token/access link for guest orders */}
                    {!order.user_id && order.access_token && (
                      <div className="pt-3 border-t">
                        <div className="text-xs text-muted-foreground mb-1">
                          Liên kết tra cứu đơn hàng (khách vãng lai)
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-blue-600 truncate max-w-[200px]">
                            {`${window.location.origin}/tra-cuu-don-hang?token=${order.access_token}`}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() =>
                              copyToClipboard(
                                `${window.location.origin}/tra-cuu-don-hang?token=${order.access_token}`,
                                "Đã sao chép liên kết tra cứu"
                              )
                            }
                          >
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() =>
                              window.open(
                                `/tra-cuu-don-hang?token=${order.access_token}`,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer & Shipping Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" /> Thông tin khách hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Customer information */}
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <div className="text-muted-foreground text-xs">
                          Loại tài khoản
                        </div>
                        <div className="font-medium">
                          {order.user_id ? (
                            <Badge variant="outline">Đã đăng ký</Badge>
                          ) : (
                            <Badge variant="secondary">Khách vãng lai</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-muted-foreground text-xs">
                            Người nhận
                          </div>
                          <div className="font-medium">
                            {order.recipient_name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-muted-foreground text-xs">
                            Số điện thoại
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${order.recipient_phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {order.recipient_phone}
                            </a>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                copyToClipboard(
                                  order.recipient_phone,
                                  "Đã sao chép số điện thoại"
                                )
                              }
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {order.guest_email && (
                        <div className="flex items-start gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="text-muted-foreground text-xs">
                              Email
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`mailto:${order.guest_email}`}
                                className="text-blue-600 hover:underline"
                              >
                                {order.guest_email}
                              </a>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  copyToClipboard(
                                    order.guest_email,
                                    "Đã sao chép email"
                                  )
                                }
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shipping Address */}
                    <div className="pt-3 border-t">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-muted-foreground text-xs">
                            Địa chỉ giao hàng
                          </div>
                          <div className="space-y-1 text-sm mt-1">
                            <div>{order.street_address}</div>
                            <div>
                              {order.ward}, {order.district}
                            </div>
                            <div>{order.province_city}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Notes */}
                    {order.delivery_notes && (
                      <div className="pt-3 border-t">
                        <div className="text-muted-foreground text-xs mb-1">
                          Ghi chú giao hàng
                        </div>
                        <div className="p-2 bg-muted rounded-md text-sm italic">
                          {order.delivery_notes}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Banknote className="h-4 w-4" /> Thông tin thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Tạm tính:</span>
                        <span>{formatCurrency(order.subtotal_amount)}</span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between items-center text-sm text-green-600">
                          <span>Giảm giá:</span>
                          <span>- {formatCurrency(order.discount_amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Phí giao hàng:
                        </span>
                        <span>{formatCurrency(order.shipping_fee)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center font-medium">
                          <span>Tổng cộng:</span>
                          <span className="text-lg">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1">
                          <span className="text-muted-foreground">
                            Phương thức:
                          </span>
                          <span>{order.payment_methods?.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1">
                          <span className="text-muted-foreground">
                            Trạng thái:
                          </span>
                          <PaymentStatusBadge status={order.payment_status} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipper Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Truck className="h-4 w-4" /> Thông tin giao hàng
                    </CardTitle>
                    <CardDescription>
                      {order.assigned_shipper_id
                        ? "Đã phân công người giao hàng"
                        : "Chưa phân công người giao hàng"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {order.assigned_shipper_id && order.shipper_profile ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {order.shipper_profile.avatar_url ? (
                              <img
                                src={order.shipper_profile.avatar_url}
                                alt="Shipper avatar"
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {order.shipper_profile.display_name || "Shipper"}
                            </div>
                            {order.shipper_profile.phone_number && (
                              <a
                                href={`tel:${order.shipper_profile.phone_number}`}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {order.shipper_profile.phone_number}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 border border-dashed rounded-md">
                        <Truck className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Chưa phân công người giao hàng
                        </span>
                      </div>
                    )}

                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      onClick={() => setActiveTab("management")}
                    >
                      Quản lý giao hàng
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="items">
              <OrderItems orderId={order.id} />
            </TabsContent>

            <TabsContent value="management" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Cập nhật trạng thái đơn hàng</CardTitle>
                  <CardDescription>
                    Thay đổi trạng thái xử lý đơn hàng hoặc hủy đơn.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderStatusUpdate order={order} onSuccess={handleSuccess} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Phân công người giao hàng</CardTitle>
                  <CardDescription>
                    Gán đơn hàng cho người giao hàng nội bộ.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderShipperAssignment
                    order={order}
                    onSuccess={handleSuccess}
                  />
                </CardContent>
              </Card>
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
