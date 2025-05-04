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
  Filter,
  RefreshCw,
  Search,
  Smartphone,
  Info,
  Laptop,
} from "lucide-react";
import { OrderStatusBadge } from "./order-status-badge";
import { PaymentStatusBadge } from "./payment-status-badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCallback, useMemo, useState } from "react";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // For optimizations on re-renders
  const [showAllAddresses, setShowAllAddresses] = useState<
    Record<number, boolean>
  >({});
  const [showAllNotes, setShowAllNotes] = useState<Record<number, boolean>>({});
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<
    number | null
  >(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  // Thêm state để quản lý Dialog gán shipper
  const [shipperDialogOrderId, setShipperDialogOrderId] = useState<
    number | null
  >(null);
  const [isShipperDialogOpen, setIsShipperDialogOpen] = useState(false);

  // Hệ thống theo dõi những đơn hàng đã cập nhật trong phiên làm việc hiện tại
  const [updatedOrders, setUpdatedOrders] = useState<
    Record<
      number,
      {
        prevStatus?: string;
        newStatus?: string;
        timestamp: number; // Thời điểm cập nhật
      }
    >
  >({});

  // Lọc những đơn hàng đã cập nhật gần đây (trong vòng 1 giờ)
  const recentlyUpdatedOrders = useMemo(() => {
    const currentTime = Date.now();
    const oneHourInMs = 60 * 60 * 1000;

    return Object.entries(updatedOrders)
      .filter(([_, data]) => currentTime - data.timestamp < oneHourInMs)
      .map(([id]) => Number(id));
  }, [updatedOrders]);

  // Simulate refreshing data
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Dữ liệu đã được cập nhật");
    }, 800);
  }, [toast]);

  // Đánh dấu một đơn hàng vừa được cập nhật
  const markOrderAsUpdated = useCallback(
    (orderId: number, prevStatus?: string, newStatus?: string) => {
      setUpdatedOrders((prev) => ({
        ...prev,
        [orderId]: {
          prevStatus,
          newStatus,
          timestamp: Date.now(),
        },
      }));
    },
    []
  );

  const handleSort = useCallback(
    (column: string) => {
      const direction =
        sort.column === column && sort.direction === "asc" ? "desc" : "asc";
      onSortChange(column, direction);
    },
    [onSortChange, sort.column, sort.direction]
  );

  const renderSortIcon = useCallback(
    (column: string) => {
      if (sort.column !== column) {
        return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
      }
      return sort.direction === "asc" ? (
        <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 text-primary rotate-180" />
      );
    },
    [sort.column, sort.direction]
  );

  const copyToClipboard = useCallback(
    (text: string, message: string) => {
      navigator.clipboard.writeText(text);
      toast.success(message);
    },
    [toast]
  );

  const toggleAddress = useCallback((orderId: number) => {
    setShowAllAddresses((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  }, []);

  const toggleNotes = useCallback((orderId: number) => {
    setShowAllNotes((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  }, []);

  const getOrderAgeInDays = useCallback((orderDate: string) => {
    const days = Math.floor(
      (new Date().getTime() - new Date(orderDate).getTime()) /
        (1000 * 3600 * 24)
    );
    return days;
  }, []);

  const getOrderAgeClass = useCallback((days: number) => {
    if (days >= 7) return "text-destructive";
    if (days >= 3) return "text-amber-500";
    return "text-muted-foreground";
  }, []);

  const getPageSizes = useMemo(() => {
    return [10, 25, 50, 100];
  }, []);

  // Function to determine row styling based on order status and properties
  const getRowStyle = useCallback(
    (order: OrderWithRelations) => {
      // Cancelled orders
      if (order.cancellation_reason) {
        return "bg-red-50/80 hover:bg-red-100/90 border-red-200 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:border-red-800/30 dark:text-red-100";
      }

      // Orders with delivery issues
      if (order.delivery_failure_reason) {
        return "bg-amber-50/80 hover:bg-amber-100/90 border-amber-200 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 dark:border-amber-800/30";
      }

      // Define styles based on order status
      if (order.order_statuses) {
        switch (order.order_statuses.name) {
          case "Chờ xác nhận":
            return "hover:bg-muted/40 border-l-4 border-l-blue-500 dark:border-l-blue-400";
          case "Đã xác nhận":
            return "hover:bg-muted/40 border-l-4 border-l-indigo-500 dark:border-l-indigo-400";
          case "Đang xử lý":
            return "bg-blue-50/50 hover:bg-blue-50/80 border-l-4 border-l-blue-600 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 dark:border-l-blue-500";
          case "Đang giao":
            return "bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-600 dark:bg-amber-900/5 dark:hover:bg-amber-900/10 dark:border-l-amber-500";
          case "Đã giao":
            return "bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-emerald-600 dark:bg-emerald-900/5 dark:hover:bg-emerald-900/10 dark:border-l-emerald-500";
          case "Đã hoàn thành":
            return "bg-green-50/40 hover:bg-green-50/70 border-l-4 border-l-green-600 dark:bg-green-900/5 dark:hover:bg-green-900/10 dark:border-l-green-500";
          case "Đã hủy":
            return "bg-red-50/60 hover:bg-red-50/80 border-l-4 border-l-red-600 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:border-l-red-500";
          default:
            return "hover:bg-muted/40";
        }
      }

      // Orders older than 7 days that are not completed or cancelled
      const orderAge = getOrderAgeInDays(order.order_date);
      if (
        orderAge > 7 &&
        !["Đã hoàn thành", "Đã hủy"].includes(order.order_statuses?.name)
      ) {
        return "bg-purple-50/40 hover:bg-purple-50/70 dark:bg-purple-900/10 dark:hover:bg-purple-900/20 border-l-4 border-l-purple-600 dark:border-l-purple-500";
      }

      return "hover:bg-muted/40";
    },
    [getOrderAgeInDays]
  );

  // Tạo lớp CSS cho đơn hàng vừa được cập nhật - tinh tế và cân đối hơn
  const getUpdatedOrderClass = useCallback(
    (orderId: number) => {
      if (recentlyUpdatedOrders.includes(orderId)) {
        // Thêm border-right đối xứng với border-left của các trạng thái
        return "border-r-4 border-r-primary/50 dark:border-r-primary/40";
      }
      return "";
    },
    [recentlyUpdatedOrders]
  );

  // Tạo badge hiển thị thông tin về cập nhật đơn hàng - Thu gọn và responsive hơn
  const UpdatedOrderBadge = useCallback(
    ({ orderId }: { orderId: number }) => {
      const updateInfo = updatedOrders[orderId];
      if (!updateInfo || !recentlyUpdatedOrders.includes(orderId)) return null;

      // Chỉ hiển thị một biểu tượng nhỏ thay vì cả text
      return (
        <Badge
          variant="outline"
          className="bg-primary text-primary-foreground border-primary/30 h-4 w-4 rounded-full p-0 flex items-center justify-center absolute -left-1 top-1/2 -translate-y-1/2"
          title="Đơn hàng vừa được cập nhật"
        >
          <RefreshCw className="h-2 w-2" />
        </Badge>
      );
    },
    [updatedOrders, recentlyUpdatedOrders]
  );

  // Filter displayed orders based on search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;

    const lowercasedQuery = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.id.toString().includes(lowercasedQuery) ||
        order.recipient_name.toLowerCase().includes(lowercasedQuery) ||
        order.recipient_phone.includes(lowercasedQuery) ||
        order.order_statuses?.name.toLowerCase().includes(lowercasedQuery) ||
        order.payment_status.toLowerCase().includes(lowercasedQuery)
    );
  }, [orders, searchQuery]);

  // OrderCard component for mobile view
  const OrderCard = useCallback(
    ({ order }: { order: OrderWithRelations }) => {
      const orderAge = getOrderAgeInDays(order.order_date);
      const orderAgeClass = getOrderAgeClass(orderAge);
      const hasDeliveryIssue = !!order.delivery_failure_reason;

      return (
        <Card
          key={order.id}
          className={cn(
            "mb-3 overflow-hidden transition-all",
            getRowStyle(order)
          )}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="font-semibold text-base flex items-center">
                <span className="mr-2">#{order.id}</span>
                <OrderStatusBadge status={order.order_statuses} />
              </div>
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewDetails(order.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Xem chi tiết</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        copyToClipboard(
                          `#${order.id}`,
                          "Đã sao chép mã đơn hàng"
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sao chép mã</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  {format(new Date(order.order_date), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Clock className={cn("h-3.5 w-3.5", orderAgeClass)} />
                <div className={orderAgeClass}>
                  {orderAge === 0 ? "Hôm nay" : `${orderAge} ngày trước`}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="truncate" title={order.recipient_name}>
                  {order.recipient_name}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <a
                  href={`tel:${order.recipient_phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {order.recipient_phone}
                </a>
              </div>

              <div className="col-span-2 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <div
                  className="truncate"
                  title={`${order.street_address}, ${order.ward}, ${order.district}, ${order.province_city}`}
                >
                  {order.street_address}, {order.ward}, {order.district}
                </div>
              </div>

              <div className="flex items-center gap-1 col-span-1">
                <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="font-medium">
                  {formatCurrency(order.total_amount)}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 col-span-1">
                <PaymentStatusBadge status={order.payment_status} />
              </div>

              {order.assigned_shipper_id ? (
                <div className="flex items-center gap-1 col-span-2">
                  <Truck className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex items-center gap-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage
                        src={order.shipper_profile?.avatar_url || ""}
                        alt={order.shipper_profile?.display_name || "Shipper"}
                      />
                      <AvatarFallback className="text-[10px]">
                        {order.shipper_profile?.display_name
                          ? order.shipper_profile.display_name.charAt(0)
                          : "S"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[150px]">
                      {order.shipper_profile?.display_name ||
                        order.shipper_profile?.phone_number ||
                        "Shipper"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1 col-span-2">
                  <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground text-xs">
                    Chưa phân công shipper
                  </span>
                </div>
              )}
            </div>

            {hasDeliveryIssue && (
              <div className="flex items-center gap-1.5 text-amber-600 text-xs mt-3 bg-amber-100 p-2 rounded">
                <AlertTriangle className="h-3 w-3" />
                <span>{order.delivery_failure_reason}</span>
              </div>
            )}

            {order.cancellation_reason && (
              <div className="flex items-center gap-1.5 text-destructive text-xs mt-3 bg-red-100 p-2 rounded">
                <Info className="h-3 w-3" />
                <span>Đã hủy: {order.cancellation_reason}</span>
              </div>
            )}
          </CardContent>
        </Card>
      );
    },
    [
      copyToClipboard,
      getOrderAgeClass,
      getOrderAgeInDays,
      getRowStyle,
      onViewDetails,
    ]
  );

  // Page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pageArray = [];

    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageArray.push(i);
      }
    } else if (page <= 3) {
      // Near the start
      for (let i = 1; i <= 5; i++) {
        pageArray.push(i);
      }
    } else if (page >= totalPages - 2) {
      // Near the end
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pageArray.push(i);
      }
    } else {
      // In the middle
      for (let i = page - 2; i <= page + 2; i++) {
        pageArray.push(i);
      }
    }

    return pageArray;
  }, [page, totalPages]);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Table Actions & Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm đơn hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full h-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className="h-9 w-9"
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
              <span className="sr-only">Làm mới</span>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Lọc</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Tùy chọn lọc đơn hàng</SheetTitle>
                </SheetHeader>
                {/* Filter options would go here */}
                <div className="py-6">
                  <div className="space-y-6">
                    {/* Filter by status */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Trạng thái đơn hàng
                      </h3>
                      {/* Status filters would go here */}
                    </div>

                    {/* Filter by date */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Ngày đặt hàng
                      </h3>
                      {/* Date range filter would go here */}
                    </div>

                    {/* Filter by payment status */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Trạng thái thanh toán
                      </h3>
                      {/* Payment status filters would go here */}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Page size selector */}
          <div className="hidden md:flex items-center gap-2 pl-2">
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {getPageSizes.map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
            <div className="text-sm text-muted-foreground">
              Tổng: {totalCount} đơn
            </div>
          </div>
        </div>

        {/* Responsive Device Based Views */}
        <div className="md:hidden">
          {/* Mobile card view */}
          <div className="space-y-1">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-10 border rounded-lg bg-background">
                <Smartphone className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                <h3 className="font-medium text-lg mb-2">
                  Không tìm thấy đơn hàng
                </h3>
                <p className="text-muted-foreground text-sm px-6">
                  {searchQuery
                    ? "Thử tìm kiếm với từ khóa khác"
                    : "Chưa có đơn hàng nào trong hệ thống"}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </div>

        <div className="hidden md:block">
          {/* Desktop & Tablet table view */}
          <div className="rounded-md border shadow-md overflow-hidden bg-background">
            <ScrollArea className="w-full">
              <div className="min-w-full lg:min-w-0">
                <Table>
                  <TableHeader className="bg-muted/30 sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="w-[80px] font-semibold py-4">
                        <Button
                          variant="ghost"
                          className="p-0 font-semibold"
                          onClick={() => handleSort("id")}
                        >
                          <span className="flex items-center">
                            ID {renderSortIcon("id")}
                          </span>
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <Button
                          variant="ghost"
                          className="p-0 font-semibold"
                          onClick={() => handleSort("order_date")}
                        >
                          <span className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            Ngày đặt {renderSortIcon("order_date")}
                          </span>
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <span className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Khách hàng
                        </span>
                      </TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">
                        <span className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          Địa chỉ
                        </span>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <Button
                          variant="ghost"
                          className="p-0 font-semibold"
                          onClick={() => handleSort("total_amount")}
                        >
                          <span className="flex items-center">
                            <Banknote className="mr-2 h-4 w-4" />
                            Tổng tiền {renderSortIcon("total_amount")}
                          </span>
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <span className="flex items-center">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Trạng thái
                        </span>
                      </TableHead>
                      <TableHead className="font-semibold hidden xl:table-cell">
                        <span className="flex items-center">
                          <Truck className="mr-2 h-4 w-4" />
                          Shipper
                        </span>
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
                          <div>
                            <Laptop className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                            <p className="text-muted-foreground">
                              {searchQuery
                                ? "Không tìm thấy đơn hàng phù hợp"
                                : "Không có đơn hàng nào"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => {
                        const orderAge = getOrderAgeInDays(order.order_date);
                        const orderAgeClass = getOrderAgeClass(orderAge);
                        const hasDeliveryIssue =
                          !!order.delivery_failure_reason;

                        return (
                          <TableRow
                            key={order.id}
                            className={cn(
                              "transition-colors",
                              getRowStyle(order),
                              getUpdatedOrderClass(order.id)
                            )}
                          >
                            <TableCell className="align-top">
                              <div className="space-y-0.5">
                                <div className="flex items-center">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="font-medium cursor-default flex items-center">
                                        <span>#{order.id}</span>
                                        {recentlyUpdatedOrders.includes(
                                          order.id
                                        ) && (
                                          <span className="ml-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="start">
                                      <div className="text-xs">
                                        Ngày tạo:{" "}
                                        {format(
                                          new Date(order.order_date),
                                          "dd/MM/yyyy HH:mm",
                                          { locale: vi }
                                        )}
                                        {recentlyUpdatedOrders.includes(
                                          order.id
                                        ) && (
                                          <div className="text-primary font-medium mt-1">
                                            Đơn hàng vừa được cập nhật
                                          </div>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>

                                  <UpdatedOrderBadge orderId={order.id} />

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 p-0 ml-1 opacity-40 hover:opacity-100"
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
                                    <TooltipContent>
                                      Sao chép mã đơn
                                    </TooltipContent>
                                  </Tooltip>
                                </div>

                                {order.user_id ? (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1 py-0"
                                  >
                                    Đã đăng ký
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-1 py-0"
                                  >
                                    Khách vãng lai
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="align-top">
                              <div className="space-y-0.5">
                                <div className="font-medium">
                                  {format(
                                    new Date(order.order_date),
                                    "dd/MM/yyyy",
                                    {
                                      locale: vi,
                                    }
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(order.order_date), "HH:mm", {
                                    locale: vi,
                                  })}
                                </div>
                                <div
                                  className={cn(
                                    "flex items-center gap-1 text-xs",
                                    orderAgeClass
                                  )}
                                >
                                  <Clock className="h-3 w-3" />
                                  {orderAge === 0
                                    ? "Hôm nay"
                                    : `${orderAge} ngày trước`}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="align-top">
                              <div className="space-y-1">
                                <div
                                  className="font-medium truncate max-w-[180px]"
                                  title={order.recipient_name}
                                >
                                  {order.recipient_name}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <a
                                    href={`tel:${order.recipient_phone}`}
                                    className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                                  >
                                    <Phone className="h-3 w-3" />
                                    {order.recipient_phone}
                                  </a>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 p-0 opacity-40 hover:opacity-100"
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
                                <div className="flex items-center gap-1 flex-wrap">
                                  {order.payment_methods && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {order.payment_methods.name}
                                    </Badge>
                                  )}
                                  <PaymentStatusBadge
                                    status={order.payment_status}
                                  />
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="align-top hidden lg:table-cell">
                              <div className="space-y-1 max-w-[240px]">
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
                                  <div className="text-xs">
                                    <span className="font-medium">
                                      Ghi chú:{" "}
                                    </span>
                                    {showAllNotes[order.id] ? (
                                      <div>
                                        <p className="italic">
                                          {order.delivery_notes}
                                        </p>
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
                                          className="line-clamp-1 italic"
                                          title={order.delivery_notes}
                                        >
                                          {order.delivery_notes}
                                        </span>
                                        {order.delivery_notes.length > 20 && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs h-6 px-2"
                                            onClick={() =>
                                              toggleNotes(order.id)
                                            }
                                          >
                                            Xem đầy đủ
                                          </Button>
                                        )}
                                      </div>
                                    )}{" "}
                                  </div>
                                )}

                                {hasDeliveryIssue && (
                                  <div className="flex items-center gap-1 text-amber-600 text-xs mt-1 bg-amber-100/70 p-1 px-2 rounded">
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

                            <TableCell className="align-top">
                              <div className="space-y-1">
                                <div className="font-medium text-base">
                                  {formatCurrency(order.total_amount)}
                                </div>
                                <div className="text-xs space-y-0.5 text-muted-foreground">
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

                            <TableCell className="align-top">
                              <Dialog
                                open={
                                  isStatusDialogOpen &&
                                  selectedOrderForStatus === order.id
                                }
                                onOpenChange={(open) => {
                                  setIsStatusDialogOpen(open);
                                  if (!open) setSelectedOrderForStatus(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                      setSelectedOrderForStatus(order.id);
                                      setIsStatusDialogOpen(true);
                                    }}
                                  >
                                    <OrderStatusBadge
                                      status={order.order_statuses}
                                    />
                                    {order.cancellation_reason && (
                                      <div className="text-destructive text-xs mt-1.5 bg-red-100/70 p-1 px-2 rounded">
                                        <span
                                          className="line-clamp-1"
                                          title={order.cancellation_reason}
                                        >
                                          Lý do: {order.cancellation_reason}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl p-0 overflow-hidden">
                                  <DialogTitle className="sr-only">
                                    Cập nhật trạng thái đơn hàng #{order.id}
                                  </DialogTitle>
                                  <OrderStatusUpdate
                                    order={order}
                                    onSuccess={() => {
                                      // refresh data
                                      setIsRefreshing(true);

                                      // Đánh dấu đơn hàng đã được cập nhật
                                      markOrderAsUpdated(
                                        order.id,
                                        order.order_statuses?.name
                                      );

                                      setTimeout(() => {
                                        setIsRefreshing(false);
                                      }, 800);
                                    }}
                                  />
                                </DialogContent>
                              </Dialog>
                            </TableCell>

                            <TableCell className="align-top hidden xl:table-cell">
                              {/* Thay Popover bằng Dialog */}
                              <Dialog
                                open={
                                  isShipperDialogOpen &&
                                  shipperDialogOrderId === order.id
                                }
                                onOpenChange={(open) => {
                                  setIsShipperDialogOpen(open);
                                  if (!open) setShipperDialogOrderId(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-2 h-8 px-2"
                                    onClick={() => {
                                      setShipperDialogOrderId(order.id);
                                      setIsShipperDialogOpen(true);
                                    }}
                                  >
                                    {order.assigned_shipper_id ? (
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage
                                            src={
                                              order.shipper_profile
                                                ?.avatar_url || ""
                                            }
                                            alt={
                                              order.shipper_profile
                                                ?.display_name || "Shipper"
                                            }
                                          />
                                          <AvatarFallback className="text-xs">
                                            {order.shipper_profile?.display_name
                                              ? order.shipper_profile.display_name.charAt(
                                                  0
                                                )
                                              : "S"}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs line-clamp-1 max-w-[100px] text-left">
                                          {order.shipper_profile
                                            ?.display_name ||
                                            order.shipper_profile
                                              ?.phone_number ||
                                            "Shipper"}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">
                                        Chưa gán
                                      </span>
                                    )}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogTitle>
                                    Gán người giao hàng cho đơn #{order.id}
                                  </DialogTitle>
                                  <OrderShipperAssignment
                                    order={order}
                                    onSuccess={() => {
                                      setIsShipperDialogOpen(false);
                                      setShipperDialogOrderId(null);
                                    }}
                                  />
                                </DialogContent>
                              </Dialog>
                            </TableCell>

                            <TableCell className="text-right align-top">
                              <div className="flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onViewDetails(order.id)}
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Xem chi tiết</span>
                                </Button>

                                <div className="xl:hidden">
                                  {/* Thay Popover bằng Dialog cho mobile/tablet */}
                                  <Dialog
                                    open={
                                      isShipperDialogOpen &&
                                      shipperDialogOrderId === order.id
                                    }
                                    onOpenChange={(open) => {
                                      setIsShipperDialogOpen(open);
                                      if (!open) setShipperDialogOrderId(null);
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                          setShipperDialogOrderId(order.id);
                                          setIsShipperDialogOpen(true);
                                        }}
                                      >
                                        <Truck className="h-4 w-4" />
                                        <span className="sr-only">
                                          Quản lý shipper
                                        </span>
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                      <DialogTitle>
                                        Gán người giao hàng cho đơn #{order.id}
                                      </DialogTitle>
                                      <OrderShipperAssignment
                                        order={order}
                                        onSuccess={() => {
                                          setIsShipperDialogOpen(false);
                                          setShipperDialogOrderId(null);
                                        }}
                                      />
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Enhanced Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:hidden">
            <select
              className="h-9 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {getPageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <div className="text-sm text-muted-foreground">/ trang</div>
          </div>

          {/* Mobile Pagination View */}
          <div className="md:hidden flex items-center justify-center w-full">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Trang trước</span>
            </Button>

            <div className="flex items-center mx-2">
              <span className="text-sm">
                Trang {page} / {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Trang tiếp</span>
            </Button>
          </div>

          {/* Desktop/Tablet Pagination View */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className="h-9 w-9"
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">Trang đầu</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Trang trước</span>
            </Button>

            {/* Page numbers */}
            <div className="flex items-center">
              {pageNumbers.map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Trang tiếp</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className="h-9 w-9"
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Trang cuối</span>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center sm:text-right">
            Hiển thị{" "}
            <span className="font-medium">
              {filteredOrders.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>{" "}
            đến{" "}
            <span className="font-medium">
              {Math.min(page * pageSize, totalCount)}
            </span>{" "}
            trong tổng số <span className="font-medium">{totalCount}</span> đơn
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
