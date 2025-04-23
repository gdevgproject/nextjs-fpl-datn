"use client";

import { memo } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

interface Order {
  id: number;
  created_at: string;
  subtotal_amount: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  order_status_id: number;
  payment_status: string;
  order_statuses: {
    name: string;
  };
}

interface UserOrdersTabProps {
  orders: Order[];
  isLoading?: boolean;
}

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date helper
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
};

// Get order status badge variant
const getOrderStatusVariant = (statusId: number) => {
  switch (statusId) {
    case 1: // Pending
      return "warning";
    case 2: // Confirmed
      return "secondary";
    case 3: // Shipping
      return "info";
    case 4: // Completed
      return "success";
    case 5: // Cancelled
      return "destructive";
    default:
      return "secondary";
  }
};

// Get payment status badge variant
const getPaymentStatusVariant = (status: string) => {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
};

// Get payment status label
const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case "paid":
      return "Đã thanh toán";
    case "pending":
      return "Chờ thanh toán";
    case "failed":
      return "Thanh toán thất bại";
    default:
      return status;
  }
};

function UserOrdersTabComponent({
  orders,
  isLoading = false,
}: UserOrdersTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          Người dùng này chưa đặt đơn hàng nào.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Đơn hàng #{order.id}</div>
              <div className="flex items-center gap-2">
                <Badge variant={getOrderStatusVariant(order.order_status_id)}>
                  {order.order_statuses?.name || "Không xác định"}
                </Badge>
                <Badge variant={getPaymentStatusVariant(order.payment_status)}>
                  {getPaymentStatusLabel(order.payment_status)}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Ngày đặt: {formatDate(order.created_at)}
              </span>
              <span className="font-medium">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
            <div className="flex justify-end mt-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/orders/${order.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default memo(UserOrdersTabComponent);
