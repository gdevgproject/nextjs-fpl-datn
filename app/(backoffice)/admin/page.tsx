"use client";

import { useState } from "react";
import { AdminLayout } from "@/features/admin/shared/components/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuthQuery } from "@/features/auth/hooks";
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
} from "recharts";
import {
  ArrowUpRight,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";

// Sample data for charts
const revenueData = [
  { month: "T1", revenue: 12000000 },
  { month: "T2", revenue: 15000000 },
  { month: "T3", revenue: 18000000 },
  { month: "T4", revenue: 14000000 },
  { month: "T5", revenue: 21000000 },
  { month: "T6", revenue: 25000000 },
  { month: "T7", revenue: 28000000 },
];

const orderStatusData = [
  { name: "Chờ xác nhận", value: 15, color: "#f97316" },
  { name: "Đã xác nhận", value: 25, color: "#3b82f6" },
  { name: "Đang giao", value: 35, color: "#8b5cf6" },
  { name: "Đã giao", value: 20, color: "#10b981" },
  { name: "Đã hủy", value: 5, color: "#ef4444" },
];

const topProducts = [
  { name: "Dior Sauvage EDP 100ml", sales: 42 },
  { name: "Chanel Bleu de Chanel EDP 100ml", sales: 38 },
  { name: "Versace Eros EDT 100ml", sales: 35 },
  { name: "Giorgio Armani Acqua di Gio 100ml", sales: 30 },
  { name: "Tom Ford Tobacco Vanille 50ml", sales: 28 },
];

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function AdminDashboardPage() {
  // Sử dụng TanStack Query để lấy session
  const { data: session } = useAuthQuery();
  const user = session?.user;

  // Get user display name from metadata
  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0];

  const [timeRange, setTimeRange] = useState("7days");

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Xin chào, {displayName}
          </h1>
          <p className="text-muted-foreground">
            Đây là tổng quan về hoạt động của cửa hàng MyBeauty
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="analytics">Phân tích</TabsTrigger>
              <TabsTrigger value="reports">Báo cáo</TabsTrigger>
              <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTimeRange("7days")}
                className={timeRange === "7days" ? "bg-secondary" : ""}
              >
                7 ngày
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTimeRange("30days")}
                className={timeRange === "30days" ? "bg-secondary" : ""}
              >
                30 ngày
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTimeRange("90days")}
                className={timeRange === "90days" ? "bg-secondary" : ""}
              >
                90 ngày
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Doanh thu
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(125000000)}
                  </div>
                  <div className="flex items-center text-xs text-green-500 mt-1">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    <span>+12.5% so với tháng trước</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Đơn hàng
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">254</div>
                  <div className="flex items-center text-xs text-green-500 mt-1">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    <span>+8.2% so với tháng trước</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sản phẩm
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">128</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>12 sản phẩm sắp hết hàng</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Khách hàng
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">573</div>
                  <div className="flex items-center text-xs text-green-500 mt-1">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    <span>+5.7% so với tháng trước</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Doanh thu theo tháng</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) =>
                          new Intl.NumberFormat("vi-VN", {
                            notation: "compact",
                            compactDisplay: "short",
                            maximumFractionDigits: 1,
                          }).format(value)
                        }
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        labelFormatter={(label) => `Tháng ${label}`}
                      />
                      <Bar dataKey="revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Trạng thái đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => `${value} đơn hàng`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders and Top Products */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Đơn hàng gần đây</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Xem tất cả
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 text-sm font-medium text-muted-foreground">
                      <div>Mã đơn</div>
                      <div>Khách hàng</div>
                      <div>Trạng thái</div>
                      <div className="text-right">Tổng tiền</div>
                    </div>
                    <div className="space-y-2">
                      {[
                        {
                          id: "ORD-1234",
                          customer: "Nguyễn Văn A",
                          status: "Đã giao",
                          amount: 2500000,
                          statusColor: "text-green-500",
                        },
                        {
                          id: "ORD-1233",
                          customer: "Trần Thị B",
                          status: "Đang giao",
                          amount: 1800000,
                          statusColor: "text-blue-500",
                        },
                        {
                          id: "ORD-1232",
                          customer: "Lê Văn C",
                          status: "Đã xác nhận",
                          amount: 3200000,
                          statusColor: "text-purple-500",
                        },
                        {
                          id: "ORD-1231",
                          customer: "Phạm Thị D",
                          status: "Chờ xác nhận",
                          amount: 1500000,
                          statusColor: "text-orange-500",
                        },
                        {
                          id: "ORD-1230",
                          customer: "Hoàng Văn E",
                          status: "Đã hủy",
                          amount: 2100000,
                          statusColor: "text-red-500",
                        },
                      ].map((order) => (
                        <div
                          key={order.id}
                          className="grid grid-cols-4 items-center"
                        >
                          <div className="font-medium">{order.id}</div>
                          <div>{order.customer}</div>
                          <div className={order.statusColor}>
                            {order.status}
                          </div>
                          <div className="text-right">
                            {formatCurrency(order.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Sản phẩm bán chạy</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Xem tất cả
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground">
                      <div className="col-span-2">Sản phẩm</div>
                      <div className="text-right">Đã bán</div>
                    </div>
                    <div className="space-y-2">
                      {topProducts.map((product, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-3 items-center"
                        >
                          <div className="col-span-2 font-medium truncate">
                            {product.name}
                          </div>
                          <div className="text-right">{product.sales}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Cảnh báo</CardTitle>
                <CardDescription>Các vấn đề cần chú ý</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <div className="flex-1">
                      <p className="font-medium">Sản phẩm sắp hết hàng</p>
                      <p className="text-sm text-muted-foreground">
                        12 sản phẩm có số lượng tồn kho dưới 5
                      </p>
                    </div>
                    <Button size="sm">Xem chi tiết</Button>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium">Đơn hàng chưa xử lý</p>
                      <p className="text-sm text-muted-foreground">
                        15 đơn hàng đang chờ xác nhận quá 24 giờ
                      </p>
                    </div>
                    <Button size="sm">Xem chi tiết</Button>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">Đánh giá mới cần duyệt</p>
                      <p className="text-sm text-muted-foreground">
                        8 đánh giá mới đang chờ duyệt
                      </p>
                    </div>
                    <Button size="sm">Xem chi tiết</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Phân tích chi tiết</CardTitle>
                <CardDescription>
                  Phân tích dữ liệu bán hàng và hành vi người dùng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tính năng phân tích chi tiết đang được phát triển và sẽ sớm
                  được cập nhật.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Báo cáo</CardTitle>
                <CardDescription>
                  Tạo và xuất báo cáo theo nhiều tiêu chí khác nhau
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tính năng báo cáo đang được phát triển và sẽ sớm được cập
                  nhật.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông báo</CardTitle>
                <CardDescription>
                  Quản lý thông báo và cảnh báo hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tính năng quản lý thông báo đang được phát triển và sẽ sớm
                  được cập nhật.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
