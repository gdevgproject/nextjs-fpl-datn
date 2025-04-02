import { Badge } from "@/components/ui/badge"
import { Check, Clock, X } from "lucide-react"

interface ReviewStatusBadgeProps {
  status: "pending" | "approved" | "rejected"
}

export function ReviewStatusBadge({ status }: ReviewStatusBadgeProps) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Chờ duyệt
        </Badge>
      )
    case "approved":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <Check className="h-3 w-3" />
          Đã duyệt
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <X className="h-3 w-3" />
          Từ chối
        </Badge>
      )
    default:
      return null
  }
}

