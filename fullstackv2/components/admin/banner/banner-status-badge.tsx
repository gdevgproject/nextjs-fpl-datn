import { Badge } from "@/components/ui/badge"

interface Banner {
  is_active: boolean
  start_date: string
  end_date: string
}

interface BannerStatusBadgeProps {
  banner: Banner
}

export function BannerStatusBadge({ banner }: BannerStatusBadgeProps) {
  const now = new Date()
  const startDate = new Date(banner.start_date)
  const endDate = new Date(banner.end_date)

  if (!banner.is_active) {
    return (
      <Badge variant="outline" className="bg-gray-100">
        Không hoạt động
      </Badge>
    )
  }

  if (startDate > now) {
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        Đã lên lịch
      </Badge>
    )
  }

  if (endDate < now) {
    return (
      <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
        Đã hết hạn
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
      Đang hoạt động
    </Badge>
  )
}

