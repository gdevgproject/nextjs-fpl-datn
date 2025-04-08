import { Badge } from "@/components/ui/badge"

type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded"

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  switch (status) {
    case "Pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
          Chờ thanh toán
        </Badge>
      )
    case "Paid":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          Đã thanh toán
        </Badge>
      )
    case "Failed":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
          Thanh toán thất bại
        </Badge>
      )
    case "Refunded":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
          Đã hoàn tiền
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

