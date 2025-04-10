"use client"

import { Package, PackageCheck, PackageX, PackageMinus, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function ProductStats() {
  // Dữ liệu mẫu - trong thực tế sẽ lấy từ API
  const stats = [
    {
      title: "Tổng sản phẩm",
      value: 156,
      change: "+12% so với tháng trước",
      trend: "up",
      icon: Package,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Còn hàng",
      value: 124,
      change: "79% tổng sản phẩm",
      trend: "neutral",
      icon: PackageCheck,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Hết hàng",
      value: 28,
      change: "18% tổng sản phẩm",
      trend: "neutral",
      icon: PackageX,
      color: "bg-red-100 text-red-700",
    },
    {
      title: "Đã xóa",
      value: 4,
      change: "3% tổng sản phẩm",
      trend: "neutral",
      icon: PackageMinus,
      color: "bg-gray-100 text-gray-700",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              {stat.trend === "up" && (
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

