"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

// Mock data
const dayData = [
  { name: "00:00", impressions: 240, clicks: 12 },
  { name: "03:00", impressions: 120, clicks: 6 },
  { name: "06:00", impressions: 180, clicks: 9 },
  { name: "09:00", impressions: 860, clicks: 43 },
  { name: "12:00", impressions: 1200, clicks: 60 },
  { name: "15:00", impressions: 1400, clicks: 70 },
  { name: "18:00", impressions: 1600, clicks: 80 },
  { name: "21:00", impressions: 960, clicks: 48 },
]

const weekData = [
  { name: "T2", impressions: 3200, clicks: 160 },
  { name: "T3", impressions: 3600, clicks: 180 },
  { name: "T4", impressions: 3800, clicks: 190 },
  { name: "T5", impressions: 4200, clicks: 210 },
  { name: "T6", impressions: 4600, clicks: 230 },
  { name: "T7", impressions: 3200, clicks: 160 },
  { name: "CN", impressions: 2000, clicks: 100 },
]

const monthData = [
  { name: "Tuần 1", impressions: 22000, clicks: 1100 },
  { name: "Tuần 2", impressions: 24000, clicks: 1200 },
  { name: "Tuần 3", impressions: 26000, clicks: 1300 },
  { name: "Tuần 4", impressions: 28000, clicks: 1400 },
]

interface BannerPerformanceChartProps {
  period: "day" | "week" | "month" | "year"
}

export function BannerPerformanceChart({ period }: BannerPerformanceChartProps) {
  const getData = () => {
    switch (period) {
      case "day":
        return dayData
      case "week":
        return weekData
      case "month":
        return monthData
      default:
        return weekData
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={getData()}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="left"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            border: "none",
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="impressions"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Lượt hiển thị"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="clicks"
          stroke="#f97316"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Lượt nhấp chuột"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

