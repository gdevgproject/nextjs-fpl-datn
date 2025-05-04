"use client";

import { useEffect, useState } from "react";
import { TimeFilterOption, DateRange } from "../types";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { MetricCard } from "./metric-card";
import { TimeFilter } from "./time-filter";
import { getOverviewMetricsAction } from "../actions";

export function DashboardOverview() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    totalProductsSold: 0,
    newCustomers: 0,
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
        const result = await getOverviewMetricsAction(timeFilter, dateRange);
        if (result.success && result.data) {
          setMetrics(result.data);
        } else {
          console.error("Error fetching metrics:", result.error);
        }
      } catch (error) {
        console.error("Failed to load dashboard metrics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMetrics();
  }, [timeFilter, dateRange]);

  // Handle time filter change
  const handleFilterChange = (filterType: string, dateRange?: DateRange) => {
    setTimeFilter(filterType as TimeFilterOption);
    if (dateRange) {
      setDateRange(dateRange);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Tổng quan</h2>
        <TimeFilter
          onFilterChange={handleFilterChange}
          currentFilter={timeFilter}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Doanh Thu"
            value={formatPrice(metrics.totalRevenue)}
            description="Tổng doanh thu từ đơn hàng đã hoàn thành"
          />
          <MetricCard
            title="Tổng Số Đơn Hàng"
            value={metrics.totalOrders.toLocaleString("vi-VN")}
            description={`Tỷ lệ hoàn thành: ${
              metrics.totalOrders > 0
                ? Math.round(
                    (metrics.completedOrders / metrics.totalOrders) * 100
                  )
                : 0
            }%`}
          />
          <MetricCard
            title="Đơn Hàng Thành Công"
            value={metrics.completedOrders.toLocaleString("vi-VN")}
            description="Đơn hàng đã giao hoặc hoàn thành"
          />
          <MetricCard
            title="Giá Trị Đơn Hàng Trung Bình"
            value={formatPrice(metrics.averageOrderValue)}
            description="Doanh thu trung bình mỗi đơn hàng thành công"
          />
          <MetricCard
            title="Sản Phẩm Đã Bán"
            value={metrics.totalProductsSold.toLocaleString("vi-VN")}
            description="Tổng số sản phẩm đã bán trong đơn hàng thành công"
          />
          <MetricCard
            title="Khách Hàng Mới"
            value={metrics.newCustomers.toLocaleString("vi-VN")}
            description="Số người dùng đăng ký mới"
          />
        </div>
      )}
    </div>
  );
}
