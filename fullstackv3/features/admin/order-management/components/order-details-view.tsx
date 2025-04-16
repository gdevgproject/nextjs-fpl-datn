"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  PackageCheck,
  UserIcon,
  Truck,
  Receipt,
  Clock,
  CreditCard,
  DollarSign,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  PaymentStatusBadge,
  StatusBadge,
} from "@/features/shop/shared/ui/status-badges";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import {
  formatCurrency,
  formatDate,
  formatPhoneNumber,
} from "@/lib/utils/format";
import type { OrderDetails, OrderActivityLog } from "../types";
import type { PaymentStatus } from "@/features/shop/account/order-types";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";

interface OrderDetailsViewProps {
  order: OrderDetails;
  orderStatuses: Array<{ id: number; name: string }>;
  activityLog?: OrderActivityLog[];
  isAdmin: boolean;
  updateOrderStatus: (
    orderId: number,
    statusId: number
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateOrderTracking: (
    orderId: number,
    trackingNumber: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  updatePaymentStatus: (
    orderId: number,
    status: PaymentStatus
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export default function OrderDetailsView({
  order,
  orderStatuses,
  activityLog = [],
  isAdmin,
  updateOrderStatus,
  updateOrderTracking,
  updatePaymentStatus,
}: OrderDetailsViewProps) {
  const router = useRouter();
  const { toast } = useSonnerToast();

  // State for editable fields
  const [selectedStatus, setSelectedStatus] = useState<number>(
    order.orderStatusId
  );
  const [trackingNumber, setTrackingNumber] = useState<string>(
    order.trackingNumber || ""
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<PaymentStatus>(order.paymentStatus);

  // Loading states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingTracking, setUpdatingTracking] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  // Update order status
  const handleStatusUpdate = async () => {
    if (selectedStatus === order.orderStatusId) return;

    setUpdatingStatus(true);
    try {
      const result = await updateOrderStatus(order.id, selectedStatus);

      if (result.success) {
        toast("Cập nhật thành công", { description: result.message });
      } else {
        toast("Cập nhật thất bại", {
          description: result.error || "Đã xảy ra lỗi",
        });
      }
    } catch (error) {
      toast("Cập nhật thất bại", {
        description: "Đã xảy ra lỗi không mong muốn",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Update tracking number
  const handleTrackingUpdate = async () => {
    if (trackingNumber === order.trackingNumber) return;

    setUpdatingTracking(true);
    try {
      const result = await updateOrderTracking(order.id, trackingNumber);

      if (result.success) {
        toast("Cập nhật thành công", { description: result.message });
      } else {
        toast("Cập nhật thất bại", {
          description: result.error || "Đã xảy ra lỗi",
        });
      }
    } catch (error) {
      toast("Cập nhật thất bại", {
        description: "Đã xảy ra lỗi không mong muốn",
      });
    } finally {
      setUpdatingTracking(false);
    }
  };

  // Update payment status
  const handlePaymentStatusUpdate = async () => {
    if (selectedPaymentStatus === order.paymentStatus) return;

    setUpdatingPayment(true);
    try {
      const result = await updatePaymentStatus(order.id, selectedPaymentStatus);

      if (result.success) {
        toast("Cập nhật thành công", { description: result.message });
      } else {
        toast("Cập nhật thất bại", {
          description: result.error || "Đã xảy ra lỗi",
        });
      }
    } catch (error) {
      toast("Cập nhật thất bại", {
        description: "Đã xảy ra lỗi không mong muốn",
      });
    } finally {
      setUpdatingPayment(false);
    }
  };

  // Helper to format activity timestamp
  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to get badge for payment status
  const getPaymentStatusBadge = (status: PaymentStatus) => {
    return <PaymentStatusBadge status={status} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng #{order.id}</h1>
        </div>

        <div className="flex items-center space-x-2">
          <StatusBadge name={order.orderStatusName} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Customer information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5" />
              <span>Thông tin khách hàng</span>
            </CardTitle>
            <CardDescription>
              {order.isGuest
                ? "Khách không đăng nhập"
                : "Khách hàng đã đăng ký"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 pb-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image
                  src={DEFAULT_AVATAR_URL}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {order.isGuest ? "Khách vãng lai" : "Thành viên"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {order.customerEmail && (
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customerEmail}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Số điện thoại</p>
                <p className="text-sm text-muted-foreground">
                  {formatPhoneNumber(order.customerPhone)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Ngày đặt hàng</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(order.orderDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <span>Thông tin vận chuyển</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Người nhận</p>
                <p className="text-sm text-muted-foreground">
                  {order.recipientName} -{" "}
                  {formatPhoneNumber(order.recipientPhone)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Địa chỉ giao hàng</p>
                <p className="text-sm text-muted-foreground">
                  {order.streetAddress}, {order.ward}, {order.district},{" "}
                  {order.provinceCity}
                </p>
              </div>
              {order.deliveryNotes && (
                <div>
                  <p className="text-sm font-medium">Ghi chú giao hàng</p>
                  <p className="text-sm text-muted-foreground">
                    {order.deliveryNotes}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Mã vận đơn</p>
                <div className="mt-1 flex items-center space-x-2">
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Nhập mã vận đơn"
                    className="h-8 w-full"
                  />
                  <Button
                    size="sm"
                    onClick={handleTrackingUpdate}
                    disabled={
                      trackingNumber === order.trackingNumber ||
                      updatingTracking
                    }
                  >
                    {updatingTracking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Lưu"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order status & payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PackageCheck className="h-5 w-5" />
              <span>Trạng thái đơn hàng</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Trạng thái hiện tại</p>
                <div className="mt-1 flex items-center space-x-2">
                  <Select
                    value={selectedStatus.toString()}
                    onValueChange={(value) =>
                      setSelectedStatus(Number.parseInt(value))
                    }
                  >
                    <SelectTrigger className="h-8 w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem
                          key={status.id}
                          value={status.id.toString()}
                        >
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleStatusUpdate}
                    disabled={
                      selectedStatus === order.orderStatusId || updatingStatus
                    }
                  >
                    {updatingStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Lưu"
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Phương thức thanh toán</p>
                <p className="text-sm text-muted-foreground">
                  {order.paymentMethodName || "Không xác định"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Trạng thái thanh toán</p>
                <div className="mt-1 flex items-center space-x-2">
                  <Select
                    value={selectedPaymentStatus}
                    onValueChange={(value) =>
                      setSelectedPaymentStatus(value as PaymentStatus)
                    }
                  >
                    <SelectTrigger className="h-8 w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Chờ thanh toán</SelectItem>
                      <SelectItem value="Paid">Đã thanh toán</SelectItem>
                      <SelectItem value="Failed">Thất bại</SelectItem>
                      <SelectItem value="Refunded">Đã hoàn tiền</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handlePaymentStatusUpdate}
                    disabled={
                      selectedPaymentStatus === order.paymentStatus ||
                      updatingPayment
                    }
                  >
                    {updatingPayment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Lưu"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order items section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Chi tiết đơn hàng</span>
          </CardTitle>
          <CardDescription>
            {order.items.length} sản phẩm, tổng:{" "}
            {formatCurrency(order.totalAmount)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Ảnh</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 overflow-hidden rounded-md">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <span className="text-xs text-muted-foreground">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.variantVolumeMl}ml
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>Tạm tính</span>
              <span>{formatCurrency(order.subtotalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Giảm giá</span>
              <span>- {formatCurrency(order.discountAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Phí vận chuyển</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Tổng cộng</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Chi tiết thanh toán</span>
          </CardTitle>
          <CardDescription>Thông tin các giao dịch thanh toán</CardDescription>
        </CardHeader>
        <CardContent>
          {!order.payments || order.payments.length === 0 ? (
            <p className="text-muted-foreground py-4">
              Không tìm thấy giao dịch thanh toán nào
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Ngày thanh toán</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Mã giao dịch</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>{payment.paymentMethodName}</TableCell>
                    <TableCell>{payment.transactionId || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(payment.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {order.paymentStatus === "Pending" && (
          <CardFooter>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Đánh dấu đã thanh toán
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác nhận thanh toán</DialogTitle>
                  <DialogDescription>
                    Bạn có chắc muốn đánh dấu đơn hàng #{order.id} là đã thanh
                    toán không?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPaymentStatus(order.paymentStatus);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedPaymentStatus("Paid");
                      handlePaymentStatusUpdate();
                    }}
                    disabled={updatingPayment}
                  >
                    {updatingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý
                      </>
                    ) : (
                      "Xác nhận"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        )}
      </Card>

      {/* Activity log (admin only) */}
      {isAdmin && activityLog && activityLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Nhật ký hoạt động</span>
            </CardTitle>
            <CardDescription>Lịch sử thay đổi đơn hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLog.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="relative mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatActivityTime(activity.timestamp)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Thực hiện bởi: {activity.adminUserName || "Hệ thống"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
