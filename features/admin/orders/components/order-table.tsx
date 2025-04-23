"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import { OrderStatusBadge } from "./order-status-badge";
import { PaymentStatusBadge } from "./payment-status-badge";
import type {
  OrderWithRelations,
  OrdersPagination,
  OrdersSort,
} from "../types";

interface OrderTableProps {
  orders: OrderWithRelations[];
  totalCount: number;
  pagination: OrdersPagination;
  sort: OrdersSort;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (column: string, direction: "asc" | "desc") => void;
  onViewDetails: (orderId: number) => void;
}

export function OrderTable({
  orders,
  totalCount,
  pagination,
  sort,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onViewDetails,
}: OrderTableProps) {
  const { page, pageSize } = pagination;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSort = (column: string) => {
    const direction =
      sort.column === column && sort.direction === "asc" ? "desc" : "asc";
    onSortChange(column, direction);
  };

  const renderSortIcon = (column: string) => {
    if (sort.column !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sort.direction === "asc" ? (
      <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />
    ) : (
      <ArrowUpDown className="ml-2 h-4 w-4 text-primary rotate-180" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">
                <Button
                  variant="ghost"
                  className="p-0 font-medium"
                  onClick={() => handleSort("id")}
                >
                  ID {renderSortIcon("id")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="p-0 font-medium"
                  onClick={() => handleSort("order_date")}
                >
                  Ngày đặt {renderSortIcon("order_date")}
                </Button>
              </TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="p-0 font-medium"
                  onClick={() => handleSort("total_amount")}
                >
                  Tổng tiền {renderSortIcon("total_amount")}
                </Button>
              </TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Không có đơn hàng nào
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    {format(new Date(order.order_date), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.recipient_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.recipient_phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.total_amount)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.order_statuses} />
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={order.payment_status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(order.id)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị {orders.length > 0 ? (page - 1) * pageSize + 1 : 0} đến{" "}
          {Math.min(page * pageSize, totalCount)} trong tổng số {totalCount} đơn
          hàng
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <span className="text-sm font-medium">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
