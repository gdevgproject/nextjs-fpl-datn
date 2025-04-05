import { Badge } from "@/components/ui/badge"

interface ActivityTypeBadgeProps {
  type: string
}

export function ActivityTypeBadge({ type }: ActivityTypeBadgeProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "product_create":
        return { label: "Thêm sản phẩm", variant: "default" as const }
      case "product_update":
        return { label: "Cập nhật sản phẩm", variant: "outline" as const }
      case "product_delete":
        return { label: "Xóa sản phẩm", variant: "destructive" as const }
      case "order_status_update":
        return { label: "Cập nhật đơn hàng", variant: "secondary" as const }
      case "discount_create":
        return { label: "Thêm mã giảm giá", variant: "default" as const }
      case "discount_update":
        return { label: "Cập nhật mã giảm giá", variant: "outline" as const }
      case "discount_delete":
        return { label: "Xóa mã giảm giá", variant: "destructive" as const }
      case "user_role_update":
        return { label: "Cập nhật quyền", variant: "secondary" as const }
      case "review_approve":
        return { label: "Duyệt đánh giá", variant: "default" as const }
      case "review_reject":
        return { label: "Từ chối đánh giá", variant: "destructive" as const }
      default:
        return { label: type, variant: "outline" as const }
    }
  }

  const config = getTypeConfig(type)

  return (
    <Badge variant={config.variant} className="whitespace-nowrap">
      {config.label}
    </Badge>
  )
}

