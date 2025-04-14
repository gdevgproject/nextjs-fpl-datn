"use client";

import type React from "react";

import { useState } from "react";
import { AlertCircle, ArrowDown, ArrowUp, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PaymentStatusBadge,
  StatusBadge,
} from "@/features/shop/shared/ui/status-badges";
import { useOrders, useOrderStatuses } from "../queries";
import type { OrderFilter } from "../types";
import {
  formatCurrency,
  formatDate,
  formatOrderNumber,
} from "@/lib/utils/format";

export default function OrdersTable() {
  const router = useRouter();

  // Default filter state
  const [filter, setFilter] = useState<OrderFilter>({
    page: 1,
    pageSize: 10,
    sortBy: "orderDate",
    sortOrder: "desc",
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch orders with current filter
  const { data: ordersData, isLoading, isError, error } = useOrders(filter);

  // Fetch order statuses for filter dropdown
  const { data: orderStatuses } = useOrderStatuses();

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter((prev) => ({
      ...prev,
      page: 1, // Reset to first page
      search: searchQuery,
    }));
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setFilter((prev) => ({
      ...prev,
      page: 1, // Reset to first page
      orderStatusId: value === "all" ? undefined : Number.parseInt(value),
    }));
  };

  // Handle payment status filter change
  const handlePaymentStatusChange = (value: string) => {
    setFilter((prev) => ({
      ...prev,
      page: 1, // Reset to first page
      paymentStatus: value === "all" ? undefined : (value as any),
    }));
  };

  // Handle sorting
  const handleSort = (field: string) => {
    setFilter((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilter((prev) => ({
      ...prev,
      page,
    }));

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate array of page numbers for pagination
  const getPageNumbers = () => {
    if (!ordersData) return [];

    const totalPages = ordersData.totalPages;
    const currentPage = ordersData.page;
    const pageNumbers: number[] = [];

    // Always show first page, last page, current page, and one page before and after current
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // First page
        i === totalPages || // Last page
        (i >= currentPage - 1 && i <= currentPage + 1) // Current page and neighbors
      ) {
        pageNumbers.push(i);
      } else if (
        (i === 2 && currentPage > 3) || // Ellipsis after first page
        (i === totalPages - 1 && currentPage < totalPages - 2) // Ellipsis before last page
      ) {
        pageNumbers.push(-1); // Use -1 to represent ellipsis
      }
    }

    // Remove duplicates
    return pageNumbers.filter(
      (num, idx, arr) => idx === 0 || num !== arr[idx - 1]
    );
  };

  // Render sort indicator
  const renderSortIndicator = (field: string) => {
    if (filter.sortBy !== field) return null;

    return filter.sortOrder === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý đơn hàng</CardTitle>
        <CardDescription>Xem và quản lý tất cả các đơn hàng</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter controls */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <form onSubmit={handleSearch} className="flex-1 md:max-w-sm">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên, email, số điện thoại..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </form>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filter.orderStatusId?.toString() || "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Trạng thái đơn hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {orderStatuses?.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filter.paymentStatus || "all"}
              onValueChange={handlePaymentStatusChange}
            >
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Trạng thái thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả TT thanh toán</SelectItem>
                <SelectItem value="Pending">Chờ thanh toán</SelectItem>
                <SelectItem value="Paid">Đã thanh toán</SelectItem>
                <SelectItem value="Failed">Thất bại</SelectItem>
                <SelectItem value="Refunded">Hoàn tiền</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error display */}
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || "Có lỗi xảy ra khi tải danh sách đơn hàng"}
            </AlertDescription>
          </Alert>
        )}

        {/* Orders table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    className="flex h-8 items-center p-0 font-medium"
                    onClick={() => handleSort("id")}
                  >
                    Mã đơn
                    {renderSortIndicator("id")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="flex h-8 items-center p-0 font-medium"
                    onClick={() => handleSort("customerName")}
                  >
                    Khách hàng
                    {renderSortIndicator("customerName")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="flex h-8 items-center p-0 font-medium"
                    onClick={() => handleSort("orderDate")}
                  >
                    Ngày đặt
                    {renderSortIndicator("orderDate")}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="flex h-8 items-center justify-end p-0 font-medium"
                    onClick={() => handleSort("totalAmount")}
                  >
                    Tổng tiền
                    {renderSortIndicator("totalAmount")}
                  </Button>
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-5 w-24 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : !ordersData || ordersData.orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Không tìm thấy đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                ordersData.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {formatOrderNumber(order.id)}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge name={order.orderStatusName} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/don-hang/${order.id}`)
                        }
                      >
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {ordersData && ordersData.totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (ordersData.page > 1) {
                        handlePageChange(ordersData.page - 1);
                      }
                    }}
                    className={
                      ordersData.page <= 1
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNum, i) => (
                  <PaginationItem key={i}>
                    {pageNum === -1 ? (
                      <span className="flex h-10 w-10 items-center justify-center">
                        ...
                      </span>
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNum);
                        }}
                        isActive={pageNum === ordersData.page}
                      >
                        {pageNum}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (ordersData.page < ordersData.totalPages) {
                        handlePageChange(ordersData.page + 1);
                      }
                    }}
                    className={
                      ordersData.page >= ordersData.totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
