"use client"

import { useState } from "react"
import { Package, Clock, CheckCircle2, TrendingUp, Calendar, CalendarDays, CalendarRange } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function OrderDashboard() {
  const [timeRange, setTimeRange] = useState("today")

  // Giả lập dữ liệu thống kê
  const stats = {
    today: {
      total: 12,
      pending: 5,
      completed: 6,
      cancelled: 1,
      revenue: "12.500.000",
    },
    week: {
      total: 87,
      pending: 15,
      completed: 68,
      cancelled: 4,
      revenue: "87.350.000",
    },
    month: {
      total: 342,
      pending: 28,
      completed: 305,
      cancelled: 9,
      revenue: "342.750.000",
    },
  }

  const currentStats = stats[timeRange as keyof typeof stats]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-medium">Tổng quan đơn hàng</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("today")}
            className="h-8"
          >
            <Calendar className="mr-1 h-4 w-4" />
            Hôm nay
          </Button>
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("week")}
            className="h-8"
          >
            <CalendarDays className="mr-1 h-4 w-4" />
            Tuần này
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
            className="h-8"
          >
            <CalendarRange className="mr-1 h-4 w-4" />
            Tháng này
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.total}</div>
            <p className="text-xs text-muted-foreground">đơn hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn chờ xử lý</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.pending}</div>
            <p className="text-xs text-muted-foreground">đơn hàng cần xử lý</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.completed}</div>
            <p className="text-xs text-muted-foreground">đơn hàng đã giao</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.revenue} ₫</div>
            <p className="text-xs text-muted-foreground">
              doanh thu {timeRange === "today" ? "hôm nay" : timeRange === "week" ? "tuần này" : "tháng này"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

