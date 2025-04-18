import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OrderStatusBadgeProps {
  status: string
  statusId?: number
  className?: string
}

export function OrderStatusBadge({ status, statusId, className }: OrderStatusBadgeProps) {
  // Xác định màu sắc dựa trên statusId hoặc tên trạng thái
  const getVariant = () => {
    // Nếu có statusId, ưu tiên dùng statusId
    if (statusId) {
      switch (statusId) {
        case 1: // Pending
          return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-500"
        case 2: // Processing
          return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-500"
        case 3: // Shipped
          return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-500"
        case 4: // Delivered
          return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-500"
        case 5: // Cancelled
          return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-500"
        case 6: // Refunded
          return "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-500"
        default:
          return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
      }
    }

    // Nếu không có statusId, dùng tên trạng thái
    const statusLower = status.toLowerCase()
    if (statusLower.includes("pending")) {
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-500"
    } else if (statusLower.includes("processing")) {
      return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-500"
    } else if (statusLower.includes("shipped")) {
      return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-500"
    } else if (statusLower.includes("delivered")) {
      return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-500"
    } else if (statusLower.includes("cancelled")) {
      return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-500"
    } else if (statusLower.includes("refunded")) {
      return "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-500"
    }

    return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
  }

  return (
    <Badge className={cn("font-medium", getVariant(), className)} variant="outline">
      {status}
    </Badge>
  )
}

