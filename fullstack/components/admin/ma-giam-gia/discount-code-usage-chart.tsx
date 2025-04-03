"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data
const dailyData = [
  { date: "01/06", uses: 2, amount: 150000 },
  { date: "02/06", uses: 3, amount: 225000 },
  { date: "03/06", uses: 5, amount: 375000 },
  { date: "04/06", uses: 4, amount: 300000 },
  { date: "05/06", uses: 7, amount: 525000 },
  { date: "06/06", uses: 6, amount: 450000 },
  { date: "07/06", uses: 8, amount: 600000 },
]

const weeklyData = [
  { date: "Tuần 1", uses: 15, amount: 1125000 },
  { date: "Tuần 2", uses: 20, amount: 1500000 },
  { date: "Tuần 3", uses: 12, amount: 900000 },
  { date: "Tuần 4", uses: 8, amount: 600000 },
]

const monthlyData = [
  { date: "T6", uses: 55, amount: 4125000 },
  { date: "T7", uses: 0, amount: 0 },
  { date: "T8", uses: 0, amount: 0 },
]

export function DiscountCodeUsageChart() {
  const [period, setPeriod] = useState("daily")

  const data = period === "daily" ? dailyData : period === "weekly" ? weeklyData : monthlyData

  return (
    <Card>
      <CardContent className="p-4">
        <Tabs value={period} onValueChange={setPeriod}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Biểu đồ sử dụng</h3>
            <TabsList>
              <TabsTrigger value="daily">Ngày</TabsTrigger>
              <TabsTrigger value="weekly">Tuần</TabsTrigger>
              <TabsTrigger value="monthly">Tháng</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="daily" className="mt-0">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "amount")
                      return [`${new Intl.NumberFormat("vi-VN").format(value as number)}đ`, "Giảm giá"]
                    return [value, "Lượt sử dụng"]
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="uses" name="Lượt sử dụng" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="amount" name="Giảm giá" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="weekly" className="mt-0">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "amount")
                      return [`${new Intl.NumberFormat("vi-VN").format(value as number)}đ`, "Giảm giá"]
                    return [value, "Lượt sử dụng"]
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="uses" name="Lượt sử dụng" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="amount" name="Giảm giá" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="monthly" className="mt-0">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "amount")
                      return [`${new Intl.NumberFormat("vi-VN").format(value as number)}đ`, "Giảm giá"]
                    return [value, "Lượt sử dụng"]
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="uses" name="Lượt sử dụng" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="amount" name="Giảm giá" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

