"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

interface ProductVariant {
  id: string
  volume_ml: number
  price: number
  sale_price: number | null
  sku: string
  stock_quantity: number
}

interface ProductVariantStockChartProps {
  variants: ProductVariant[]
}

export function ProductVariantStockChart({ variants }: ProductVariantStockChartProps) {
  const [activeTab, setActiveTab] = useState<"stock" | "value">("stock")

  // Sắp xếp biến thể theo dung tích
  const sortedVariants = [...variants].sort((a, b) => a.volume_ml - b.volume_ml)

  // Chuẩn bị dữ liệu cho biểu đồ tồn kho
  const stockData = sortedVariants.map((variant) => ({
    name: `${variant.volume_ml} ml`,
    value: variant.stock_quantity,
    id: variant.id,
    lowStock: variant.stock_quantity <= 10 && variant.stock_quantity > 0,
    outOfStock: variant.stock_quantity === 0,
  }))

  // Chuẩn bị dữ liệu cho biểu đồ giá trị tồn kho
  const valueData = sortedVariants.map((variant) => {
    const price = variant.sale_price !== null ? variant.sale_price : variant.price
    return {
      name: `${variant.volume_ml} ml`,
      value: price * variant.stock_quantity,
      id: variant.id,
    }
  })

  // Format giá tiền
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value)
  }

  // Tính tổng tồn kho
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock_quantity, 0)

  // Tính tổng giá trị tồn kho
  const totalStockValue = variants.reduce((sum, variant) => {
    const price = variant.sale_price !== null ? variant.sale_price : variant.price
    return sum + price * variant.stock_quantity
  }, 0)

  // Tính số lượng biến thể sắp hết hàng
  const lowStockCount = variants.filter((v) => v.stock_quantity > 0 && v.stock_quantity <= 10).length

  // Tính số lượng biến thể hết hàng
  const outOfStockCount = variants.filter((v) => v.stock_quantity === 0).length

  // Custom tooltip cho biểu đồ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-0 border shadow-sm">
          <CardContent className="p-2">
            <p className="font-medium">{label}</p>
            {activeTab === "stock" ? (
              <p className="text-sm">
                Tồn kho: <span className="font-medium">{payload[0].value}</span>
              </p>
            ) : (
              <p className="text-sm">
                Giá trị: <span className="font-medium">{formatPrice(payload[0].value)}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )
    }

    return null
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Tổng tồn kho</div>
            <div className="text-2xl font-bold">{totalStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Sắp hết hàng</div>
            <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Hết hàng</div>
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "stock" | "value")}>
        <TabsList className="mb-4">
          <TabsTrigger value="stock">Tồn kho</TabsTrigger>
          <TabsTrigger value="value">Giá trị tồn kho</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" name="Tồn kho">
                {stockData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.outOfStock ? "#ef4444" : entry.lowStock ? "#f59e0b" : "#3b82f6"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="value" className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={valueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" name="Giá trị tồn kho" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}

