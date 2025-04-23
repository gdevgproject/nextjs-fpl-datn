"use client";

import { useState, useEffect, useCallback } from "react";
import { useOrderStatuses } from "../hooks/use-order-statuses";
import { usePaymentMethods } from "../hooks/use-payment-methods";
import { useDebounce } from "../hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { OrdersFilters } from "../types";
import { cn } from "@/lib/utils";

interface OrderFiltersProps {
  onFilterChange: (filters: OrdersFilters) => void;
}

export function OrderFilters({ onFilterChange }: OrderFiltersProps) {
  const [filters, setFilters] = useState<OrdersFilters>({});

  // Get order statuses and payment methods for filter options
  const { data: statusesData } = useOrderStatuses();
  const { data: paymentMethodsData } = usePaymentMethods();

  const statuses = statusesData?.data || [];
  const paymentMethods = paymentMethodsData?.data || [];

  // Use debounce for search input to avoid excessive API calls while typing
  const debouncedSearch = useDebounce(filters.search, 500);

  // Handle filter changes (this avoids too many rerenders)
  const handleFilterChange = useCallback(() => {
    onFilterChange({
      ...filters,
      search: debouncedSearch,
    });
  }, [filters, debouncedSearch, onFilterChange]);

  // Apply filters when the debounced search changes
  useEffect(() => {
    handleFilterChange();
  }, [debouncedSearch, handleFilterChange]);

  // Update a single filter
  const updateFilter = (key: keyof OrdersFilters, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      // If the value is null or empty string, remove the filter
      if (value === null || value === "") {
        delete newFilters[key];
      }

      return newFilters;
    });

    // For non-debounced filters, update immediately except search
    if (key !== "search") {
      setTimeout(() => handleFilterChange(), 0);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  // Check if any filters are applied
  const hasFilters = Object.keys(filters).length > 0;

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Lọc đơn hàng</h2>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 gap-1"
          >
            <X className="h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search by ID, recipient name, or phone */}
        <div className="space-y-2">
          <label htmlFor="search" className="text-sm font-medium">
            Tìm kiếm
          </label>
          <Input
            id="search"
            placeholder="Mã đơn, tên, SĐT..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Trạng thái đơn hàng
          </label>
          <Select
            value={filters.status_id?.toString() || "all"}
            onValueChange={(value) =>
              updateFilter(
                "status_id",
                value === "all" ? null : parseInt(value, 10)
              )
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.id.toString()}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment status filter */}
        <div className="space-y-2">
          <label htmlFor="payment-status" className="text-sm font-medium">
            Thanh toán
          </label>
          <Select
            value={filters.payment_status || "all"}
            onValueChange={(value) =>
              updateFilter("payment_status", value === "all" ? null : value)
            }
          >
            <SelectTrigger id="payment-status">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="Pending">Chờ thanh toán</SelectItem>
              <SelectItem value="Paid">Đã thanh toán</SelectItem>
              <SelectItem value="Failed">Thất bại</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment method filter */}
        <div className="space-y-2">
          <label htmlFor="payment-method" className="text-sm font-medium">
            Phương thức
          </label>
          <Select
            value={filters.payment_method_id?.toString() || "all"}
            onValueChange={(value) =>
              updateFilter(
                "payment_method_id",
                value === "all" ? null : parseInt(value, 10)
              )
            }
          >
            <SelectTrigger id="payment-method">
              <SelectValue placeholder="Tất cả phương thức" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phương thức</SelectItem>
              {paymentMethods.map((method) => (
                <SelectItem key={method.id} value={method.id.toString()}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date filter */}
        <div className="space-y-2">
          <label htmlFor="start-date" className="text-sm font-medium">
            Từ ngày
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="start-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.date_start && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.date_start
                  ? format(new Date(filters.date_start), "dd/MM/yyyy", {
                      locale: vi,
                    })
                  : "Chọn ngày bắt đầu"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  filters.date_start ? new Date(filters.date_start) : undefined
                }
                onSelect={(date) =>
                  updateFilter("date_start", date?.toISOString() || null)
                }
                initialFocus
              />
              {filters.date_start && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilter("date_start", null)}
                    className="w-full justify-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Xóa ngày
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date filter */}
        <div className="space-y-2">
          <label htmlFor="end-date" className="text-sm font-medium">
            Đến ngày
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="end-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.date_end && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.date_end
                  ? format(new Date(filters.date_end), "dd/MM/yyyy", {
                      locale: vi,
                    })
                  : "Chọn ngày kết thúc"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  filters.date_end ? new Date(filters.date_end) : undefined
                }
                onSelect={(date) => {
                  if (date) {
                    // Set time to end of day for the end date
                    const endOfDay = new Date(date);
                    endOfDay.setHours(23, 59, 59, 999);
                    updateFilter("date_end", endOfDay.toISOString());
                  } else {
                    updateFilter("date_end", null);
                  }
                }}
                initialFocus
              />
              {filters.date_end && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilter("date_end", null)}
                    className="w-full justify-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Xóa ngày
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
