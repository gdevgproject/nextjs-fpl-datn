"use client"

import { Badge } from "@/components/ui/badge"

interface OrderStatusBadgeProps {
  status: {
    id: number
    name: string
  }
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  if (!status) return null

  // Define badge variants based on status
  const getVariant = () => {
    switch (status.name) {
      case "Chờ xác nhận":
        return "outline"
      case "Đã xác nhận":
        return "secondary"
      case "Đang xử lý":
        return "default"
      case "Đang giao":
        return "default"
      case "Đã giao":
        return "success"
      case "Đã hoàn thành":
        return "success"
      case "Đã hủy":
        return "destructive"
      default:
        return "outline"
    }
  }

  return <Badge variant={getVariant() as any}>{status.name}</Badge>
}
