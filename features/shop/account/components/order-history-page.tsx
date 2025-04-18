"use client";

import { useState } from "react";
import Link from "next/link";
import { useUserOrders, useOrderStatuses } from "../order-queries";
import { OrderStatusBadge } from "./order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, ChevronRight, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";
import type { OrderFilter } from "../order-types";
import { useAuthQuery } from "@/features/auth/hooks";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function OrderHistoryPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<OrderFilter>({});
  const pageSize = 5;

  // Lấy thông tin người dùng từ session
  const { data: session, isLoading: isLoadingSession } = useAuthQuery();
  const userId = session?.user?.id;

  const { data: orderData, isLoading: isLoadingOrders } = useUserOrders(
    userId,
    page,
    pageSize,
    filter
  );
  const { data: statuses, isLoading: isLoadingStatuses } = useOrderStatuses();

  // Xử lý khi thay đổi filter
  const handleStatusChange = (value: string) => {
    setFilter((prev) => ({
      ...prev,
      status: value === "all" ? undefined : Number.parseInt(value),
    }));
    setPage(1); // Reset về trang 1 khi thay đổi filter
  };

  const handleDateRangeChange = (range: {
    from: Date | null;
    to: Date | null;
  }) => {
    setFilter((prev) => ({
      ...prev,
      dateRange: range.from ? range : null,
    }));
    setPage(1); // Reset về trang 1 khi thay đổi filter
  };

  // Tính toán tổng số trang
  const totalPages = orderData ? Math.ceil(orderData.count / pageSize) : 0;

  // Nếu chưa đăng nhập, hiển thị thông báo
  if (!isLoadingSession && !userId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Lịch sử đơn hàng</h1>
          <p className="text-muted-foreground">
            Xem và quản lý các đơn hàng của bạn
          </p>
        </div>

        <Alert variant="destructive">
          <AlertTitle>Bạn chưa đăng nhập</AlertTitle>
          <AlertDescription>
            Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button asChild>
            <Link href="/dang-nhap">Đăng nhập</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingSession || isLoadingOrders;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lịch sử đơn hàng</h1>
          <p className="text-muted-foreground">
            Xem và quản lý các đơn hàng của bạn
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={filter.status?.toString() || "all"}
            onValueChange={handleStatusChange}
            disabled={isLoadingStatuses}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {statuses?.map((status) => (
                <SelectItem key={status.id} value={status.id.toString()}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal sm:w-[240px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filter.dateRange?.from ? (
                  filter.dateRange.to ? (
                    <>
                      {format(filter.dateRange.from, "dd/MM/yyyy")} -{" "}
                      {format(filter.dateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(filter.dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  "Chọn khoảng thời gian"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filter.dateRange?.from || undefined}
                selected={{
                  from: filter.dateRange?.from || null,
                  to: filter.dateRange?.to || null,
                }}
                onSelect={handleDateRangeChange}
                locale={vi}
              />
              {filter.dateRange?.from && (
                <div className="flex items-center justify-center gap-2 p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDateRangeChange({ from: null, to: null })
                    }
                  >
                    Xóa
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Danh sách đơn hàng */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orderData?.data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Bạn chưa có đơn hàng nào</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Hãy mua sắm và quay lại đây để xem lịch sử đơn hàng của bạn
            </p>
            <Button asChild className="mt-4">
              <Link href="/san-pham">Mua sắm ngay</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orderData?.data.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Đơn hàng #{order.id}
                  </CardTitle>
                  <OrderStatusBadge
                    status={order.order_status?.name || "Đang xử lý"}
                    statusId={order.order_status_id || undefined}
                  />
                </div>
                <CardDescription>
                  Ngày đặt: {formatDate(order.order_date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Người nhận: {order.recipient_name}
                    </p>
                    <p className="font-medium mt-1">
                      Tổng tiền: {formatPrice(order.total_amount)}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="gap-1">
                    <Link href={`/tai-khoan/don-hang/${order.id}`}>
                      Chi tiết
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
