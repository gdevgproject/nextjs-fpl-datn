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
  ExternalLink as LinkIcon,
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
import { DEFAULT_AVATAR_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
    // Thực hiện fetch ngay lập tức không chờ refetch tự động để giảm độ trễ
    refetch({ throwOnError: false })
      .then(() => {
        // Không cần hiển thị toast do component con đã xử lý
        // toast.success("Cập nhật đơn hàng thành công");
      })
      .catch((error) => {
        console.error("Error refetching order details:", error);
        // Nếu refetch thất bại, thông báo cho người dùng
        toast.error(
          "Cập nhật dữ liệu không thành công, vui lòng làm mới trang"
        );
      });
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col h-[90vh] max-w-5xl p-0">
        <VisuallyHidden>
          <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        </VisuallyHidden>
        {isLoading ? (
          <div className="flex flex-col justify-center items-center flex-1 p-6 space-y-4">
            <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
            <div className="text-center space-y-2">
              <h3 className="font-medium">Đang tải thông tin đơn hàng</h3>
              <p className="text-sm text-muted-foreground">
                Vui lòng đợi trong giây lát...
              </p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-col justify-center items-center flex-1 p-6 text-destructive space-y-2">
            <AlertCircle className="h-10 w-10" />
            <h3 className="font-medium text-lg">Có lỗi xảy ra</h3>
            <p className="text-center max-w-md text-muted-foreground">
              Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.
            </p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          </div>
        ) : order ? (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header sticky với thông tin tóm tắt đơn hàng */}
            <div className="sticky top-0 z-10 bg-background border-b">
              <DialogHeader className="px-6 pt-6 pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    Chi tiết đơn hàng{" "}
                    <span className="font-mono">#{order.id}</span>
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.order_statuses} />
                    <PaymentStatusBadge status={order.payment_status} />
                  </div>
                </div>
              </DialogHeader>

              {/* Thanh tóm tắt nhanh */}
              <div className="px-6 py-2 flex items-center justify-between flex-wrap gap-y-2 gap-x-4 text-sm bg-muted/30">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Ngày đặt:</span>
                  <span className="font-medium">
                    {format(new Date(order.order_date), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Người nhận:</span>
                  <span className="font-medium">{order.recipient_name}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Banknote className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Tổng tiền:</span>
                  <span className="font-medium">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Sản phẩm:</span>
                  <span className="font-medium">{orderItems.length}</span>
                </div>

                {order.payment_methods && (
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-xs">
                      {order.payment_methods.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content area có thể scroll */}
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-6">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="mt-2"
                >
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="details">
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Thông tin</span>
                      <span className="sm:hidden">Thông tin</span>
                    </TabsTrigger>
                    <TabsTrigger value="items">
                      <PackageOpen className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Sản phẩm</span>
                      <span className="sm:hidden">SP</span>
                    </TabsTrigger>
                    <TabsTrigger value="payment">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Thanh toán</span>
                      <span className="sm:hidden">TT</span>
                    </TabsTrigger>
                    <TabsTrigger value="management">
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Quản lý</span>
                      <span className="sm:hidden">QL</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab Thông tin đơn hàng - Giao diện mới */}
                  <TabsContent value="details" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Cột trái: Thông tin đơn hàng và các thông tin quan trọng */}
                      <div className="space-y-6">
                        {/* Thông tin chung về đơn hàng */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <ReceiptText className="h-4 w-4" /> Thông tin đơn
                              hàng
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 pt-0">
                            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                              <div className="text-muted-foreground">
                                Trạng thái:
                              </div>
                              <div>
                                <OrderStatusBadge
                                  status={order.order_statuses}
                                />
                              </div>

                              <div className="text-muted-foreground">
                                Thanh toán:
                              </div>
                              <div>
                                <PaymentStatusBadge
                                  status={order.payment_status}
                                />
                              </div>

                              {order.completed_at && (
                                <>
                                  <div className="text-muted-foreground">
                                    Hoàn thành:
                                  </div>
                                  <div className="text-green-600">
                                    {format(
                                      new Date(order.completed_at),
                                      "dd/MM/yyyy HH:mm",
                                      { locale: vi }
                                    )}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Thông tin mã tra cứu - Chỉ hiển thị với đơn khách vãng lai */}
                            {!order.user_id && order.access_token && (
                              <div className="pt-2 mt-2 border-t">
                                <div className="text-xs text-muted-foreground mb-1">
                                  Mã tra cứu đơn hàng khách vãng lai
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant="outline"
                                    className="font-mono text-xs py-1 px-2 h-auto"
                                  >
                                    {order.access_token}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 rounded-full"
                                    onClick={() =>
                                      copyToClipboard(
                                        order.access_token,
                                        "Đã sao chép mã tra cứu"
                                      )
                                    }
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Thông tin lý do hủy đơn */}
                            {order.cancellation_reason && (
                              <div className="pt-2 mt-2 border-t">
                                <div className="flex items-start gap-2">
                                  <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="text-xs text-muted-foreground">
                                      Lý do hủy đơn
                                    </div>
                                    <div className="font-medium text-destructive">
                                      {order.cancellation_reason}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Hủy bởi:{" "}
                                      {order.cancelled_by === "user"
                                        ? "Khách hàng"
                                        : "Admin/Staff"}
                                      {order.cancelled_by_user_id &&
                                        ` (ID: ${order.cancelled_by_user_id})`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Thông tin lỗi giao hàng */}
                            {order.delivery_failure_reason && (
                              <div className="pt-2 mt-2 border-t">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="text-xs text-muted-foreground">
                                      Lỗi giao hàng
                                    </div>
                                    <div className="font-medium text-amber-600">
                                      {order.delivery_failure_reason}
                                    </div>
                                    {order.delivery_failure_timestamp && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {format(
                                          new Date(
                                            order.delivery_failure_timestamp
                                          ),
                                          "dd/MM/yyyy HH:mm",
                                          { locale: vi }
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Thông tin tài chính */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Banknote className="h-4 w-4" /> Thông tin thanh
                              toán
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">
                                  Phương thức:
                                </span>
                                <span>
                                  {order.payment_methods?.name ||
                                    "Không xác định"}
                                </span>
                              </div>

                              <Separator className="my-2" />

                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">
                                  Tạm tính:
                                </span>
                                <span>
                                  {formatCurrency(order.subtotal_amount)}
                                </span>
                              </div>

                              {order.discount_amount > 0 && (
                                <div className="flex justify-between items-center text-sm text-green-600">
                                  <span>Giảm giá:</span>
                                  <span>
                                    - {formatCurrency(order.discount_amount)}
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">
                                  Phí giao hàng:
                                </span>
                                <span>
                                  {formatCurrency(order.shipping_fee)}
                                </span>
                              </div>

                              <Separator className="my-2" />

                              <div className="flex justify-between items-center font-medium">
                                <span>Tổng cộng:</span>
                                <span className="text-lg">
                                  {formatCurrency(order.total_amount)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Cột giữa và phải: Thông tin khách hàng và địa chỉ */}
                      <div className="md:col-span-2 space-y-6">
                        {/* Thông tin khách hàng */}
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4" /> Thông tin khách
                                hàng
                              </CardTitle>
                              {order.user_id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() =>
                                    window.open(
                                      `/admin/users/${order.user_id}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <LinkIcon className="mr-1 h-3.5 w-3.5" />
                                  Trang người dùng
                                </Button>
                              )}
                            </div>
                            <CardDescription>
                              {order.user_id
                                ? "Đơn hàng của người dùng đã đăng ký"
                                : "Đơn hàng của khách vãng lai"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {/* Thông tin người đặt */}
                            {order.user_id ? (
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-shrink-0">
                                  <Avatar className="h-16 w-16 rounded-md border border-primary/20 shadow-sm">
                                    {order.profiles?.avatar_url ? (
                                      <AvatarImage
                                        src={order.profiles.avatar_url}
                                        alt={
                                          order.profiles?.display_name ||
                                          "Khách hàng"
                                        }
                                        className="object-cover"
                                        onError={(e) => {
                                          (
                                            e.currentTarget as HTMLImageElement
                                          ).src = "/images/default-avatar.png";
                                        }}
                                      />
                                    ) : (
                                      <AvatarImage
                                        src="/images/default-avatar.png"
                                        alt="Default avatar"
                                        className="object-cover"
                                      />
                                    )}
                                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                      {(
                                        order.profiles?.display_name?.[0] ||
                                        order.user?.email?.[0] ||
                                        "K"
                                      ).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Đã đăng ký
                                    </Badge>
                                    {order.profiles?.email_confirmed_at && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Xác thực
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex-1 space-y-3 mt-1">
                                  <div>
                                    <h4 className="font-medium text-base">
                                      {order.profiles?.display_name ||
                                        order.profiles?.email?.split("@")[0] ||
                                        "Khách hàng"}
                                    </h4>
                                    <div className="text-xs text-muted-foreground">
                                      ID người dùng: {order.user_id}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-start gap-2">
                                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                      <div>
                                        <div className="text-xs text-muted-foreground">
                                          Email
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <a
                                            href={`mailto:${
                                              order.profiles?.email ||
                                              order.user?.email
                                            }`}
                                            className="text-blue-600 hover:underline truncate max-w-[180px]"
                                          >
                                            {order.profiles?.email ||
                                              order.user?.email ||
                                              "Không có email"}
                                          </a>
                                          {(order.profiles?.email ||
                                            order.user?.email) && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 p-0"
                                              onClick={() =>
                                                copyToClipboard(
                                                  order.profiles?.email ||
                                                    (order.user
                                                      ?.email as string),
                                                  "Đã sao chép email"
                                                )
                                              }
                                            >
                                              <Copy className="h-3 w-3" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                      <div>
                                        <div className="text-xs text-muted-foreground">
                                          Số điện thoại
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {order.profiles?.phone_number ? (
                                            <>
                                              <a
                                                href={`tel:${order.profiles.phone_number}`}
                                                className="text-blue-600 hover:underline"
                                              >
                                                {order.profiles.phone_number}
                                              </a>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 p-0"
                                                onClick={() =>
                                                  copyToClipboard(
                                                    order.profiles.phone_number,
                                                    "Đã sao chép số điện thoại"
                                                  )
                                                }
                                              >
                                                <Copy className="h-3 w-3" />
                                              </Button>
                                            </>
                                          ) : (
                                            <span className="text-muted-foreground">
                                              Chưa cập nhật
                                            </span>
                                          )}
                                        </div>
                                      </div>
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

                            {/* Thông tin giao hàng */}
                            <div className="mt-6 pt-4 border-t space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                  Thông tin giao hàng
                                </h4>

                                {order.assigned_shipper_id &&
                                  order.shipper_profile && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        Người giao hàng:
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <Avatar className="h-5 w-5">
                                          <AvatarFallback className="text-[10px]">
                                            {
                                              (order.shipper_profile
                                                .display_name || "S")[0]
                                            }
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium">
                                          {order.shipper_profile.display_name ||
                                            "Shipper"}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">
                                    Người nhận hàng
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <div className="font-medium">
                                      {order.recipient_name}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                      <a
                                        href={`tel:${order.recipient_phone}`}
                                        className="text-sm text-blue-600 hover:underline"
                                      >
                                        {order.recipient_phone}
                                      </a>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 p-0"
                                        onClick={() =>
                                          copyToClipboard(
                                            order.recipient_phone,
                                            "Đã sao chép SĐT"
                                          )
                                        }
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">
                                    Địa chỉ giao hàng
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    <div>{order.street_address}</div>
                                    <div>
                                      {order.ward}, {order.district},{" "}
                                      {order.province_city}
                                    </div>
                                    <div>
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
                                        <Copy className="h-3 w-3 mr-1" /> Sao
                                        chép địa chỉ
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Ghi chú giao hàng */}
                              {order.delivery_notes && (
                                <div className="mt-2">
                                  <div className="text-xs text-muted-foreground mb-1">
                                    Ghi chú giao hàng
                                  </div>
                                  <div className="p-2 bg-muted rounded-md text-sm italic">
                                    {order.delivery_notes}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab Sản phẩm - Cải tiến UI */}
                  <TabsContent value="items">
                    <Card className="border-0 shadow-none overflow-hidden">
                      <CardHeader className="px-0 pt-1 pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" /> Chi tiết sản
                            phẩm đã đặt
                          </CardTitle>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Tổng cộng:
                            </span>
                            <span className="font-medium ml-1">
                              {orderItems.length} sản phẩm
                            </span>
                          </div>
                        </div>

                        <CardDescription>
                          Danh sách sản phẩm trong đơn hàng #{order.id}
                        </CardDescription>
                      </CardHeader>

                      <div className="border rounded-md overflow-hidden">
                        <OrderItems orderId={order.id} />
                      </div>

                      <CardFooter className="flex justify-end items-center mt-4 p-0 gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Tạm tính:
                          </span>
                          <span className="font-medium">
                            {formatCurrency(order.subtotal_amount)}
                          </span>
                        </div>
                        {order.discount_amount > 0 && (
                          <div className="flex items-center gap-2 text-green-600">
                            <span className="text-sm">Giảm giá:</span>
                            <span>
                              - {formatCurrency(order.discount_amount)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Phí giao hàng:
                          </span>
                          <span>{formatCurrency(order.shipping_fee)}</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                          <span>Tổng tiền:</span>
                          <span className="text-lg">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* Tab Thanh toán - Cải tiến UI */}
                  <TabsContent value="payment">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      {/* Thông tin thanh toán */}
                      <Card className="lg:col-span-2">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Thông tin thanh
                            toán
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="rounded-md border overflow-hidden">
                            <div className="bg-muted/30 px-4 py-2">
                              <h4 className="font-medium">
                                Chi tiết thanh toán
                              </h4>
                            </div>

                            <div className="p-4 space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                                  <span>Phương thức thanh toán:</span>
                                </div>
                                <span className="font-medium">
                                  {order.payment_methods?.name ||
                                    "Không xác định"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>Trạng thái:</span>
                                </div>
                                <PaymentStatusBadge
                                  status={order.payment_status}
                                />
                              </div>

                              {order.discount_id && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span>Mã giảm giá:</span>
                                  </div>
                                  <Badge variant="outline">
                                    ID: {order.discount_id}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>

                          <Card className="border-dashed">
                            <CardContent className="p-4 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Tạm tính:
                                </span>
                                <span>
                                  {formatCurrency(order.subtotal_amount)}
                                </span>
                              </div>

                              {order.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Giảm giá:</span>
                                  <span>
                                    -{formatCurrency(order.discount_amount)}
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Phí giao hàng:
                                </span>
                                <span>
                                  {formatCurrency(order.shipping_fee)}
                                </span>
                              </div>

                              <Separator />

                              <div className="flex justify-between text-lg font-medium">
                                <span>Tổng cộng:</span>
                                <span>
                                  {formatCurrency(order.total_amount)}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </CardContent>
                      </Card>

                      {/* Lịch sử thanh toán */}
                      <Card className="lg:col-span-3">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <History className="h-4 w-4" /> Lịch sử thanh toán
                          </CardTitle>
                          <CardDescription>
                            Các giao dịch thanh toán liên quan đến đơn hàng
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="border rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Mã GD</TableHead>
                                  <TableHead>Ngày</TableHead>
                                  <TableHead>Số tiền</TableHead>
                                  <TableHead>Phương thức</TableHead>
                                  <TableHead>Trạng thái</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody className="text-sm">
                                <TableRow>
                                  <TableCell className="text-xs">
                                    <Badge
                                      variant="outline"
                                      className="font-mono"
                                    >
                                      {order.id}-1
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {format(
                                      new Date(order.order_date),
                                      "dd/MM/yyyy HH:mm",
                                      { locale: vi }
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {formatCurrency(order.total_amount)}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {order.payment_methods?.name ||
                                      "Không xác định"}
                                  </TableCell>
                                  <TableCell>
                                    <PaymentStatusBadge
                                      status={order.payment_status}
                                    />
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>

                          <div className="mt-4 text-xs text-center text-muted-foreground">
                            <ArrowRightLeft className="mx-auto h-4 w-4 mb-2 opacity-20" />
                            Dữ liệu này sẽ được kết nối với bảng payments để
                            hiển thị lịch sử thanh toán đầy đủ.
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Tab Quản lý - Cải tiến UI */}
                  <TabsContent value="management" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Cập nhật trạng thái
                            đơn hàng
                          </CardTitle>
                          <CardDescription>
                            Thay đổi trạng thái xử lý đơn hàng hoặc hủy đơn
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 px-2 sm:px-6">
                          <OrderStatusUpdate
                            order={order}
                            onSuccess={handleSuccess}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Truck className="h-4 w-4" /> Phân công người giao
                            hàng
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
                    </div>

                    {/* Lịch sử vận đơn */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <History className="h-4 w-4" /> Lịch sử trạng thái
                        </CardTitle>
                        <CardDescription>
                          Lịch sử các thay đổi trạng thái của đơn hàng
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-md p-6">
                          <div className="flex flex-col items-center justify-center text-center">
                            <History className="h-10 w-10 text-muted-foreground/30 mb-2" />
                            <h4 className="font-medium mb-1">
                              Chưa có dữ liệu lịch sử
                            </h4>
                            <p className="text-sm text-muted-foreground max-w-md">
                              Tính năng này sẽ hiển thị lịch sử đầy đủ các thay
                              đổi trạng thái đơn hàng sau khi được kết nối với
                              bảng order_status_history.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>

            {/* Footer sticky */}
            <div className="border-t p-4 bg-muted/20 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Đơn hàng #{order.id} -{" "}
                {format(new Date(order.order_date), "HH:mm - dd/MM/yyyy", {
                  locale: vi,
                })}
              </div>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-6">
            Không tìm thấy thông tin đơn hàng
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
