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
import { Pencil } from "lucide-react";
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

interface DiscountTableProps {
  search: string;
  onEdit: (discount: any) => void;
  filter?: string; // "all", "active", "inactive", "expired", "upcoming"
  onError?: (error: Error) => void;
}

export function DiscountTable({ search, onEdit, filter = "all", onError }: DiscountTableProps) {
  const toast = useSonnerToast();
  
  const isActive = (discount: any): boolean => {
    const now = new Date();
    if (!discount.is_active) return false;
    if (discount.end_date && new Date(discount.end_date) < now) return false;
    if (discount.start_date && new Date(discount.start_date) > now) return false;
    if (discount.remaining_uses !== null && discount.remaining_uses <= 0) return false;
    return true;
  }

  const isExpired = (discount: any): boolean => {
    const now = new Date();
    return discount.end_date && new Date(discount.end_date) < now;
  }

  const isUpcoming = (discount: any): boolean => {
    const now = new Date();
    return discount.start_date && new Date(discount.start_date) > now;
  }

  // Fetch discounts with search and filter
  const { data, isLoading, isError, error } = useDiscounts({
    search,
  });

  // Handle errors
  useEffect(() => {
    if (isError && error && onError) {
      onError(error instanceof Error ? error : new Error("Unknown error occurred"));
    }
  }, [isError, error, onError]);

  const formatDate = (date: string | null) => {
    if (!date) return "Không giới hạn";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (discount: any) => {
    const now = new Date();

    if (!discount.is_active) {
      return (
        <Badge variant="outline" className="bg-muted">
          Không hoạt động
        </Badge>
      );
    }

    if (discount.end_date && new Date(discount.end_date) < now) {
      return <Badge variant="destructive">Hết hạn</Badge>;
    }

    if (discount.start_date && new Date(discount.start_date) > now) {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500">
          Sắp diễn ra
        </Badge>
      );
    }

    if (discount.remaining_uses !== null && discount.remaining_uses <= 0) {
      return <Badge variant="destructive">Hết lượt dùng</Badge>;
    }

    return (
      <Badge variant="success" className="bg-green-500 text-white">
        Đang hoạt động
      </Badge>
    );
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

  if (isLoading) {
    return (
      <div className="space-y-3 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array(4).fill(0).map((_, index) => (
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
        <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
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
        <p className="text-muted-foreground">Không tìm thấy mã giảm giá nào phù hợp với bộ lọc</p>
      </div>
    );
  }

  // For mobile view - display as cards
  const renderMobileCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
      {filteredDiscounts.map((discount: any) => (
        <div key={discount.id} className="border rounded-md p-4 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{discount.code}</h3>
            {getStatusBadge(discount)}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {discount.description || "Không có mô tả"}
          </p>
          
          <div className="text-sm">
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Giá trị:</span>
              <span>{getDiscountValue(discount)}</span>
              
              <span className="text-muted-foreground">Thời gian:</span>
              <span>
                {discount.start_date || discount.end_date ? (
                  `${formatDate(discount.start_date)} - ${formatDate(discount.end_date)}`
                ) : (
                  "Không giới hạn"
                )}
              </span>
              
              <span className="text-muted-foreground">Lượt sử dụng:</span>
              <span>
                {discount.max_uses !== null ? (
                  `${discount.remaining_uses !== null ? discount.remaining_uses : 0}/${discount.max_uses}`
                ) : (
                  "Không giới hạn"
                )}
              </span>
            </div>
          </div>
          
          <div className="pt-2 flex justify-end">
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
        </div>
      ))}
    </div>
  );

  // For desktop view - display as table
  const renderDesktopTable = () => (
    <div className="hidden md:block border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Mã giảm giá</TableHead>
            <TableHead className="hidden md:table-cell">Mô tả</TableHead>
            <TableHead>Giá trị</TableHead>
            <TableHead className="hidden lg:table-cell">Thời gian</TableHead>
            <TableHead className="hidden lg:table-cell">Lượt sử dụng</TableHead>
            <TableHead className="w-[100px]">Trạng thái</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDiscounts.map((discount: any) => (
            <TableRow key={discount.id}>
              <TableCell className="font-medium">{discount.code}</TableCell>
              <TableCell className="hidden md:table-cell max-w-[200px]">
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
              <TableCell className="whitespace-nowrap">{getDiscountValue(discount)}</TableCell>
              <TableCell className="hidden lg:table-cell whitespace-nowrap">
                {discount.start_date || discount.end_date ? (
                  <span>
                    {formatDate(discount.start_date)} -{" "}
                    {formatDate(discount.end_date)}
                  </span>
                ) : (
                  "Không giới hạn"
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell whitespace-nowrap">
                {discount.max_uses !== null ? (
                  <span>
                    {discount.remaining_uses !== null
                      ? discount.remaining_uses
                      : 0}
                    /{discount.max_uses}
                  </span>
                ) : (
                  "Không giới hạn"
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">{getStatusBadge(discount)}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6 w-full">
      {renderMobileCards()}
      {renderDesktopTable()}
    </div>
  );
}
