"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Eye, Edit } from "lucide-react"
import Link from "next/link"
import { BannerPreviewDialog } from "./banner-preview-dialog"

interface BannerCalendarViewProps {
  banners: any[]
  onPreview: (banner: any) => void
  previewDialogOpen: boolean
  setPreviewDialogOpen: (open: boolean) => void
  previewBanner: any
}

export function BannerCalendarView({
  banners,
  onPreview,
  previewDialogOpen,
  setPreviewDialogOpen,
  previewBanner,
}: BannerCalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Get banners for the selected date
  const getBannersForDate = (date: Date | undefined) => {
    if (!date) return []

    return banners.filter((banner) => {
      const selectedDate = new Date(date)
      selectedDate.setHours(0, 0, 0, 0)

      const startDate = new Date(banner.start_date)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(banner.end_date)
      endDate.setHours(23, 59, 59, 999)

      return selectedDate >= startDate && selectedDate <= endDate
    })
  }

  // Highlight dates with banners
  const isDayWithBanner = (day: Date) => {
    const bannersForDay = getBannersForDate(day)
    return bannersForDay.length > 0
  }

  const selectedDateBanners = getBannersForDate(date)

  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={vi}
            className="rounded-md border w-full"
            modifiers={{
              withBanner: (date) => isDayWithBanner(date),
            }}
            modifiersStyles={{
              withBanner: {
                fontWeight: "bold",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                borderRadius: "0",
              },
            }}
          />
        </div>
        <div className="lg:w-1/2">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">
                {date ? format(date, "EEEE, dd MMMM yyyy", { locale: vi }) : "Chọn ngày"}
              </h3>
              {selectedDateBanners.length > 0 ? (
                <ScrollArea className="h-[350px] pr-4">
                  <div className="space-y-3">
                    {selectedDateBanners.map((banner) => (
                      <div key={banner.id} className="border rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{banner.title}</h4>
                          <Badge variant={banner.is_active ? "outline" : "secondary"}>
                            {banner.is_active ? "Đang hoạt động" : "Không hoạt động"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{banner.subtitle}</p>
                        <div className="text-sm text-muted-foreground mt-2">
                          {format(new Date(banner.start_date), "dd/MM/yyyy")} -{" "}
                          {format(new Date(banner.end_date), "dd/MM/yyyy")}
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => onPreview(banner)}>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Xem trước
                          </Button>
                          <Link href={`/admin/banner/${banner.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Chỉnh sửa
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-[350px] text-center text-muted-foreground">
                  <p>Không có banner nào vào ngày này</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <BannerPreviewDialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen} banner={previewBanner} />
    </div>
  )
}

