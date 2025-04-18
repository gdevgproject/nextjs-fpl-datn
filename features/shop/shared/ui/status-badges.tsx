"use client";

import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/features/shop/account/order-types";

type StatusBadgeProps = {
  name: string;
};

export function StatusBadge({ name }: StatusBadgeProps) {
  let variant:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning" = "default";

  // Determine variant based on status name
  const lowerName = name.toLowerCase();
  if (lowerName === "pending" || lowerName === "chờ xử lý") {
    variant = "secondary";
  } else if (lowerName === "processing" || lowerName === "đang xử lý") {
    variant = "warning";
  } else if (lowerName === "shipping" || lowerName === "đang giao") {
    variant = "warning";
  } else if (lowerName === "delivered" || lowerName === "đã giao") {
    variant = "success";
  } else if (lowerName === "cancelled" || lowerName === "đã hủy") {
    variant = "destructive";
  } else if (lowerName === "refunded" || lowerName === "hoàn tiền") {
    variant = "destructive";
  }

  return <Badge variant={variant}>{name}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const variant:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning" = "default";

  const statusMap = {
    Pending: { variant: "warning" as const, label: "Chờ thanh toán" },
    Paid: { variant: "success" as const, label: "Đã thanh toán" },
    Failed: { variant: "destructive" as const, label: "Thất bại" },
    Refunded: { variant: "destructive" as const, label: "Đã hoàn tiền" },
  };

  const { variant: badgeVariant, label } = statusMap[status] || {
    variant: "secondary",
    label: status,
  };

  return <Badge variant={badgeVariant}>{label}</Badge>;
}
