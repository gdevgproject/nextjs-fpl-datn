import { Badge } from "@/components/ui/badge"

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"

interface OrderStatusBadgeProps {
  status: OrderStatus | string
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  switch (status) {
    case "Pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
          Chờ xử lý
        </Badge>
      )
    case "Processing":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
          Đang xử lý
        </Badge>
      )
    case "Shipped":
      return (
        <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">
          Đang giao hàng
        </Badge>
      )
    case "Delivered":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          Đã giao hàng
        </Badge>
      )
    case "Cancelled":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
          Đã hủy
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

