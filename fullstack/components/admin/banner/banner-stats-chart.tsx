"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// Mock data
const data = [
  {
    name: "Đang hoạt động",
    total: 5,
    color: "#22c55e",
  },
  {
    name: "Không hoạt động",
    total: 2,
    color: "#94a3b8",
  },
  {
    name: "Đã lên lịch",
    total: 3,
    color: "#3b82f6",
  },
  {
    name: "Đã hết hạn",
    total: 4,
    color: "#f97316",
  },
]

export function BannerStatsChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            border: "none",
          }}
          formatter={(value) => [`${value} banner`, ""]}
          labelFormatter={(label) => `Trạng thái: ${label}`}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]} className="fill-primary" fill={(entry) => entry.color} />
      </BarChart>
    </ResponsiveContainer>
  )
}

