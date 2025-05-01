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
  Calendar,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Banknote,
  Truck,
  Clock,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { OrderStatusBadge } from "./order-status-badge";
import { PaymentStatusBadge } from "./payment-status-badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { OrderStatusUpdate } from "./order-status-update";
import { OrderShipperAssignment } from "./order-shipper-assignment";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils/format";
import { useState } from "react";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
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
  const toast = useSonnerToast();

  // For optimizations on re-renders
  const [showAllAddresses, setShowAllAddresses] = useState<
    Record<number, boolean>
  >({});
  const [showAllNotes, setShowAllNotes] = useState<Record<number, boolean>>({});

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

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const toggleAddress = (orderId: number) => {
    setShowAllAddresses((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const toggleNotes = (orderId: number) => {
    setShowAllNotes((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getOrderAgeInDays = (orderDate: string) => {
    const days = Math.floor(
      (new Date().getTime() - new Date(orderDate).getTime()) /
        (1000 * 3600 * 24)
    );
    return days;
  };

  const getOrderAgeClass = (days: number) => {
    if (days >= 7) return "text-destructive";
    if (days >= 3) return "text-amber-500";
    return "text-muted-foreground";
  };

  const getPageSizes = () => {
    return [10, 25, 50, 100];
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="rounded-md border shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
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
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Ngày đặt {renderSortIcon("order_date")}
                    </div>
                  </Button>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Khách hàng
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    Địa chỉ
                  </div>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 font-medium"
                    onClick={() => handleSort("total_amount")}
                  >
                    <div className="flex items-center">
                      <Banknote className="mr-2 h-4 w-4" />
                      Tổng tiền {renderSortIcon("total_amount")}
                    </div>
                  </Button>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Trạng thái
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <Truck className="mr-2 h-4 w-4" />
                    Shipper
                  </div>
                </TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Không có đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const orderAge = getOrderAgeInDays(order.order_date);
                  const orderAgeClass = getOrderAgeClass(orderAge);
                  const hasDeliveryIssue = !!order.delivery_failure_reason;

                  return (
                    <TableRow
                      key={order.id}
                      className={
                        order.cancellation_reason
                          ? "bg-red-50"
                          : hasDeliveryIssue
                          ? "bg-amber-50"
                          : undefined
                      }
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            #{order.id}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    copyToClipboard(
                                      `#${order.id}`,
                                      "Đã sao chép mã đơn hàng"
                                    )
                                  }
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Sao chép mã đơn</TooltipContent>
                            </Tooltip>
                          </div>

                          {order.user_id ? (
                            <Badge variant="outline" className="text-xs mt-1">
                              Đã đăng ký
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Khách vãng lai
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {format(new Date(order.order_date), "dd/MM/yyyy", {
                              locale: vi,
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(order.order_date), "HH:mm", {
                              locale: vi,
                            })}
                          </div>
                          <div
                            className={`flex items-center gap-1 text-xs ${orderAgeClass}`}
                          >
                            <Clock className="h-3 w-3" />
                            {orderAge === 0
                              ? "Hôm nay"
                              : `${orderAge} ngày trước`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-[180px]">
                          <div
                            className="font-medium truncate"
                            title={order.recipient_name}
                          >
                            {order.recipient_name}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <a
                              href={`tel:${order.recipient_phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {order.recipient_phone}
                            </a>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 p-0"
                              onClick={() =>
                                copyToClipboard(
                                  order.recipient_phone,
                                  "Đã sao chép số điện thoại"
                                )
                              }
                            >
                              <Copy className="h-2 w-2" />
                            </Button>
                          </div>
                          {order.payment_methods && (
                            <Badge variant="outline" className="text-xs">
                              {order.payment_methods.name}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1">
                            <PaymentStatusBadge status={order.payment_status} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-[200px]">
                          <div className="text-sm">
                            {showAllAddresses[order.id] ? (
                              <div className="space-y-1">
                                <div>{order.province_city}</div>
                                <div>{order.district}</div>
                                <div>{order.ward}</div>
                                <div>{order.street_address}</div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-6 px-2"
                                  onClick={() => toggleAddress(order.id)}
                                >
                                  Thu gọn
                                </Button>
                              </div>
                            ) : (
                              <div>
                                <span
                                  className="line-clamp-1"
                                  title={`${order.street_address}, ${order.ward}, ${order.district}, ${order.province_city}`}
                                >
                                  {order.street_address}, {order.ward}...
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-6 px-2"
                                  onClick={() => toggleAddress(order.id)}
                                >
                                  Xem đầy đủ
                                </Button>
                              </div>
                            )}
                          </div>

                          {order.delivery_notes && (
                            <div className="mt-1 text-xs">
                              <span className="font-medium">Ghi chú: </span>
                              {showAllNotes[order.id] ? (
                                <div>
                                  <p>{order.delivery_notes}</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-6 px-2"
                                    onClick={() => toggleNotes(order.id)}
                                  >
                                    Thu gọn
                                  </Button>
                                </div>
                              ) : (
                                <div>
                                  <span
                                    className="line-clamp-1"
                                    title={order.delivery_notes}
                                  >
                                    {order.delivery_notes}
                                  </span>
                                  {order.delivery_notes.length > 20 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs h-6 px-2"
                                      onClick={() => toggleNotes(order.id)}
                                    >
                                      Xem đầy đủ
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {hasDeliveryIssue && (
                            <div className="flex items-center gap-1 text-amber-600 text-xs mt-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span
                                className="line-clamp-1"
                                title={order.delivery_failure_reason}
                              >
                                {order.delivery_failure_reason}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {formatCurrency(order.total_amount)}
                          </div>
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span>Tạm tính:</span>
                              <span>
                                {formatCurrency(order.subtotal_amount)}
                              </span>
                            </div>
                            {order.discount_amount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Giảm giá:</span>
                                <span>
                                  -{formatCurrency(order.discount_amount)}
                                </span>
                              </div>
                            )}
                            {order.shipping_fee > 0 && (
                              <div className="flex justify-between">
                                <span>Phí ship:</span>
                                <span>
                                  {formatCurrency(order.shipping_fee)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className="cursor-pointer">
                              <OrderStatusBadge status={order.order_statuses} />
                              {order.cancellation_reason && (
                                <div className="text-destructive text-xs mt-1">
                                  Lý do hủy:{" "}
                                  {order.cancellation_reason.length > 20
                                    ? order.cancellation_reason.substring(
                                        0,
                                        20
                                      ) + "..."
                                    : order.cancellation_reason}
                                </div>
                              )}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <OrderStatusUpdate
                              order={order}
                              onSuccess={() => {}}
                            />
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-2 h-8"
                            >
                              {order.assigned_shipper_id ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={
                                        order.shipper_profile?.avatar_url || ""
                                      }
                                    />
                                    <AvatarFallback className="text-xs">
                                      {
                                        (order.shipper_profile?.display_name ||
                                          "?")[0]
                                      }
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs line-clamp-1 max-w-[100px]">
                                    {order.shipper_profile?.display_name ||
                                      order.shipper_profile?.phone_number ||
                                      "Shipper"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  Chưa gán
                                </span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <OrderShipperAssignment
                              order={order}
                              onSuccess={() => {}}
                            />
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewDetails(order.id)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Xem chi tiết</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Enhanced Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Hiển thị
            </span>
            <select
              className="h-8 w-16 rounded-md border border-input bg-background px-2 text-xs"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {getPageSizes().map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              trên tổng số {totalCount} đơn hàng
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className="h-8 w-8"
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">Trang đầu</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Trang trước</span>
            </Button>

            {/* Page number buttons */}
            <div className="flex items-center">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  // Show all pages if 5 or fewer
                  pageNum = i + 1;
                } else if (page <= 3) {
                  // Near the start
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  // Near the end
                  pageNum = totalPages - 4 + i;
                } else {
                  // In the middle
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Trang tiếp</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className="h-8 w-8"
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Trang cuối</span>
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
