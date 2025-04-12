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
import { AlertTriangle, Package, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export function InventoryDashboard() {
  const [period, setPeriod] = useState("month")

  // Dữ liệu mẫu cho biểu đồ tồn kho theo thời gian
  const stockData = [
    { name: "T1", stock: 120 },
    { name: "T2", stock: 150 },
    { name: "T3", stock: 180 },
    { name: "T4", stock: 170 },
    { name: "T5", stock: 200 },
    { name: "T6", stock: 220 },
    { name: "T7", stock: 240 },
    { name: "T8", stock: 230 },
    { name: "T9", stock: 245 },
  ]

  // Dữ liệu mẫu cho biểu đồ phân bố tồn kho
  const stockDistributionData = [
    { name: "Còn hàng", value: 220, color: "#16a34a" },
    { name: "Sắp hết", value: 18, color: "#eab308" },
    { name: "Hết hàng", value: 7, color: "#dc2626" },
  ]

  // Dữ liệu mẫu cho sản phẩm sắp hết hàng
  const lowStockProducts = [
    {
      id: "1",
      name: "Chanel No. 5",
      sku: "CH-N5-100ML",
      volume: "100ml",
      stock: 3,
      threshold: 5,
    },
    {
      id: "2",
      name: "Dior J'adore",
      sku: "DR-JD-50ML",
      volume: "50ml",
      stock: 4,
      threshold: 5,
    },
    {
      id: "3",
      name: "Gucci Bloom",
      sku: "GC-BL-100ML",
      volume: "100ml",
      stock: 5,
      threshold: 10,
    },
    {
      id: "4",
      name: "YSL Black Opium",
      sku: "YSL-BO-90ML",
      volume: "90ml",
      stock: 2,
      threshold: 5,
    },
    {
      id: "5",
      name: "Versace Eros",
      sku: "VS-ER-100ML",
      volume: "100ml",
      stock: 4,
      threshold: 8,
    },
  ]

  // Dữ liệu mẫu cho sản phẩm bán chạy
  const topSellingProducts = [
    {
      id: "1",
      name: "Dior Sauvage",
      sku: "DR-SV-100ML",
      volume: "100ml",
      sold: 42,
      stock: 8,
    },
    {
      id: "2",
      name: "Chanel Coco Mademoiselle",
      sku: "CH-CM-50ML",
      volume: "50ml",
      sold: 38,
      stock: 15,
    },
    {
      id: "3",
      name: "Tom Ford Tobacco Vanille",
      sku: "TF-TV-50ML",
      volume: "50ml",
      sold: 35,
      stock: 10,
    },
    {
      id: "4",
      name: "Bleu de Chanel",
      sku: "CH-BC-100ML",
      volume: "100ml",
      sold: 30,
      stock: 12,
    },
    {
      id: "5",
      name: "Yves Saint Laurent Y",
      sku: "YSL-Y-100ML",
      volume: "100ml",
      sold: 28,
      stock: 9,
    },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Tổng quan tồn kho</CardTitle>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Tuần</SelectItem>
                <SelectItem value="month">Tháng</SelectItem>
                <SelectItem value="quarter">Quý</SelectItem>
                <SelectItem value="year">Năm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>Biểu đồ tồn kho theo thời gian</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [`${value} sản phẩm`, "Tồn kho"]}
                  contentStyle={{
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Phân bố tồn kho</CardTitle>
          <CardDescription>Tỷ lệ sản phẩm theo trạng thái tồn kho</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stockDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} sản phẩm`, ""]}
                  contentStyle={{
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="low-stock">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="low-stock">Sắp hết hàng</TabsTrigger>
          <TabsTrigger value="top-selling">Bán chạy</TabsTrigger>
        </TabsList>

        <TabsContent value="low-stock" className="mt-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                Sản phẩm sắp hết hàng
              </CardTitle>
              <CardDescription>Các sản phẩm cần nhập thêm hàng</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                <div className="p-4">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                          <Badge variant="outline" className="text-xs">
                            {product.volume}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-medium text-amber-600">{product.stock}</p>
                          <p className="text-xs text-muted-foreground">/ {product.threshold}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Package className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-selling" className="mt-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                Sản phẩm bán chạy
              </CardTitle>
              <CardDescription>Các sản phẩm có doanh số cao nhất</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                <div className="p-4">
                  {topSellingProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                          <Badge variant="outline" className="text-xs">
                            {product.volume}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center">
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            <p className="font-medium text-green-600">{product.sold}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">Đã bán</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{product.stock}</p>
                          <p className="text-xs text-muted-foreground">Tồn kho</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

