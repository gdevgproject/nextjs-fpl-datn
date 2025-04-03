"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
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
import { X, Calendar, ArrowRight } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DiscountCodeAnalyticsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  discountCodeId: string | null
}

// Mẫu dữ liệu phân tích
const generateUsageData = () => {
  const data = []
  const today = new Date()

  for (let i = 14; i >= 0; i--) {
    const date = subDays(today, i)
    data.push({
      date: format(date, "dd/MM"),
      usage: Math.floor(Math.random() * 10),
      discount: Math.floor(Math.random() * 500000) + 50000,
    })
  }

  return data
}

const generateSourceData = () => [
  { name: "Trang chủ", value: 35 },
  { name: "Trang sản phẩm", value: 25 },
  { name: "Trang thanh toán", value: 20 },
  { name: "Email", value: 15 },
  { name: "Khác", value: 5 },
]

const generateDeviceData = () => [
  { name: "Desktop", value: 45 },
  { name: "Mobile", value: 40 },
  { name: "Tablet", value: 15 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function DiscountCodeAnalyticsDialog({ open, onOpenChange, discountCodeId }: DiscountCodeAnalyticsDialogProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("usage")
  const [timeRange, setTimeRange] = useState("15days")
  const [usageData, setUsageData] = useState<any[]>([])
  const [sourceData, setSourceData] = useState<any[]>([])
  const [deviceData, setDeviceData] = useState<any[]>([])
  const [discountCode, setDiscountCode] = useState<any>(null)

  useEffect(() => {
    if (open && discountCodeId) {
      setIsLoading(true)

      // Giả lập tải dữ liệu
      const loadData = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setUsageData(generateUsageData())
        setSourceData(generateSourceData())
        setDeviceData(generateDeviceData())
        setDiscountCode({
          id: discountCodeId,
          code: "SUMMER2023",
          totalUsage: 45,
          totalDiscount: 3750000,
          conversionRate: 12.5,
        })

        setIsLoading(false)
      }

      loadData()
    }
  }, [open, discountCodeId])

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    // Trong thực tế, bạn sẽ tải lại dữ liệu dựa trên khoảng thời gian mới
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border bg-background p-2 shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Lượt sử dụng: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Giảm giá:{" "}
            <span className="font-medium">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(payload[1].value)}
            </span>
          </p>
        </div>
      )
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Phân tích mã giảm giá</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 absolute right-4 top-4"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Đóng</span>
            </Button>
          </DialogTitle>
          <DialogDescription>Xem phân tích chi tiết về hiệu quả của mã giảm giá</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : discountCode ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Mã: {discountCode.code}</h3>
              <div className="flex items-center gap-2">
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger className="h-8 w-[180px]">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Chọn khoảng thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">7 ngày qua</SelectItem>
                    <SelectItem value="15days">15 ngày qua</SelectItem>
                    <SelectItem value="30days">30 ngày qua</SelectItem>
                    <SelectItem value="90days">90 ngày qua</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Tổng lượt sử dụng</p>
                <p className="text-2xl font-bold">{discountCode.totalUsage}</p>
              </div>

              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Tổng giảm giá</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                    discountCode.totalDiscount,
                  )}
                </p>
              </div>

              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Tỷ lệ chuyển đổi</p>
                <p className="text-2xl font-bold">{discountCode.conversionRate}%</p>
              </div>
            </div>

            <Separator />

            <Tabs defaultValue="usage" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="usage">Lượt sử dụng</TabsTrigger>
                <TabsTrigger value="source">Nguồn sử dụng</TabsTrigger>
                <TabsTrigger value="device">Thiết bị</TabsTrigger>
              </TabsList>

              <TabsContent value="usage" className="pt-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="usage" name="Lượt sử dụng" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="discount" name="Giảm giá (VNĐ)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="source" className="pt-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="device" className="pt-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="flex justify-end">
              <Button asChild>
                <a href={`/admin/ma-giam-gia/${discountCode.id}/phan-tich`}>
                  <span>Xem phân tích chi tiết</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-muted-foreground">Không tìm thấy thông tin phân tích</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

