"use client"

import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Dữ liệu mẫu cho thống kê
const ingredientStats = {
  total: 128,
  categories: {
    "Dung môi": 12,
    "Hương liệu": 76,
    "Bảo quản": 18,
    "Cố định": 14,
    Khác: 8,
  },
  topIngredients: [
    { name: "Alcohol", count: 42 },
    { name: "Aqua", count: 38 },
    { name: "Limonene", count: 31 },
    { name: "Linalool", count: 27 },
    { name: "Citronellol", count: 23 },
  ],
  recentlyAdded: 5,
  unused: 14,
}

// Dữ liệu cho biểu đồ cột
const barChartData = Object.entries(ingredientStats.categories).map(([name, count]) => ({
  name,
  count,
}))

// Dữ liệu cho biểu đồ tròn
const pieChartData = Object.entries(ingredientStats.categories).map(([name, count]) => ({
  name,
  value: count,
}))

// Màu sắc cho biểu đồ tròn
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]

export function IngredientStats() {
  const [timeRange, setTimeRange] = useState("all")

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng số thành phần</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ingredientStats.total}</div>
          <p className="text-xs text-muted-foreground">Thêm mới {ingredientStats.recentlyAdded} trong tháng này</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Số danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Object.keys(ingredientStats.categories).length}</div>
          <p className="text-xs text-muted-foreground">
            Danh mục lớn nhất: Hương liệu ({ingredientStats.categories["Hương liệu"]})
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Thành phần phổ biến nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ingredientStats.topIngredients[0].name}</div>
          <p className="text-xs text-muted-foreground">
            Được sử dụng trong {ingredientStats.topIngredients[0].count} sản phẩm
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Thành phần chưa sử dụng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ingredientStats.unused}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((ingredientStats.unused / ingredientStats.total) * 100)}% tổng số thành phần
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

