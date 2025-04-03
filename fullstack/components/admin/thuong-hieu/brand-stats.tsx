"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export function BrandStats() {
  // Dữ liệu mẫu cho biểu đồ
  const brandProductData = [
    { name: "Chanel", value: 24 },
    { name: "Dior", value: 18 },
    { name: "Gucci", value: 15 },
    { name: "Versace", value: 12 },
    { name: "Calvin Klein", value: 10 },
    { name: "Tom Ford", value: 8 },
    { name: "Burberry", value: 7 },
    { name: "Hermes", value: 6 },
  ]

  const brandOriginData = [
    { name: "Pháp", value: 35 },
    { name: "Ý", value: 25 },
    { name: "Mỹ", value: 20 },
    { name: "Anh", value: 15 },
    { name: "Khác", value: 5 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Thống kê thương hiệu</CardTitle>
        <CardDescription>Tổng quan về thương hiệu và sản phẩm</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium text-muted-foreground">Tổng số thương hiệu</div>
            <div className="mt-1 text-2xl font-bold">24</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium text-muted-foreground">Thương hiệu có sản phẩm</div>
            <div className="mt-1 text-2xl font-bold">18</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium text-muted-foreground">Thương hiệu nổi bật</div>
            <div className="mt-1 text-2xl font-bold">8</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium text-muted-foreground">Thương hiệu mới (30 ngày)</div>
            <div className="mt-1 text-2xl font-bold">3</div>
          </div>
        </div>

        <Tabs defaultValue="products" className="mt-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products">Sản phẩm theo thương hiệu</TabsTrigger>
            <TabsTrigger value="origin">Thương hiệu theo xuất xứ</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={brandProductData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Số sản phẩm" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="origin" className="mt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={brandOriginData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {brandOriginData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} thương hiệu`, "Số lượng"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

