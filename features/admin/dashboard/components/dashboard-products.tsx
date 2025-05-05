"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  Package,
  CircleDollarSign,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  TimeFilterOption,
  DateRange,
  DashboardProductsMetrics,
} from "../types";
import { getProductsMetricsAction } from "../actions";
import { TimeFilter } from "./time-filter";
import { MetricCard } from "./metric-card";
import { formatPrice } from "@/lib/utils";
import { TopSellingProductsList } from "./top-selling-products-list";
import { BrandRevenueChart } from "./brand-revenue-chart";
import { LowStockTable } from "./low-stock-table";
import { NonMovingProductsTable } from "./non-moving-products-table";
import { WishlistedProductsList } from "./wishlisted-products-list";

export function DashboardProducts() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardProductsMetrics>({
    topSellingByQuantity: [],
    topSellingByRevenue: [],
    lowStockProducts: [],
    nonMovingProducts: [],
    brandRevenue: [],
    mostWishlisted: [],
    totalInventoryValue: 0,
    productCount: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
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
        const result = await getProductsMetricsAction(timeFilter, dateRange);
        if (result.success && result.data) {
          setMetrics(result.data);
        } else {
          setError(
            result.error || "Unknown error occurred while fetching data"
          );
        }
      } catch (error) {
        console.error("Failed to load products & inventory metrics:", error);
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
        <h2 className="text-2xl font-bold tracking-tight">
          Sản phẩm & Tồn kho
        </h2>
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
          {/* Inventory Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Tổng giá trị tồn kho"
              value={formatPrice(metrics.totalInventoryValue)}
              description="Ước tính theo giá bán hiện tại"
              icon={<CircleDollarSign className="h-4 w-4 text-green-500" />}
            />
            <MetricCard
              title="Tổng sản phẩm"
              value={metrics.productCount.toLocaleString("vi-VN")}
              description="Số lượng sản phẩm đang kinh doanh"
              icon={<Package className="h-4 w-4 text-blue-500" />}
            />
            <MetricCard
              title="Sản phẩm hết hàng"
              value={metrics.outOfStockCount.toLocaleString("vi-VN")}
              description="Các biến thể sản phẩm đã hết hàng"
              icon={<ShoppingCart className="h-4 w-4 text-red-500" />}
            />
            <MetricCard
              title="Sản phẩm sắp hết"
              value={metrics.lowStockCount.toLocaleString("vi-VN")}
              description="Các biến thể sản phẩm sắp hết hàng"
              icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
            />
          </div>

          {/* Top Selling Products & Brand Revenue */}
          <div className="grid gap-6 md:grid-cols-2">
            <TopSellingProductsList
              byQuantity={metrics.topSellingByQuantity}
              byRevenue={metrics.topSellingByRevenue}
              timeFilterDescription={
                timeFilter === "custom"
                  ? "Khoảng thời gian tùy chỉnh"
                  : timeFilter
              }
            />
            <BrandRevenueChart data={metrics.brandRevenue} />
          </div>

          {/* Low Stock & Non-Moving Products */}
          <div className="grid gap-6 lg:grid-cols-2">
            <LowStockTable products={metrics.lowStockProducts} />
            <NonMovingProductsTable products={metrics.nonMovingProducts} />
          </div>

          {/* Most Wishlisted Products */}
          <WishlistedProductsList products={metrics.mostWishlisted} />

          <div className="text-sm text-muted-foreground mt-4">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Top sản phẩm bán chạy</strong>: Được tính dựa trên các
                đơn hàng đã hoàn thành trong khoảng thời gian đã chọn.
              </li>
              <li>
                <strong>Tổng giá trị tồn kho</strong>: Được ước tính dựa trên
                giá bán hiện tại (bao gồm giảm giá nếu có).
              </li>
              <li>
                <strong>Sản phẩm sắp hết hàng</strong>: Các sản phẩm có số lượng
                tồn kho dưới 15.
              </li>
              <li>
                <strong>Sản phẩm tồn kho lâu</strong>: Các sản phẩm có tồn kho
                cao (≥ 50) và không có đơn hàng nào trong 30 ngày gần đây.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
