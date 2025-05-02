"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useOrderStatuses } from "../hooks/use-order-statuses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isValid,
  isSameDay,
} from "date-fns";
import { vi } from "date-fns/locale";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  X,
  FileSearch,
  AlertCircle,
  Search,
  Filter,
  Clock,
  Tag,
  User,
  Truck,
  Banknote,
  ShoppingBag,
  Settings,
  RotateCcw,
  CalendarDays,
  Bookmark,
  Loader2,
  ChevronDown,
  Check,
  ChevronRight,
} from "lucide-react";
import { OrdersFilters, PaymentStatus } from "../types";
import { useDebounce } from "../hooks/use-debounce";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";

// Define interfaces for the data types
interface OrderStatus {
  id: number;
  name: string;
  description?: string;
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

// Mock hooks for payment methods and shippers if they don't exist
function usePaymentMethods() {
  return {
    data: {
      data: [
        { id: 1, name: "COD" },
        { id: 2, name: "Momo" },
        { id: 3, name: "Chuyển khoản" },
      ] as PaymentMethod[],
    },
    isLoading: false,
  };
}

function useShippers() {
  return {
    data: {
      data: [
        { id: "1", name: "Nguyễn Văn A", email: "a@example.com" },
        { id: "2", name: "Trần Văn B", email: "b@example.com" },
      ] as Shipper[],
    },
    isLoading: false,
  };
}

interface OrderFiltersProps {
  onFilterChange: (filters: OrdersFilters) => void;
  activeFilters?: OrdersFilters;
  isLoading?: boolean;
}

// Preset date ranges for quick filtering
const DATE_PRESETS = [
  {
    label: "Hôm nay",
    key: "today",
    range: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Hôm qua",
    key: "yesterday",
    range: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: "7 ngày qua",
    key: "last7days",
    range: () => ({
      from: subDays(startOfDay(new Date()), 6),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "30 ngày qua",
    key: "last30days",
    range: () => ({
      from: subDays(startOfDay(new Date()), 29),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Tuần này",
    key: "thisWeek",
    range: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "Tháng này",
    key: "thisMonth",
    range: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
];

// Quick filter presets for common scenarios
const QUICK_FILTERS = [
  {
    label: "Đơn mới",
    key: "new_orders",
    icon: <ShoppingBag className="mr-2 h-4 w-4" />,
    filters: { status_id: 1 }, // Assuming status_id 1 is "Chờ xác nhận"
  },
  {
    label: "Đang xử lý",
    key: "processing",
    icon: <Clock className="mr-2 h-4 w-4" />,
    filters: { status_id: 3 }, // Assuming status_id 3 is "Đang xử lý"
  },
  {
    label: "COD",
    key: "cod_payment",
    icon: <Banknote className="mr-2 h-4 w-4" />,
    filters: { payment_method_id: 1 }, // Assuming payment_method_id 1 is COD
  },
  {
    label: "Vấn đề giao hàng",
    key: "delivery_issues",
    icon: <AlertCircle className="mr-2 h-4 w-4" />,
    filters: { has_delivery_issues: true },
  },
  {
    label: "Chờ thanh toán",
    key: "pending_payment",
    icon: <Tag className="mr-2 h-4 w-4" />,
    filters: { payment_status: "Pending" },
  },
];

export function OrderFilters({
  onFilterChange,
  activeFilters = {},
  isLoading = false,
}: OrderFiltersProps) {
  const toast = useSonnerToast();
  const [filters, setFilters] = useState<OrdersFilters>(activeFilters);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [filterMode, setFilterMode] = useState<"basic" | "advanced">("basic");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get order statuses and payment methods for filter options
  const { data: statusesData, isLoading: isStatusesLoading } =
    useOrderStatuses();
  const { data: paymentMethodsData, isLoading: isPaymentMethodsLoading } =
    usePaymentMethods();
  const { data: shippersData, isLoading: isShippersLoading } = useShippers();

  const statuses = statusesData?.data || [];
  const paymentMethods = paymentMethodsData?.data || [];
  const shippers = shippersData?.data || [];

  // Use debounce for search input to avoid excessive API calls while typing
  const debouncedSearch = useDebounce(filters.search, 400);

  // Initialize date range if filters contain date_start/date_end
  useEffect(() => {
    if ((filters.date_start || filters.date_end) && !dateRange) {
      setDateRange({
        from: filters.date_start ? new Date(filters.date_start) : undefined,
        to: filters.date_end ? new Date(filters.date_end) : undefined,
      });
    }
  }, [filters.date_start, filters.date_end, dateRange]);

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
  const updateFilter = useCallback(
    (key: keyof OrdersFilters, value: any) => {
      setFilters((prev) => {
        const newFilters = { ...prev };

        // If the value is null, undefined, empty string or "all", remove the filter
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          value === "all"
        ) {
          delete newFilters[key];
        } else {
          newFilters[key] = value;
        }

        return newFilters;
      });

      // For non-debounced filters, update immediately except search
      if (key !== "search") {
        setTimeout(() => handleFilterChange(), 0);
      }
    },
    [handleFilterChange]
  );

  // Apply date range filters
  const applyDateRange = useCallback(
    (range: DateRange) => {
      if (range.from) {
        updateFilter("date_start", startOfDay(range.from).toISOString());
      } else {
        updateFilter("date_start", null);
      }

      if (range.to) {
        updateFilter("date_end", endOfDay(range.to).toISOString());
      } else {
        updateFilter("date_end", null);
      }

      setDateRange(range);
    },
    [updateFilter]
  );

  // Apply preset date range
  const applyDatePreset = useCallback(
    (preset: string) => {
      const selectedPreset = DATE_PRESETS.find((p) => p.key === preset);

      if (selectedPreset) {
        const range = selectedPreset.range();
        setDateRange(range);
        updateFilter(
          "date_start",
          startOfDay(range.from as Date).toISOString()
        );
        updateFilter("date_end", endOfDay(range.to as Date).toISOString());
      }
    },
    [updateFilter]
  );

  // Apply quick filter preset
  const applyQuickFilter = useCallback(
    (preset: (typeof QUICK_FILTERS)[0]) => {
      // Reset filters that conflict with this preset to avoid confusing combinations
      const newFilters = { ...filters };

      // If we're filtering by status, clear any other status filters
      if (preset.filters.status_id) {
        delete newFilters.status_id;
      }

      // If we're filtering by payment method, clear payment status
      if (preset.filters.payment_method_id) {
        delete newFilters.payment_status;
      }

      // If we're filtering by payment status, clear payment method
      if (preset.filters.payment_status) {
        delete newFilters.payment_method_id;
      }

      // Apply the new filters
      const updatedFilters = {
        ...newFilters,
        ...preset.filters,
      };

      setFilters(updatedFilters);
      setTimeout(() => onFilterChange(updatedFilters), 0);

      toast.success(`Đã áp dụng bộ lọc: ${preset.label}`, {
        duration: 2000,
      });
    },
    [filters, onFilterChange, toast]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setDateRange(undefined);
    onFilterChange({});

    toast.info("Đã xóa tất cả các bộ lọc", {
      duration: 2000,
    });
  }, [onFilterChange, toast]);

  // Clear a specific filter
  const clearFilter = useCallback(
    (key: keyof OrdersFilters) => {
      setFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters[key];

        // Also clear date_end if clearing date_start and vice versa
        if (key === "date_start" && newFilters.date_end) {
          delete newFilters.date_end;
          setDateRange(undefined);
        } else if (key === "date_end" && newFilters.date_start) {
          delete newFilters.date_start;
          setDateRange(undefined);
        }

        return newFilters;
      });
      setTimeout(() => handleFilterChange(), 0);
    },
    [handleFilterChange]
  );

  // Check if any filters are applied
  const hasFilters = Object.keys(filters).length > 0;

  // Count active filters for the badge
  const activeFilterCount = Object.keys(filters).length;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, "dd/MM/yyyy", { locale: vi }) : "";
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Filter Header */}
      <div className="px-4 py-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-medium leading-none">
              Bộ lọc đơn hàng
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Lọc đơn hàng theo các tiêu chí khác nhau
            </p>
          </div>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-6 ml-2">
              {activeFilterCount} lọc
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            disabled={!hasFilters || isLoading}
            className={cn(
              "h-8 w-8",
              !hasFilters && "opacity-50 cursor-not-allowed"
            )}
            title="Xóa tất cả bộ lọc"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Tabs
            value={filterMode}
            onValueChange={(value) =>
              setFilterMode(value as "basic" | "advanced")
            }
            className="w-fit"
          >
            <TabsList className="h-8 p-0">
              <TabsTrigger value="basic" className="h-8 px-3 text-xs">
                Cơ bản
              </TabsTrigger>
              <TabsTrigger value="advanced" className="h-8 px-3 text-xs">
                Nâng cao
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="px-4 py-3 bg-muted/30 border-b flex flex-wrap gap-2">
        {/* Quick filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 bg-background"
            >
              <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
              Lọc nhanh
              <ChevronDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px]">
            <DropdownMenuLabel>Áp dụng lọc nhanh</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-60">
              {QUICK_FILTERS.map((preset) => (
                <DropdownMenuItem
                  key={preset.key}
                  onClick={() => applyQuickFilter(preset)}
                  className="cursor-pointer flex items-center"
                >
                  {preset.icon}
                  {preset.label}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">
                Khoảng thời gian
              </DropdownMenuLabel>

              {DATE_PRESETS.map((preset) => (
                <DropdownMenuItem
                  key={preset.key}
                  onClick={() => applyDatePreset(preset.key)}
                  className="cursor-pointer flex items-center"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {preset.label}
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick status filters */}
        {!isStatusesLoading &&
          statuses.slice(0, 4).map((status) => (
            <Button
              key={status.id}
              variant={filters.status_id === status.id ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateFilter(
                  "status_id",
                  filters.status_id === status.id ? null : status.id
                )
              }
              className="h-8"
            >
              {status.name}
              {filters.status_id === status.id && (
                <X
                  className="ml-2 h-3.5 w-3.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilter("status_id");
                  }}
                />
              )}
            </Button>
          ))}

        {/* Payment status quick filters */}
        <Button
          variant={filters.payment_status === "Pending" ? "default" : "outline"}
          size="sm"
          onClick={() =>
            updateFilter(
              "payment_status",
              filters.payment_status === "Pending" ? null : "Pending"
            )
          }
          className="h-8 hidden sm:flex"
        >
          Chờ thanh toán
          {filters.payment_status === "Pending" && (
            <X
              className="ml-2 h-3.5 w-3.5"
              onClick={(e) => {
                e.stopPropagation();
                clearFilter("payment_status");
              }}
            />
          )}
        </Button>

        {/* Search button for mobile, expands/collapses search box */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 sm:hidden ml-auto"
          onClick={() => setMobileExpanded(!mobileExpanded)}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Basic Search Bar - Always visible on desktop, toggled on mobile */}
      <div
        className={cn(
          "px-4 py-3 border-b",
          !mobileExpanded && "hidden sm:block"
        )}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Tìm kiếm theo mã đơn, tên hoặc số điện thoại khách hàng..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9 pr-10"
          />

          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full"
              onClick={() => updateFilter("search", "")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Basic Filters Section */}
      {filterMode === "basic" && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Status filter */}
          <div className="space-y-2">
            <label
              htmlFor="status"
              className="text-sm font-medium flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
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
              disabled={isStatusesLoading || isLoading}
            >
              <SelectTrigger
                id="status"
                className={isStatusesLoading || isLoading ? "opacity-70" : ""}
              >
                <SelectValue placeholder="Tất cả trạng thái" />
                {isStatusesLoading && (
                  <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                )}
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
            <label
              htmlFor="payment-status"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Banknote className="h-4 w-4 text-muted-foreground" />
              Trạng thái thanh toán
            </label>
            <Select
              value={filters.payment_status || "all"}
              onValueChange={(value) =>
                updateFilter("payment_status", value === "all" ? null : value)
              }
              disabled={isLoading}
            >
              <SelectTrigger id="payment-status">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Pending">Chờ thanh toán</SelectItem>
                <SelectItem value="Paid">Đã thanh toán</SelectItem>
                <SelectItem value="Failed">Thất bại</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date range filter */}
          <div className="space-y-2">
            <label
              htmlFor="date-range"
              className="text-sm font-medium flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Khoảng thời gian
            </label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date-range"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.date_start &&
                      !filters.date_end &&
                      "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date_start && filters.date_end
                    ? isSameDay(
                        new Date(filters.date_start),
                        new Date(filters.date_end)
                      )
                      ? formatDate(filters.date_start)
                      : `${formatDate(filters.date_start)} - ${formatDate(
                          filters.date_end
                        )}`
                    : filters.date_start
                    ? `Từ ${formatDate(filters.date_start)}`
                    : filters.date_end
                    ? `Đến ${formatDate(filters.date_end)}`
                    : "Chọn khoảng thời gian"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">
                      Chọn khoảng thời gian
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Hoặc chọn từ các lựa chọn nhanh
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {DATE_PRESETS.slice(0, 4).map((preset) => (
                      <Button
                        key={preset.key}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          applyDatePreset(preset.key);
                          setDatePickerOpen(false);
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range) {
                      applyDateRange(range);
                    }
                  }}
                  numberOfMonths={2}
                  initialFocus
                  defaultMonth={dateRange?.from}
                />

                <div className="flex items-center justify-between p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updateFilter("date_start", null);
                      updateFilter("date_end", null);
                      setDateRange(undefined);
                      setDatePickerOpen(false);
                    }}
                  >
                    Xóa
                  </Button>

                  <Button size="sm" onClick={() => setDatePickerOpen(false)}>
                    Áp dụng
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Advanced Filters Section */}
      {filterMode === "advanced" && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="status"
              className="text-sm font-medium flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
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
              disabled={isStatusesLoading || isLoading}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.name}
                    {status.description && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({status.description})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="payment-status"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Banknote className="h-4 w-4 text-muted-foreground" />
              Trạng thái thanh toán
            </label>
            <Select
              value={filters.payment_status || "all"}
              onValueChange={(value) =>
                updateFilter("payment_status", value === "all" ? null : value)
              }
              disabled={isLoading}
            >
              <SelectTrigger id="payment-status">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Pending">Chờ thanh toán</SelectItem>
                <SelectItem value="Paid">Đã thanh toán</SelectItem>
                <SelectItem value="Failed">Thất bại</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="payment-method"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Tag className="h-4 w-4 text-muted-foreground" />
              Phương thức thanh toán
            </label>
            <Select
              value={filters.payment_method_id?.toString() || "all"}
              onValueChange={(value) =>
                updateFilter(
                  "payment_method_id",
                  value === "all" ? null : parseInt(value, 10)
                )
              }
              disabled={isPaymentMethodsLoading || isLoading}
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

          <div className="space-y-2">
            <label
              htmlFor="shipper"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Truck className="h-4 w-4 text-muted-foreground" />
              Người giao hàng
            </label>
            <Select
              value={filters.assigned_shipper_id || "all"}
              onValueChange={(value) =>
                updateFilter(
                  "assigned_shipper_id",
                  value === "all" ? null : value
                )
              }
              disabled={isShippersLoading || isLoading}
            >
              <SelectTrigger id="shipper">
                <SelectValue placeholder="Tất cả shipper" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả shipper</SelectItem>
                <SelectItem value="unassigned">Chưa phân công</SelectItem>
                {shippers.map((shipper) => (
                  <SelectItem key={shipper.id} value={shipper.id}>
                    {shipper.name || shipper.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="user-type"
              className="text-sm font-medium flex items-center gap-2"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              Loại khách hàng
            </label>
            <Select
              value={filters.user_id || "all"}
              onValueChange={(value) =>
                updateFilter("user_id", value === "all" ? null : value)
              }
              disabled={isLoading}
            >
              <SelectTrigger id="user-type">
                <SelectValue placeholder="Tất cả khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khách hàng</SelectItem>
                <SelectItem value="registered">Đã đăng ký</SelectItem>
                <SelectItem value="guest">Khách vãng lai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              Tùy chọn khác
            </label>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <Checkbox
                  id="issues"
                  checked={filters.has_delivery_issues === true}
                  onCheckedChange={(checked) =>
                    updateFilter("has_delivery_issues", checked ? true : null)
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="issues"
                  className="text-sm flex items-center gap-1 cursor-pointer"
                >
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>Vấn đề giao hàng</span>
                </label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-3">
                <Checkbox
                  id="cancelled"
                  checked={filters.cancelled_order === true}
                  onCheckedChange={(checked) =>
                    updateFilter("cancelled_order", checked ? true : null)
                  }
                  disabled={isLoading}
                />
                <label htmlFor="cancelled" className="text-sm cursor-pointer">
                  Đơn hàng đã hủy
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasFilters && (
        <div className="px-4 py-3 border-t bg-muted/30 flex flex-wrap gap-1.5">
          {Object.keys(filters).map((key) => {
            const filterKey = key as keyof OrdersFilters;
            let label = "";
            let value = "";

            // Generate human-readable filter descriptions
            switch (filterKey) {
              case "search":
                label = "Tìm kiếm";
                value = String(filters.search);
                break;
              case "status_id":
                label = "Trạng thái";
                value =
                  statuses.find((s) => s.id === filters.status_id)?.name ||
                  String(filters.status_id);
                break;
              case "payment_status":
                label = "Thanh toán";
                value =
                  filters.payment_status === "Pending"
                    ? "Chờ thanh toán"
                    : filters.payment_status === "Paid"
                    ? "Đã thanh toán"
                    : filters.payment_status === "Failed"
                    ? "Thất bại"
                    : String(filters.payment_status);
                break;
              case "payment_method_id":
                label = "Phương thức";
                value =
                  paymentMethods.find((m) => m.id === filters.payment_method_id)
                    ?.name || String(filters.payment_method_id);
                break;
              case "date_start":
                if (filters.date_end) {
                  // If both dates are set, we'll show a combined badge
                  break;
                }
                label = "Từ ngày";
                value = formatDate(String(filters.date_start));
                break;
              case "date_end":
                if (filters.date_start) {
                  label = "Ngày";
                  value = `${formatDate(
                    String(filters.date_start)
                  )} - ${formatDate(String(filters.date_end))}`;
                } else {
                  label = "Đến ngày";
                  value = formatDate(String(filters.date_end));
                }
                break;
              case "assigned_shipper_id":
                label = "Shipper";
                value =
                  filters.assigned_shipper_id === "unassigned"
                    ? "Chưa phân công"
                    : shippers.find((s) => s.id === filters.assigned_shipper_id)
                        ?.name || String(filters.assigned_shipper_id);
                break;
              case "has_delivery_issues":
                if (filters.has_delivery_issues === true) {
                  label = "";
                  value = "Có vấn đề giao hàng";
                }
                break;
              case "cancelled_order":
                if (filters.cancelled_order === true) {
                  label = "";
                  value = "Đơn hàng đã hủy";
                }
                break;
              case "user_id":
                label = "Khách hàng";
                value =
                  filters.user_id === "registered"
                    ? "Đã đăng ký"
                    : filters.user_id === "guest"
                    ? "Khách vãng lai"
                    : String(filters.user_id);
                break;
              default:
                label = filterKey;
                value = String(filters[filterKey]);
            }

            // Skip if we're handling date_start and date_end in a combined badge
            if (filterKey === "date_start" && filters.date_end) {
              return null;
            }

            return (
              <Badge
                key={filterKey}
                variant="outline"
                className="py-1 h-7 gap-1.5 bg-background group hover:bg-background"
              >
                {label && (
                  <span className="font-normal text-muted-foreground">
                    {label}:
                  </span>
                )}
                <span className="font-medium">{value}</span>
                <button
                  onClick={() => clearFilter(filterKey)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {/* Clear all filters button */}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 gap-1 px-2 ml-1"
              disabled={isLoading}
            >
              <X className="h-3.5 w-3.5" />
              Xóa tất cả
            </Button>
          )}
        </div>
      )}

      {isLoading && (
        <div className="px-4 py-2 border-t bg-muted/50 flex items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
          Đang áp dụng bộ lọc...
        </div>
      )}
    </div>
  );
}
