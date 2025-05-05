"use client";

import { useEffect, useState } from "react";
import {
  TimeFilterOption,
  DateRange,
  DashboardPromotionsMetrics,
  TopUsedDiscount,
} from "../types";
import { formatPrice } from "@/lib/utils";
import { Loader2, TrendingDown } from "lucide-react";
import { MetricCard } from "./metric-card";
import { TimeFilter } from "./time-filter";
import { getPromotionsMetricsAction } from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function DashboardPromotions() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardPromotionsMetrics>({
    totalDiscountValue: 0,
    topUsedDiscounts: [],
    topRevenueDiscounts: [],
    activeDiscountsCount: 0,
    averageDiscountPerOrder: 0,
  });
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>("thisMonth");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  // Load dashboard metrics on mount and when filters change
  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);

      try {
        const result = await getPromotionsMetricsAction(timeFilter, dateRange);
        if (result.success && result.data) {
          setMetrics(result.data);
        } else {
          console.error("Error fetching promotion metrics:", result.error);
        }
      } catch (error) {
        console.error("Failed to load promotion metrics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMetrics();
  }, [timeFilter, dateRange]);

  // Handle time filter change
  const handleFilterChange = (
    filterType: TimeFilterOption,
    dateRange?: DateRange
  ) => {
    setTimeFilter(filterType);
    if (dateRange) {
      setDateRange(dateRange);
    }
  };

  // Format discount usage data for the LineChart
  const usageChartData =
    metrics.discountUsageOverTime?.map((item) => ({
      date: new Date(item.date).toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "short",
      }),
      count: item.count,
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Khuyến Mãi & Giảm Giá
        </h2>
        <TimeFilter
          onFilterChange={handleFilterChange}
          currentFilter={timeFilter}
          currentDateRange={dateRange}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Tổng Giảm Giá"
              value={formatPrice(metrics.totalDiscountValue)}
              description="Tổng giá trị đã giảm trên các đơn hàng thành công"
              icon={<TrendingDown className="h-4 w-4" />}
            />
            <MetricCard
              title="Mã Giảm Giá Đang Hoạt Động"
              value={metrics.activeDiscountsCount.toLocaleString("vi-VN")}
              description="Số lượng mã giảm giá đang có hiệu lực"
            />
            <MetricCard
              title="Mã Giảm Giá Đã Hết Hạn"
              value={
                metrics.expiredDiscountsCount?.toLocaleString("vi-VN") || "0"
              }
              description="Số lượng mã giảm giá đã hết hạn"
            />
            <MetricCard
              title="Giảm Giá Trung Bình/Đơn"
              value={formatPrice(metrics.averageDiscountPerOrder)}
              description="Giá trị giảm giá trung bình trên mỗi đơn hàng có áp dụng mã"
            />
          </div>

          {/* Top used discount codes */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Most used discount codes table */}
            <Card>
              <CardHeader>
                <CardTitle>Mã Giảm Giá Được Sử Dụng Nhiều Nhất</CardTitle>
                <CardDescription>Dựa trên tần suất sử dụng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã Giảm Giá</TableHead>
                        <TableHead>Số Lần Sử Dụng</TableHead>
                        <TableHead className="text-right">
                          Giá Trị Giảm
                        </TableHead>
                        <TableHead className="text-right">Trạng Thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.topUsedDiscounts.length > 0 ? (
                        metrics.topUsedDiscounts.map((discount) => (
                          <TableRow key={discount.id}>
                            <TableCell className="font-medium">
                              {discount.code}
                              {discount.description && (
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {discount.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {discount.usageCount.toLocaleString("vi-VN")}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatPrice(discount.totalDiscountValue)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={
                                  discount.isActive ? "default" : "secondary"
                                }
                              >
                                {discount.isActive
                                  ? "Đang hoạt động"
                                  : "Hết hạn"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            Không có dữ liệu
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Highest revenue discount codes */}
            <Card>
              <CardHeader>
                <CardTitle>Mã Giảm Giá Mang Lại Doanh Thu Cao Nhất</CardTitle>
                <CardDescription>
                  Dựa trên tổng doanh thu đơn hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã Giảm Giá</TableHead>
                        <TableHead className="text-right">Doanh Thu</TableHead>
                        <TableHead className="text-right">
                          Giá Trị Giảm
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.topRevenueDiscounts.length > 0 ? (
                        metrics.topRevenueDiscounts.map((discount) => (
                          <TableRow key={discount.id}>
                            <TableCell className="font-medium">
                              {discount.code}
                              {discount.description && (
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {discount.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatPrice(discount.totalRevenue)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatPrice(discount.totalDiscountValue)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            Không có dữ liệu
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Discount usage over time chart */}
          {usageChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sử Dụng Mã Giảm Giá Theo Thời Gian</CardTitle>
                <CardDescription>
                  Số lượt sử dụng mã giảm giá theo ngày
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={usageChartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, "Lượt sử dụng"]} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Lượt sử dụng"
                        stroke="#8884d8"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visualization of discount efficiency (Revenue vs Discount value) */}
          {metrics.topUsedDiscounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hiệu Quả Mã Giảm Giá</CardTitle>
                <CardDescription>
                  So sánh giữa doanh thu và giá trị giảm giá (Top 5)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.topUsedDiscounts.slice(0, 5).map((d) => ({
                        code: d.code,
                        revenue: d.totalRevenue,
                        discount: d.totalDiscountValue,
                        ratio:
                          d.totalRevenue > 0
                            ? Math.round(
                                (d.totalDiscountValue / d.totalRevenue) * 100
                              )
                            : 0,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="code"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="#8884d8"
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#82ca9d"
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "revenue")
                            return [formatPrice(value as number), "Doanh Thu"];
                          if (name === "discount")
                            return [
                              formatPrice(value as number),
                              "Giá Trị Giảm",
                            ];
                          if (name === "ratio")
                            return [`${value}%`, "Tỷ lệ giảm/doanh thu"];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="revenue"
                        name="Doanh Thu"
                        fill="#8884d8"
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="discount"
                        name="Giá Trị Giảm"
                        fill="#82ca9d"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="ratio"
                        name="% Giảm/Doanh thu"
                        fill="#ffc658"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
