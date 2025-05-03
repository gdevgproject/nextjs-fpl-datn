"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  Banknote,
  Copy,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
  ArrowRightLeft,
  UserCircle,
  ShoppingCart,
} from "lucide-react";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const orderItems = orderData?.items || [];

  const handleSuccess = () => {
    refetch();
    toast.success("Cập nhật đơn hàng thành công");
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Thông tin
              </TabsTrigger>
              <TabsTrigger value="items">
                <PackageOpen className="mr-2 h-4 w-4" />
                Sản phẩm
              </TabsTrigger>
              <TabsTrigger value="payment">
                <CreditCard className="mr-2 h-4 w-4" />
                Thanh toán
              </TabsTrigger>
              <TabsTrigger value="management">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Quản lý
              </TabsTrigger>
            </TabsList>

            {/* Tab Thông tin đơn hàng */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thông tin chung về đơn hàng */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ReceiptText className="h-4 w-4" /> Thông tin đơn hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-[120px_1fr] gap-1 text-sm">
                      <div className="text-muted-foreground">Mã đơn hàng:</div>
                      <div className="font-medium flex items-center gap-2">
                        #{order.id}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() =>
                            copyToClipboard(
                              `#${order.id}`,
                              "Đã sao chép mã đơn hàng"
                            )
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>

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
                          {order.payment_methods?.name || "Không xác định"}
                        </span>
                      </div>
                    </div>

                    {/* Thông tin mã tra cứu - Chỉ hiển thị với đơn khách vãng lai */}
                    {!order.user_id && order.access_token && (
                      <div className="pt-3 border-t">
                        <div className="text-xs text-muted-foreground mb-1">
                          Mã tra cứu đơn hàng khách vãng lai
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-mono bg-muted p-1 rounded truncate max-w-[200px]">
                            {order.access_token}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() =>
                              copyToClipboard(
                                order.access_token,
                                "Đã sao chép mã tra cứu"
                              )
                            }
                          >
                            <Copy className="h-3 w-3 mr-1" /> Copy
                          </Button>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Đường dẫn tra cứu:
                        </div>
                        <div className="flex items-center gap-2 mt-1">
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
                            <Copy className="h-3 w-3" />
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

                    {/* Thông tin lý do hủy đơn */}
                    {order.cancellation_reason && (
                      <div className="mt-4 pt-3 border-t space-y-2">
                        <div className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Lý do hủy đơn
                            </div>
                            <div className="font-medium text-destructive">
                              {order.cancellation_reason}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <UserCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Hủy bởi
                            </div>
                            <div>
                              {order.cancelled_by === "user"
                                ? "Khách hàng"
                                : "Admin/Staff"}
                            </div>
                            {order.cancelled_by_user_id && (
                              <div className="text-xs text-muted-foreground">
                                ID: {order.cancelled_by_user_id}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Thông tin lỗi giao hàng */}
                    {order.delivery_failure_reason && (
                      <div className="mt-4 pt-3 border-t space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Lỗi giao hàng
                            </div>
                            <div className="font-medium text-amber-600">
                              {order.delivery_failure_reason}
                            </div>

                            {order.delivery_failure_timestamp && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Thời gian:{" "}
                                {format(
                                  new Date(order.delivery_failure_timestamp),
                                  "HH:mm - dd/MM/yyyy",
                                  { locale: vi }
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Thông tin hoàn thành */}
                    {order.completed_at && (
                      <div className="mt-4 pt-3 border-t">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Thời gian hoàn thành
                            </div>
                            <div className="font-medium text-green-600">
                              {format(
                                new Date(order.completed_at),
                                "HH:mm - dd/MM/yyyy",
                                { locale: vi }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Thông tin khách hàng */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" /> Thông tin khách hàng
                    </CardTitle>
                    {order.user_id ? (
                      <CardDescription>
                        Đơn hàng của người dùng đã đăng ký
                      </CardDescription>
                    ) : (
                      <CardDescription>
                        Đơn hàng của khách vãng lai
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Thông tin người đặt */}
                    <div className="space-y-3">
                      {order.user_id ? (
                        <div className="flex items-start gap-2">
                          <UserCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Người đặt hàng (Đã đăng ký)
                            </div>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={order.profiles?.avatar_url || ""}
                                />
                                <AvatarFallback className="text-[10px]">
                                  {order.profiles?.display_name?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {order.profiles?.display_name || "N/A"}
                                </div>
                                {order.profiles?.email && (
                                  <div className="text-xs text-muted-foreground">
                                    {order.profiles.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {order.guest_name && (
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Khách vãng lai
                                </div>
                                <div className="font-medium">
                                  {order.guest_name}
                                </div>
                              </div>
                            </div>
                          )}

                          {order.guest_phone && (
                            <div className="flex items-start gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Số điện thoại khách
                                </div>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`tel:${order.guest_phone}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {order.guest_phone}
                                  </a>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() =>
                                      copyToClipboard(
                                        order.guest_phone,
                                        "Đã sao chép số điện thoại"
                                      )
                                    }
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {order.guest_email && (
                            <div className="flex items-start gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="text-xs text-muted-foreground">
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
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <Separator className="my-2" />

                      {/* Thông tin người nhận */}
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-xs text-muted-foreground">
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
                          <div className="text-xs text-muted-foreground">
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
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Địa chỉ giao hàng */}
                    <div className="pt-3 border-t">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Địa chỉ giao hàng
                          </div>
                          <div className="space-y-1 text-sm mt-1">
                            <div>{order.street_address}</div>
                            <div>
                              {order.ward}, {order.district}
                            </div>
                            <div>{order.province_city}</div>
                          </div>
                          <Button
                            variant="link"
                            className="h-6 p-0 text-xs text-blue-600"
                            onClick={() =>
                              copyToClipboard(
                                `${order.street_address}, ${order.ward}, ${order.district}, ${order.province_city}`,
                                "Đã sao chép địa chỉ"
                              )
                            }
                          >
                            Sao chép địa chỉ
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Ghi chú giao hàng */}
                    {order.delivery_notes && (
                      <div className="pt-3 border-t">
                        <div className="text-xs text-muted-foreground mb-1">
                          Ghi chú giao hàng
                        </div>
                        <div className="p-2 bg-muted rounded-md text-sm italic">
                          {order.delivery_notes}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Thông tin tài chính */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Banknote className="h-4 w-4" /> Thông tin tài chính
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
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Phương thức thanh toán:
                        </span>
                        <div className="font-medium flex items-center gap-2 mt-1">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {order.payment_methods?.name || "Không xác định"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-muted-foreground">
                          Trạng thái thanh toán:
                        </span>
                        <div className="mt-1">
                          <PaymentStatusBadge status={order.payment_status} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Thông tin giao hàng */}
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
                          <Avatar className="h-10 w-10">
                            {order.shipper_profile.avatar_url ? (
                              <AvatarImage
                                src={order.shipper_profile.avatar_url}
                                alt="Shipper avatar"
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <AvatarFallback>
                                {(order.shipper_profile.display_name || "S")[0]}
                              </AvatarFallback>
                            )}
                          </Avatar>
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

            {/* Tab Sản phẩm */}
            <TabsContent value="items">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" /> Chi tiết sản phẩm đã
                    đặt
                  </CardTitle>
                  <CardDescription>
                    Danh sách sản phẩm trong đơn hàng #{order.id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderItems orderId={order.id} />
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    Tổng cộng {orderItems.length} sản phẩm
                  </div>
                  <div className="font-medium text-right">
                    Tạm tính: {formatCurrency(order.subtotal_amount)}
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Tab Thanh toán */}
            <TabsContent value="payment">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Thông tin thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Phương thức thanh toán:
                        </span>
                        <span className="font-medium">
                          {order.payment_methods?.name || "Không xác định"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Trạng thái:
                        </span>
                        <PaymentStatusBadge status={order.payment_status} />
                      </div>

                      {order.discount_id && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Mã giảm giá:
                          </span>
                          <span>ID: {order.discount_id}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tạm tính:</span>
                        <span>{formatCurrency(order.subtotal_amount)}</span>
                      </div>

                      {order.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Giảm giá:</span>
                          <span>-{formatCurrency(order.discount_amount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Phí giao hàng:
                        </span>
                        <span>{formatCurrency(order.shipping_fee)}</span>
                      </div>

                      <Separator />

                      <div className="flex justify-between text-lg font-medium">
                        <span>Tổng cộng:</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <History className="h-4 w-4" /> Lịch sử thanh toán
                    </CardTitle>
                    <CardDescription>
                      Các giao dịch thanh toán liên quan đến đơn hàng
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-center text-muted-foreground py-4">
                      <ArrowRightLeft className="mx-auto h-8 w-8 mb-2 opacity-20" />
                      Tính năng này cần được kết nối với dữ liệu từ bảng
                      payments.
                      <br />
                      Hiển thị các giao dịch thực tế từ cổng thanh toán đã tích
                      hợp.
                    </div>

                    {/* Bảng mẫu lịch sử thanh toán */}
                    <div className="border rounded-md mt-4 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mã GD</TableHead>
                            <TableHead>Ngày</TableHead>
                            <TableHead>Số tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="text-sm">
                          <TableRow>
                            <TableCell className="text-xs">
                              <Badge variant="outline" className="font-mono">
                                {order.id}-1
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {format(
                                new Date(order.order_date),
                                "dd/MM/yyyy",
                                { locale: vi }
                              )}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(order.total_amount)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  order.payment_status === "Paid"
                                    ? "success"
                                    : order.payment_status === "Failed"
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                {order.payment_status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Quản lý */}
            <TabsContent value="management" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Cập nhật trạng thái đơn
                    hàng
                  </CardTitle>
                  <CardDescription>
                    Thay đổi trạng thái xử lý đơn hàng hoặc hủy đơn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderStatusUpdate order={order} onSuccess={handleSuccess} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Phân công người giao hàng
                  </CardTitle>
                  <CardDescription>
                    Gán đơn hàng cho shipper trong hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderShipperAssignment
                    order={order}
                    onSuccess={handleSuccess}
                  />
                </CardContent>
              </Card>

              {/* Lịch sử vận đơn */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4" /> Lịch sử trạng thái
                  </CardTitle>
                  <CardDescription>
                    Lịch sử các thay đổi trạng thái của đơn hàng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-center text-muted-foreground py-4">
                    <History className="mx-auto h-8 w-8 mb-2 opacity-20" />
                    Tính năng này cần được kết nối với bảng
                    order_status_history.
                    <br />
                    Hiển thị lịch sử đầy đủ các thay đổi trạng thái đơn hàng.
                  </div>
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
