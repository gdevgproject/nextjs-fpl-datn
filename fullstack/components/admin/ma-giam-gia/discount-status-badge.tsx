import { Badge } from "@/components/ui/badge"

interface DiscountStatusBadgeProps {
  status: string
}

export function DiscountStatusBadge({ status }: DiscountStatusBadgeProps) {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Đang hoạt động
        </Badge>
      )
    case "inactive":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Không hoạt động
        </Badge>
      )
    case "expired":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Đã hết hạn
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          {status}
        </Badge>
      )
  }
}

