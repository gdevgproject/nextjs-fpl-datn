"use client"

import { format, isAfter, isBefore } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar, Clock, CheckCircle, XCircle, Clock3 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface BannerScheduleInfoProps {
  startDate: Date
  endDate: Date
  isActive: boolean
}

export function BannerScheduleInfo({ startDate, endDate, isActive }: BannerScheduleInfoProps) {
  const now = new Date()
  const isStartInFuture = isAfter(startDate, now)
  const isEndInPast = isBefore(endDate, now)
  const isCurrentlyInSchedule = !isStartInFuture && !isEndInPast

  // Tính toán trạng thái hiển thị của banner
  const willDisplay = isActive && !isEndInPast
  const isScheduled = isActive && isStartInFuture
  const isExpired = isEndInPast
  const isActiveNow = isActive && isCurrentlyInSchedule

  // Xác định loại thông báo
  let alertType: "default" | "destructive" | "success" = "default"
  if (isExpired) {
    alertType = "destructive"
  } else if (isActiveNow) {
    alertType = "success"
  }

  // Tạo thông báo
  let icon = <Clock className="h-4 w-4" />
  let title = "Thông tin lịch trình"
  let description = ""

  if (isExpired) {
    icon = <XCircle className="h-4 w-4" />
    title = "Banner đã hết hạn"
    description = `Banner đã hết hạn vào ngày ${format(endDate, "dd/MM/yyyy", { locale: vi })}`
  } else if (!isActive) {
    icon = <XCircle className="h-4 w-4" />
    title = "Banner không hoạt động"
    description = "Banner đã bị vô hiệu hóa và sẽ không hiển thị trên trang web"
  } else if (isScheduled) {
    icon = <Clock3 className="h-4 w-4" />
    title = "Banner đã lên lịch"
    description = `Banner sẽ hiển thị từ ngày ${format(startDate, "dd/MM/yyyy", { locale: vi })}`
  } else if (isActiveNow) {
    icon = <CheckCircle className="h-4 w-4" />
    title = "Banner đang hoạt động"
    description = `Banner đang hiển thị và sẽ kết thúc vào ngày ${format(endDate, "dd/MM/yyyy", { locale: vi })}`
  }

  return (
    <Alert variant={alertType}>
      <div className="flex items-start">
        {icon}
        <div className="ml-2">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm">
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span>
                {format(startDate, "dd/MM/yyyy", { locale: vi })} - {format(endDate, "dd/MM/yyyy", { locale: vi })}
              </span>
            </div>

            {willDisplay && (
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>
                  {isStartInFuture
                    ? `Sẽ hiển thị sau ${Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} ngày`
                    : `Còn ${Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} ngày hiển thị`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Alert>
  )
}

