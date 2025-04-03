"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ChartData = {
  name: string
  value: number
  color: string
}

export function ScentAnalytics() {
  const [chartPeriod, setChartPeriod] = useState<"all" | "month" | "year">("all")

  // Dữ liệu mẫu cho biểu đồ
  const scentUsageData: ChartData[] = [
    { name: "Hoa hồng", value: 20, color: "#ec4899" },
    { name: "Hoa nhài", value: 15, color: "#ec4899" },
    { name: "Vani", value: 18, color: "#eab308" },
    { name: "Gỗ đàn hương", value: 12, color: "#d97706" },
    { name: "Xạ hương", value: 10, color: "#a855f7" },
    { name: "Cam Bergamot", value: 8, color: "#84cc16" },
    { name: "Quế", value: 5, color: "#ef4444" },
    { name: "Biển", value: 7, color: "#06b6d4" },
  ]

  const scentGroupData: ChartData[] = [
    { name: "Hương hoa", value: 15, color: "#ec4899" },
    { name: "Hương trái cây", value: 8, color: "#f97316" },
    { name: "Hương gỗ", value: 7, color: "#d97706" },
    { name: "Hương phương Đông", value: 5, color: "#a855f7" },
    { name: "Hương tươi mát", value: 4, color: "#0ea5e9" },
    { name: "Hương cay nồng", value: 3, color: "#ef4444" },
    { name: "Hương thực phẩm", value: 2, color: "#eab308" },
    { name: "Hương xanh", value: 1, color: "#22c55e" },
  ]

  // Tính toán tổng giá trị
  const totalUsage = scentUsageData.reduce((sum, item) => sum + item.value, 0)
  const totalGroups = scentGroupData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Phân tích mùi hương</CardTitle>
            <CardDescription>Thống kê về việc sử dụng mùi hương trong sản phẩm</CardDescription>
          </div>
          <Select value={chartPeriod} onValueChange={(value) => setChartPeriod(value as "all" | "month" | "year")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thời gian</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="usage">
          <TabsList className="mb-4">
            <TabsTrigger value="usage">Mùi hương phổ biến</TabsTrigger>
            <TabsTrigger value="groups">Nhóm mùi hương</TabsTrigger>
          </TabsList>

          <TabsContent value="usage">
            <div className="h-[300px] w-full">
              {/* Biểu đồ cột cho mùi hương phổ biến */}
              <div className="flex h-full items-end gap-2">
                {scentUsageData.map((item, index) => (
                  <div key={index} className="relative flex h-full w-full flex-col justify-end">
                    <div
                      className="w-full rounded-md transition-all duration-500"
                      style={{
                        height: `${(item.value / Math.max(...scentUsageData.map((d) => d.value))) * 100}%`,
                        backgroundColor: item.color,
                        minHeight: "20px",
                      }}
                    />
                    <div className="mt-2 text-center">
                      <span className="text-xs font-medium truncate block">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 text-sm text-center text-muted-foreground">Tổng số lượt sử dụng: {totalUsage}</div>
          </TabsContent>

          <TabsContent value="groups">
            <div className="h-[300px] w-full flex justify-center items-center">
              {/* Biểu đồ tròn cho nhóm mùi hương */}
              <div className="relative h-[250px] w-[250px]">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  {scentGroupData.map((item, index) => {
                    // Tính toán góc cho mỗi phần của biểu đồ tròn
                    const startAngle = scentGroupData
                      .slice(0, index)
                      .reduce((sum, d) => sum + (d.value / totalGroups) * 360, 0)
                    const endAngle = startAngle + (item.value / totalGroups) * 360

                    // Chuyển đổi góc sang tọa độ
                    const startX = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180))
                    const startY = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180))
                    const endX = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180))
                    const endY = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180))

                    // Tạo path cho phần của biểu đồ tròn
                    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
                    const pathData = [
                      `M 50 50`,
                      `L ${startX} ${startY}`,
                      `A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                      `Z`,
                    ].join(" ")

                    return <path key={index} d={pathData} fill={item.color} stroke="white" strokeWidth="0.5" />
                  })}
                </svg>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {scentGroupData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {Math.round((item.value / totalGroups) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

