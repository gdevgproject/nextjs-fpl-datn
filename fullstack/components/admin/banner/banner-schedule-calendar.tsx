"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Mock data
const bannerEvents = [
  {
    id: "1",
    title: "Khuyến mãi mùa hè",
    start_date: new Date(2023, 5, 1),
    end_date: new Date(2023, 7, 31),
    is_active: true,
  },
  {
    id: "2",
    title: "Bộ sưu tập mới",
    start_date: new Date(2023, 8, 1),
    end_date: new Date(2023, 10, 30),
    is_active: true,
  },
  {
    id: "3",
    title: "Flash Sale",
    start_date: new Date(2023, 6, 15),
    end_date: new Date(2023, 6, 16),
    is_active: false,
  },
  {
    id: "4",
    title: "Quà tặng đặc biệt",
    start_date: new Date(2023, 9, 1),
    end_date: new Date(2023, 9, 31),
    is_active: true,
  },
  {
    id: "5",
    title: "Black Friday",
    start_date: new Date(2023, 10, 24),
    end_date: new Date(2023, 10, 27),
    is_active: true,
  },
  {
    id: "6",
    title: "Giáng sinh",
    start_date: new Date(2023, 11, 1),
    end_date: new Date(2023, 11, 25),
    is_active: true,
  },
]

export function BannerScheduleCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Get banners for the selected date
  const getBannersForDate = (date: Date | undefined) => {
    if (!date) return []

    return bannerEvents.filter((banner) => {
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
                      <div className="text-sm text-muted-foreground mt-2">
                        {format(banner.start_date, "dd/MM/yyyy")} - {format(banner.end_date, "dd/MM/yyyy")}
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
  )
}

