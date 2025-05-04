"use client";

import { useEffect, useState } from "react";
import { OrderStatusPieChart } from "./order-status-pie-chart";
import { PaymentMethodBarChart } from "./payment-method-bar-chart";
import { RecentOrdersList } from "./recent-orders-list";
import { MetricCard } from "./metric-card";
import { TimeFilter } from "./time-filter";
import {
  Loader2,
  AlertCircle,
  Package,
  ShoppingCart,
  XCircle,
  PercentIcon,
} from "lucide-react";
import { DateRange, TimeFilterOption, DashboardOrdersMetrics } from "../types";
import { getOrdersMetricsAction } from "../actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DashboardOrders() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardOrdersMetrics>({
    ordersByStatus: [],
    pendingOrders: 0,
    shippingOrders: 0,
    cancelledOrders: 0,
    cancellationRate: 0,
    paymentMethodRevenue: [],
    recentOrders: [],
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
      setError(null);

      try {
        const result = await getOrdersMetricsAction(timeFilter, dateRange);
        if (result.success && result.data) {
          setMetrics(result.data);
        } else {
          setError(
            result.error || "Unknown error occurred while fetching data"
          );
        }
      } catch (error) {
        console.error("Failed to load dashboard order metrics:", error);
        setError("Failed to load dashboard metrics. Please try again.");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Đơn Hàng</h2>
        <TimeFilter
          onFilterChange={handleFilterChange}
          currentFilter={timeFilter}
          currentDateRange={dateRange}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Đang tải dữ liệu</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Order Status Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Đơn hàng chờ xử lý"
              value={metrics.pendingOrders.toLocaleString("vi-VN")}
              description="Đơn hàng đang chờ xác nhận hoặc đã xác nhận"
              icon={<AlertCircle className="h-4 w-4 text-yellow-500" />}
            />
            <MetricCard
              title="Đơn hàng đang giao"
              value={metrics.shippingOrders.toLocaleString("vi-VN")}
              description="Đơn hàng đang trong quá trình giao"
              icon={<Package className="h-4 w-4 text-blue-500" />}
            />
            <MetricCard
              title="Đơn hàng bị hủy"
              value={metrics.cancelledOrders.toLocaleString("vi-VN")}
              description="Số đơn hàng bị hủy trong kỳ"
              icon={<XCircle className="h-4 w-4 text-red-500" />}
            />
            <MetricCard
              title="Tỷ lệ hủy đơn"
              value={`${metrics.cancellationRate}%`}
              description="Tỷ lệ đơn bị hủy trên tổng đơn hàng trong kỳ"
              icon={<PercentIcon className="h-4 w-4 text-orange-500" />}
            />
          </div>

          {/* Visualizations */}
          <div className="grid gap-6 md:grid-cols-2">
            <OrderStatusPieChart data={metrics.ordersByStatus} />
            <PaymentMethodBarChart data={metrics.paymentMethodRevenue} />
          </div>

          {/* Recent Orders Table */}
          <RecentOrdersList orders={metrics.recentOrders} />

          <div className="text-sm text-muted-foreground mt-4">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Đơn hàng chờ xử lý</strong> và{" "}
                <strong>Đơn hàng đang giao</strong>: Hiển thị tổng số đơn hàng
                hiện đang ở trạng thái tương ứng.
              </li>
              <li>
                <strong>Đơn hàng bị hủy</strong> và{" "}
                <strong>Tỷ lệ hủy đơn</strong>: Được tính trong khoảng thời gian
                bạn đã chọn.
              </li>
              <li>
                <strong>Phân bổ đơn hàng</strong> và{" "}
                <strong>Doanh thu theo phương thức thanh toán</strong>: Dựa trên
                đơn hàng trong khoảng thời gian bạn đã chọn.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
