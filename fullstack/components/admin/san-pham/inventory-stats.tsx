"use client"

import { Package, AlertTriangle, XCircle, TrendingUp, TrendingDown } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function InventoryStats() {
  // Dữ liệu mẫu - sẽ được thay thế bằng dữ liệu thực từ API
  const stats = [
    {
      title: "Tổng sản phẩm",
      value: 245,
      icon: Package,
      change: 12,
      trend: "up",
      description: "so với tháng trước",
    },
    {
      title: "Sắp hết hàng",
      value: 18,
      icon: AlertTriangle,
      change: 5,
      trend: "up",
      description: "so với tháng trước",
    },
    {
      title: "Hết hàng",
      value: 7,
      icon: XCircle,
      change: 2,
      trend: "down",
      description: "so với tháng trước",
    },
    {
      title: "Giá trị tồn kho",
      value: "1.2 tỷ",
      icon: Package,
      change: 8,
      trend: "up",
      description: "so với tháng trước",
      valueClass: "text-green-600 dark:text-green-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className={`text-2xl font-bold mt-1 ${stat.valueClass || ""}`}>{stat.value}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-xs">
              {stat.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}%</span>
              <span className="text-muted-foreground ml-1">{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

