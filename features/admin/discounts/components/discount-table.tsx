"use client";

import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  Calendar,
} from "lucide-react";
import { useDiscounts } from "../hooks/use-discounts";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { formatCurrency } from "@/lib/utils/format";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DiscountTableProps {
  search: string;
  onEdit: (discount: any) => void;
  filter?: string; // "all", "active", "inactive", "expired", "upcoming"
  onError?: (error: Error) => void;
}

export function DiscountTable({
  search,
  onEdit,
  filter = "all",
  onError,
}: DiscountTableProps) {
  const toast = useSonnerToast();

  const isActive = (discount: any): boolean => {
    const now = new Date();
    if (!discount.is_active) return false;
    if (discount.end_date && new Date(discount.end_date) < now) return false;
    if (discount.start_date && new Date(discount.start_date) > now)
      return false;
    if (discount.remaining_uses !== null && discount.remaining_uses <= 0)
      return false;
    return true;
  };

  const isExpired = (discount: any): boolean => {
    const now = new Date();
    return discount.end_date && new Date(discount.end_date) < now;
  };

  const isUpcoming = (discount: any): boolean => {
    const now = new Date();
    return discount.start_date && new Date(discount.start_date) > now;
  };

  // Fetch discounts with search and filter
  const { data, isLoading, isError, error } = useDiscounts({
    search,
  });

  // Handle errors
  useEffect(() => {
    if (isError && error && onError) {
      onError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
    }
  }, [isError, error, onError]);

  const formatDate = (date: string | null) => {
    if (!date) return "Không giới hạn";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatDateWithTime = (date: string | null) => {
    if (!date) return "Không giới hạn";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Tính toán số ngày còn lại hoặc đã qua
  const getDaysRemaining = (date: string | null) => {
    if (!date) return null;

    const targetDate = new Date(date);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getStatusInfo = (discount: any) => {
    const now = new Date();
    const endDaysRemaining = getDaysRemaining(discount.end_date);
    const startDaysRemaining = getDaysRemaining(discount.start_date);

    if (!discount.is_active) {
      return {
        badge: (
          <Badge variant="outline" className="bg-muted">
            Không hoạt động
          </Badge>
        ),
        icon: <Ban className="h-4 w-4 text-muted-foreground" />,
        details: "Mã giảm giá đã bị tắt kích hoạt",
      };
    }

    if (discount.end_date && new Date(discount.end_date) < now) {
      return {
        badge: <Badge variant="destructive">Hết hạn</Badge>,
        icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
        details: `Đã hết hạn ${Math.abs(
          endDaysRemaining || 0
        )} ngày trước (${formatDate(discount.end_date)})`,
      };
    }

    if (discount.start_date && new Date(discount.start_date) > now) {
      return {
        badge: (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Sắp diễn ra
          </Badge>
        ),
        icon: <Clock className="h-4 w-4 text-blue-500" />,
        details: `Sẽ bắt đầu sau ${startDaysRemaining} ngày (${formatDate(
          discount.start_date
        )})`,
      };
    }

    if (discount.remaining_uses !== null && discount.remaining_uses <= 0) {
      return {
        badge: <Badge variant="destructive">Hết lượt dùng</Badge>,
        icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
        details: "Đã hết lượt sử dụng",
      };
    }

    const message = endDaysRemaining
      ? `Còn ${endDaysRemaining} ngày nữa hết hạn (${formatDate(
          discount.end_date
        )})`
      : "Không có ngày hết hạn";

    return {
      badge: (
        <Badge variant="success" className="bg-green-500 text-white">
          Đang hoạt động
        </Badge>
      ),
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      details: message,
    };
  };

  const getDiscountValue = (discount: any) => {
    if (discount.discount_percentage) {
      return `${discount.discount_percentage}%${
        discount.max_discount_amount
          ? ` (tối đa ${formatCurrency(discount.max_discount_amount)})`
          : ""
      }`;
    } else if (discount.max_discount_amount) {
      return formatCurrency(discount.max_discount_amount);
    }
    return "Không xác định";
  };

  const getUsageInfo = (discount: any) => {
    if (discount.max_uses === null) {
      return {
        text: "Không giới hạn",
        progress: null,
        percentage: null,
        used: 0,
        total: null,
      };
    }

    const remaining =
      discount.remaining_uses !== null ? discount.remaining_uses : 0;
    const used = discount.max_uses - remaining;
    const percentage = Math.floor((used / discount.max_uses) * 100);

    return {
      text: `Còn ${remaining}/${discount.max_uses} lượt`,
      progress: percentage,
      percentage: `${percentage}%`,
      tooltip: `Đã sử dụng ${used} lượt (${percentage}%)`,
      used: used,
      total: discount.max_uses,
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-3 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="border rounded-md p-4 space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 border rounded-md bg-destructive/10 text-destructive">
        <p>Đã xảy ra lỗi khi tải dữ liệu</p>
        <p className="text-sm">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  const discounts = data?.data || [];

  if (discounts.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/10">
        <p className="text-muted-foreground">Không tìm thấy mã giảm giá nào</p>
      </div>
    );
  }

  // Filter discounts based on active tab
  const filteredDiscounts = discounts.filter((discount: any) => {
    switch (filter) {
      case "active":
        return isActive(discount);
      case "inactive":
        return !discount.is_active;
      case "expired":
        return isExpired(discount);
      case "upcoming":
        return isUpcoming(discount);
      default:
        return true;
    }
  });

  if (filteredDiscounts.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/10">
        <p className="text-muted-foreground">
          Không tìm thấy mã giảm giá nào phù hợp với bộ lọc
        </p>
      </div>
    );
  }

  // For mobile view - display as cards with more information
  const renderMobileCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
      {filteredDiscounts.map((discount: any) => {
        const statusInfo = getStatusInfo(discount);
        const usageInfo = getUsageInfo(discount);

        return (
          <div key={discount.id} className="border rounded-md p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{discount.code}</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>{statusInfo.icon}</TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{statusInfo.details}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {statusInfo.badge}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(discount)}
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Chỉnh sửa</span>
              </Button>
            </div>

            <div className="text-sm text-muted-foreground line-clamp-2">
              {discount.description || "Không có mô tả"}
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
              <span className="font-medium">Giá trị:</span>
              <span>{getDiscountValue(discount)}</span>

              {discount.min_order_value && (
                <>
                  <span className="font-medium">Đơn tối thiểu:</span>
                  <span>{formatCurrency(discount.min_order_value)}</span>
                </>
              )}

              <span className="font-medium">Thời gian:</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  {discount.start_date || discount.end_date ? (
                    <>
                      {formatDate(discount.start_date)} -{" "}
                      {formatDate(discount.end_date)}
                    </>
                  ) : (
                    "Không giới hạn"
                  )}
                </span>
              </div>

              <span className="font-medium">Sử dụng:</span>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span>{usageInfo.text}</span>
                  {usageInfo.percentage && (
                    <span className="text-xs text-muted-foreground">
                      {usageInfo.percentage}
                    </span>
                  )}
                </div>
                {usageInfo.progress !== null && (
                  <Progress
                    value={usageInfo.progress}
                    className={cn(
                      "h-1.5",
                      usageInfo.progress > 75 ? "bg-red-200" : "bg-muted"
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // For desktop view - display as table with horizontal scrolling
  const renderDesktopTable = () => (
    <div className="hidden md:block border rounded-md">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="bg-muted/30 sticky top-0">
              <TableRow>
                <TableHead className="w-[120px]">Mã giảm giá</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Lượt sử dụng</TableHead>
                <TableHead className="w-[100px]">Trạng thái</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiscounts.map((discount: any) => {
                const statusInfo = getStatusInfo(discount);
                const usageInfo = getUsageInfo(discount);

                return (
                  <TableRow
                    key={discount.id}
                    className="group hover:bg-muted/40"
                  >
                    <TableCell className="font-medium">
                      {discount.code}
                    </TableCell>

                    <TableCell className="max-w-[200px]">
                      <div className="truncate">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate">
                                {discount.description || "—"}
                              </div>
                            </TooltipTrigger>
                            {discount.description && (
                              <TooltipContent side="top" className="max-w-xs">
                                <p>{discount.description}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{getDiscountValue(discount)}</span>
                        {discount.min_order_value && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>
                                  Đơn tối thiểu:{" "}
                                  {formatCurrency(discount.min_order_value)}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {discount.start_date || discount.end_date ? (
                                  <>
                                    {formatDate(discount.start_date)} -{" "}
                                    {formatDate(discount.end_date)}
                                  </>
                                ) : (
                                  "Không giới hạn"
                                )}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {discount.start_date && (
                              <p>
                                Ngày bắt đầu:{" "}
                                {formatDateWithTime(discount.start_date)}
                              </p>
                            )}
                            {discount.end_date && (
                              <p>
                                Ngày kết thúc:{" "}
                                {formatDateWithTime(discount.end_date)}
                              </p>
                            )}
                            {!discount.start_date && !discount.end_date && (
                              <p>Mã giảm giá không có giới hạn thời gian</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    <TableCell>
                      {usageInfo.progress !== null ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-32">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>
                                    {usageInfo.total !== null
                                      ? `Đã dùng: ${usageInfo.used}/${usageInfo.total}`
                                      : "Không giới hạn"}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {usageInfo.percentage}
                                  </span>
                                </div>
                                <Progress
                                  value={usageInfo.progress}
                                  className={cn(
                                    "h-1.5",
                                    usageInfo.progress > 75
                                      ? "bg-red-200"
                                      : "bg-muted"
                                  )}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Đã sử dụng: {usageInfo.used} lượt</p>
                              <p>
                                Còn lại:{" "}
                                {discount.remaining_uses !== null
                                  ? discount.remaining_uses
                                  : 0}{" "}
                                lượt
                              </p>
                              <p>Tổng cộng: {usageInfo.total} lượt</p>
                              {discount.max_uses !== null &&
                                discount.remaining_uses <= 0 && (
                                  <p className="font-medium text-destructive">
                                    Đã hết lượt sử dụng!
                                  </p>
                                )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        "Không giới hạn"
                      )}
                    </TableCell>

                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5">
                              {statusInfo.icon}
                              {statusInfo.badge}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>{statusInfo.details}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(discount)}
                              aria-label="Chỉnh sửa mã giảm giá"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p>Chỉnh sửa mã giảm giá</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="space-y-6 w-full">
      {renderMobileCards()}
      {renderDesktopTable()}
    </div>
  );
}
