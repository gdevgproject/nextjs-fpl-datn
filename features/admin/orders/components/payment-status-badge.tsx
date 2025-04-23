"use client";

import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "../types";

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  if (!status) return null;

  // Define badge variants based on status
  const getVariant = () => {
    switch (status) {
      case "Pending":
        return "outline";
      case "Paid":
        return "success";
      case "Failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Translate status to Vietnamese
  const getLabel = () => {
    switch (status) {
      case "Pending":
        return "Chờ thanh toán";
      case "Paid":
        return "Đã thanh toán";
      case "Failed":
        return "Thất bại";
      default:
        return status;
    }
  };

  return <Badge variant={getVariant() as any}>{getLabel()}</Badge>;
}
