"use client"

import { useState } from "react"
import { Calendar, Eye, ImageIcon, MousePointerClick } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BannerStatsChart } from "./banner-stats-chart"
import { BannerPerformanceChart } from "./banner-performance-chart"
import { BannerScheduleCalendar } from "./banner-schedule-calendar"
import { useMediaQuery } from "@/hooks/use-media-query"

export function BannerDashboard() {
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("week")
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  // Mock data
  const stats = {
    total: 12,
    active: 5,
    scheduled: 3,
    expired: 4,
    impressions: 24560,
    clicks: 1245,
    ctr: 5.07,
    upcoming: 2,
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số banner</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.active} đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lượt hiển thị</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.impressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Trong 7 ngày qua</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lượt nhấp chuột</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">CTR: {stats.ctr}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sắp diễn ra</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground mt-1">Banner đã lên lịch</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList>
          <TabsTrigger value="stats">Thống kê</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          {isDesktop && <TabsTrigger value="schedule">Lịch trình</TabsTrigger>}
        </TabsList>
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê banner</CardTitle>
              <CardDescription>Số lượng banner theo trạng thái</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <BannerStatsChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hiệu suất banner</CardTitle>
                <CardDescription>Lượt hiển thị và nhấp chuột theo thời gian</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <TabsList>
                  <TabsTrigger
                    value="day"
                    onClick={() => setPeriod("day")}
                    className={period === "day" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Ngày
                  </TabsTrigger>
                  <TabsTrigger
                    value="week"
                    onClick={() => setPeriod("week")}
                    className={period === "week" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Tuần
                  </TabsTrigger>
                  <TabsTrigger
                    value="month"
                    onClick={() => setPeriod("month")}
                    className={period === "month" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Tháng
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <BannerPerformanceChart period={period} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch trình banner</CardTitle>
              <CardDescription>Xem lịch trình hiển thị banner</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <BannerScheduleCalendar />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

