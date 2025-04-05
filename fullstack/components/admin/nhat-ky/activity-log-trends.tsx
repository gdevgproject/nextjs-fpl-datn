"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data for demonstration - would be aggregated from the database
const activityByDateData = [
  { date: "01/06", count: 5 },
  { date: "02/06", count: 8 },
  { date: "03/06", count: 12 },
  { date: "04/06", count: 7 },
  { date: "05/06", count: 10 },
  { date: "06/06", count: 15 },
  { date: "07/06", count: 9 },
]

const activityByTypeData = [
  { name: "Thêm sản phẩm", value: 25 },
  { name: "Cập nhật sản phẩm", value: 35 },
  { name: "Xóa sản phẩm", value: 10 },
  { name: "Cập nhật đơn hàng", value: 45 },
  { name: "Duyệt đánh giá", value: 20 },
  { name: "Khác", value: 15 },
]

const activityByUserData = [
  { name: "Admin", value: 80 },
  { name: "Nhân viên", value: 65 },
  { name: "Quản lý", value: 35 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function ActivityLogTrends() {
  const [timeRange, setTimeRange] = useState("7days")

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Xu hướng hoạt động</CardTitle>
          <CardDescription>Phân tích hoạt động của quản trị viên theo thời gian</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 ngày qua</SelectItem>
            <SelectItem value="30days">30 ngày qua</SelectItem>
            <SelectItem value="90days">90 ngày qua</SelectItem>
            <SelectItem value="year">Năm nay</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="byDate" className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="byDate">Theo ngày</TabsTrigger>
            <TabsTrigger value="byType">Theo loại</TabsTrigger>
            <TabsTrigger value="byUser">Theo người dùng</TabsTrigger>
          </TabsList>

          <TabsContent value="byDate" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityByDateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Số hoạt động" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="byType">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityByTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {activityByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="byUser">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={activityByUserData}
                  margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" name="Số hoạt động" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

