"use client"

import { Plus, Tag, ShoppingBag, Percent, TrendingUp } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ProductLabelStatsProps {
  onAddNewLabel?: () => void
}

export function ProductLabelStats({ onAddNewLabel }: ProductLabelStatsProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const stats = [
    {
      title: "Tổng số nhãn",
      value: "12",
      description: "Tăng 2 nhãn trong tháng này",
      icon: <Tag className="h-4 w-4" />,
      color: "bg-blue-500",
    },
    {
      title: "Sản phẩm có nhãn",
      value: "48",
      description: "Chiếm 64% tổng số sản phẩm",
      icon: <ShoppingBag className="h-4 w-4" />,
      color: "bg-green-500",
    },
    {
      title: "Nhãn phổ biến nhất",
      value: "Giảm giá",
      description: "Được gắn cho 18 sản phẩm",
      icon: <Percent className="h-4 w-4" />,
      color: "bg-red-500",
    },
    {
      title: "Tỷ lệ chuyển đổi",
      value: "12.4%",
      description: "Tăng 2.1% so với tháng trước",
      icon: <TrendingUp className="h-4 w-4" />,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`${stat.color} rounded-full p-1 text-white`}>{stat.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
          {index === 0 && onAddNewLabel && (
            <CardFooter className="p-2">
              <Button variant="ghost" size={isDesktop ? "default" : "sm"} className="w-full" onClick={onAddNewLabel}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm nhãn mới
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}

