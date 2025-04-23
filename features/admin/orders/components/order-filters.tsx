"use client";

import { useState, useEffect, useCallback } from "react";
import { useOrderStatuses } from "../hooks/use-order-statuses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  X,
  FileSearch,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import { OrdersFilters, PaymentStatus } from "../types";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

// Define interfaces for the data types
interface OrderStatus {
  id: number;
  name: string;
}

interface PaymentMethod {
  id: number;
  name: string;
}

interface Shipper {
  id: string;
  name?: string;
  email?: string;
}

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Mock hooks for payment methods and shippers if they don't exist
function usePaymentMethods() {
  return {
    data: {
      data: [] as PaymentMethod[],
    },
  };
}

function useShippers() {
  return {
    data: {
      data: [] as Shipper[],
    },
  };
}

interface OrderFiltersProps {
  onFilterChange: (filters: OrdersFilters) => void;
  activeFilters?: OrdersFilters;
}

export function OrderFilters({
  onFilterChange,
  activeFilters = {},
}: OrderFiltersProps) {
  const [filters, setFilters] = useState<OrdersFilters>(activeFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get order statuses and payment methods for filter options
  const { data: statusesData } = useOrderStatuses();
  const { data: paymentMethodsData } = usePaymentMethods();
  const { data: shippersData } = useShippers();

  const statuses = statusesData?.data || [];
  const paymentMethods = paymentMethodsData?.data || [];
  const shippers = shippersData?.data || [];

  // Define quick date filters
  const quickDateFilters = [
    { label: "Hôm nay", start: new Date(), end: new Date() },
    { label: "7 ngày qua", start: subDays(new Date(), 7), end: new Date() },
    { label: "30 ngày qua", start: subDays(new Date(), 30), end: new Date() },
  ];

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

  // Apply quick date filter
  const applyQuickDateFilter = (start: Date, end: Date) => {
    setFilters((prev) => ({
      ...prev,
      date_start: start.toISOString(),
      date_end: end.toISOString(),
    }));
    setTimeout(() => handleFilterChange(), 0);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  // Check if any filters are applied
  const hasFilters = Object.keys(filters).length > 0;

  // Count active filters for the badge
  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium">Bộ lọc đơn hàng</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-6">
              {activeFilterCount} lọc đang áp dụng
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-8 gap-1"
            >
              <X className="h-4 w-4" />
              Xóa bộ lọc
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 gap-1"
          >
            <Filter className="h-4 w-4" />
            {isExpanded ? "Thu gọn" : "Mở rộng"} bộ lọc
          </Button>
        </div>
      </div>

      {/* Basic filters always visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Search by ID, recipient name, or phone */}
        <div className="space-y-2 md:col-span-2">
          <label
            htmlFor="search"
            className="text-sm font-medium flex items-center gap-1"
          >
            <Search className="h-4 w-4" /> Tìm kiếm
          </label>
          <div className="relative">
            <Input
              id="search"
              placeholder="Mã đơn, tên khách hàng, số điện thoại..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-9"
            />
            <FileSearch className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Status filter */}
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Trạng thái đơn hàng
          </label>
          <Select
            value={filters.status_id?.toString() || ""}
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
              {statuses.map((status: OrderStatus) => (
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
            value={filters.payment_status || ""}
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
              <SelectItem value="Refunded">Đã hoàn tiền</SelectItem>
              <SelectItem value="Partially Refunded">
                Hoàn tiền một phần
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced filters expandable */}
      {isExpanded && (
        <div className="pt-4 space-y-4 border-t mt-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="date" className="border-none">
              <AccordionTrigger className="py-2 px-0">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Khoảng thời gian</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                  {/* Quick date filters */}
                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-sm font-medium">Lọc nhanh</label>
                    <div className="flex flex-wrap gap-2">
                      {quickDateFilters.map((filter, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            applyQuickDateFilter(filter.start, filter.end)
                          }
                          className="h-8"
                        >
                          {filter.label}
                        </Button>
                      ))}
                    </div>
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
                            ? format(
                                new Date(filters.date_start),
                                "dd/MM/yyyy",
                                {
                                  locale: vi,
                                }
                              )
                            : "Chọn ngày bắt đầu"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            filters.date_start
                              ? new Date(filters.date_start)
                              : undefined
                          }
                          onSelect={(date) =>
                            updateFilter(
                              "date_start",
                              date?.toISOString() || null
                            )
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
                            filters.date_end
                              ? new Date(filters.date_end)
                              : undefined
                          }
                          onSelect={(date) =>
                            updateFilter(
                              "date_end",
                              date?.toISOString() || null
                            )
                          }
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payment" className="border-none">
              <AccordionTrigger className="py-2 px-0">
                <div className="flex items-center gap-2">
                  <span>Thanh toán & Vận chuyển</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {/* Payment method filter */}
                  <div className="space-y-2">
                    <label
                      htmlFor="payment-method"
                      className="text-sm font-medium"
                    >
                      Phương thức thanh toán
                    </label>
                    <Select
                      value={filters.payment_method_id?.toString() || ""}
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
                        {paymentMethods.map((method: PaymentMethod) => (
                          <SelectItem
                            key={method.id}
                            value={method.id.toString()}
                          >
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assigned shipper filter */}
                  <div className="space-y-2">
                    <label htmlFor="shipper" className="text-sm font-medium">
                      Người giao hàng
                    </label>
                    <Select
                      value={filters.assigned_shipper_id || ""}
                      onValueChange={(value) =>
                        updateFilter(
                          "assigned_shipper_id",
                          value === "all" ? null : value
                        )
                      }
                    >
                      <SelectTrigger id="shipper">
                        <SelectValue placeholder="Tất cả shipper" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả shipper</SelectItem>
                        <SelectItem value="unassigned">
                          Chưa phân công
                        </SelectItem>
                        {shippers.map((shipper: Shipper) => (
                          <SelectItem key={shipper.id} value={shipper.id}>
                            {shipper.name || shipper.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Delivery issues filter */}
                  <div className="space-y-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="issues"
                        checked={filters.has_delivery_issues === true}
                        onCheckedChange={(checked) =>
                          updateFilter(
                            "has_delivery_issues",
                            checked ? true : null
                          )
                        }
                      />
                      <label
                        htmlFor="issues"
                        className="text-sm font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Có vấn đề giao hàng
                      </label>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="status" className="border-none">
              <AccordionTrigger className="py-2 px-0">
                <div className="flex items-center gap-2">
                  <span>Bộ lọc khác</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {/* Cancelled order filter */}
                  <div className="space-y-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cancelled"
                        checked={filters.cancelled_order === true}
                        onCheckedChange={(checked) =>
                          updateFilter("cancelled_order", checked ? true : null)
                        }
                      />
                      <label
                        htmlFor="cancelled"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Hiển thị đơn hàng đã hủy
                      </label>
                    </div>
                  </div>

                  {/* User registered filter - only if you need to filter by registered vs guest users */}
                  <div className="space-y-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="user_orders"
                        checked={filters.user_id === "registered"}
                        onCheckedChange={(checked) =>
                          updateFilter("user_id", checked ? "registered" : null)
                        }
                      />
                      <label
                        htmlFor="user_orders"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Chỉ đơn của khách đã đăng ký
                      </label>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* Active filters summary */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 pt-3 border-t">
          {filters.search && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Tìm kiếm: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("search", null)}
              />
            </Badge>
          )}
          {filters.status_id !== undefined && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Trạng thái:{" "}
              {statuses.find((s: OrderStatus) => s.id === filters.status_id)
                ?.name || filters.status_id}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("status_id", null)}
              />
            </Badge>
          )}
          {filters.payment_status && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Trạng thái thanh toán: {filters.payment_status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("payment_status", null)}
              />
            </Badge>
          )}
          {filters.payment_method_id && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Phương thức:{" "}
              {paymentMethods.find((m) => m.id === filters.payment_method_id)
                ?.name || filters.payment_method_id}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("payment_method_id", null)}
              />
            </Badge>
          )}
          {filters.date_start && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Từ:{" "}
              {format(new Date(filters.date_start), "dd/MM/yyyy", {
                locale: vi,
              })}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("date_start", null)}
              />
            </Badge>
          )}
          {filters.date_end && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Đến:{" "}
              {format(new Date(filters.date_end), "dd/MM/yyyy", {
                locale: vi,
              })}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("date_end", null)}
              />
            </Badge>
          )}
          {filters.assigned_shipper_id && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Shipper:{" "}
              {filters.assigned_shipper_id === "unassigned"
                ? "Chưa phân công"
                : shippers.find((s) => s.id === filters.assigned_shipper_id)
                    ?.name || filters.assigned_shipper_id}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("assigned_shipper_id", null)}
              />
            </Badge>
          )}
          {filters.has_delivery_issues === true && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Có vấn đề giao hàng
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("has_delivery_issues", null)}
              />
            </Badge>
          )}
          {filters.cancelled_order === true && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Đơn hàng đã hủy
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("cancelled_order", null)}
              />
            </Badge>
          )}
          {filters.user_id === "registered" && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Khách đã đăng ký
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("user_id", null)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
