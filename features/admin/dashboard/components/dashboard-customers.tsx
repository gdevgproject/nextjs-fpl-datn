"use client";

import { useEffect, useState } from "react";
import {
  TimeFilterOption,
  DateRange,
  DashboardCustomersMetrics,
} from "../types";
import { Loader2, AlertCircle, Users, UserPlus, Percent } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatPrice } from "@/lib/utils";

import { TimeFilter } from "./time-filter";
import { MetricCard } from "./metric-card";
import { getCustomersMetricsAction } from "../actions";
import { CustomersPieChart } from "./customers-pie-chart";
import { CustomersLocationChart } from "./customers-location-chart";
import { TopCustomersTable } from "./top-customers-table";

export function DashboardCustomers() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardCustomersMetrics>({
    totalCustomers: 0,
    newCustomers: 0,
    registeredVsGuestRatio: {
      registered: 0,
      guest: 0,
      registeredPercentage: 0,
    },
    topCustomers: [],
    customersByLocation: [],
    guestToRegisteredConversion: 0,
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
        const result = await getCustomersMetricsAction(timeFilter, dateRange);
        if (result.success && result.data) {
          setMetrics(result.data);
        } else {
          setError(
            result.error || "Unknown error occurred while fetching data"
          );
        }
      } catch (error) {
        console.error("Failed to load customers metrics:", error);
        setError("Failed to load metrics. Please try again.");
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
        <h2 className="text-2xl font-bold tracking-tight">Khách hàng</h2>
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
          {/* Customer Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Tổng số khách hàng"
              value={metrics.totalCustomers.toLocaleString("vi-VN")}
              description={`${metrics.registeredVsGuestRatio.registered.toLocaleString(
                "vi-VN"
              )} đã đăng ký, ${metrics.registeredVsGuestRatio.guest.toLocaleString(
                "vi-VN"
              )} khách vãng lai`}
              icon={<Users className="h-4 w-4 text-blue-500" />}
            />
            <MetricCard
              title="Khách hàng mới"
              value={metrics.newCustomers.toLocaleString("vi-VN")}
              description="Khách hàng đăng ký trong kỳ"
              icon={<UserPlus className="h-4 w-4 text-green-500" />}
            />
            <MetricCard
              title="Tỉ lệ khách hàng đăng ký"
              value={`${metrics.registeredVsGuestRatio.registeredPercentage}%`}
              description="Phần trăm khách hàng đã đăng ký tài khoản"
              icon={<Percent className="h-4 w-4 text-violet-500" />}
            />
          </div>

          {/* Distribution charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <CustomersPieChart data={metrics.registeredVsGuestRatio} />
            <CustomersLocationChart data={metrics.customersByLocation} />
          </div>

          {/* Top Customers */}
          <TopCustomersTable customers={metrics.topCustomers} />

          <div className="text-sm text-muted-foreground mt-4">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Tổng số khách hàng</strong>: Bao gồm cả khách hàng đã
                đăng ký và khách vãng lai (sử dụng email khi thanh toán).
              </li>
              <li>
                <strong>Khách hàng mới</strong>: Đếm số lượng người dùng mới
                đăng ký trong khoảng thời gian đã chọn.
              </li>
              <li>
                <strong>Top khách hàng</strong>: Được tính dựa trên tổng chi
                tiêu trong các đơn hàng đã hoàn thành trong khoảng thời gian đã
                chọn.
              </li>
              <li>
                <strong>Phân bổ theo tỉnh/thành</strong>: Dựa trên địa chỉ giao
                hàng từ các đơn đặt hàng trong khoảng thời gian đã chọn.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
