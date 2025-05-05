"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useOrderStatuses } from "../hooks/use-order-statuses";
import { useAuthQuery } from "@/features/auth/hooks";
import { OrdersFilters } from "../types";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import {
  ChevronDown,
  ListFilter,
  CalendarIcon,
  Search,
  X,
  Loader2,
} from "lucide-react";

interface OrderFilterBarProps {
  form: UseFormReturn<OrdersFilters>;
  isLoading: boolean;
  onSubmit: () => void;
  onReset: () => void;
  onToggleFilterPanel: () => void;
  isFilterPanelOpen: boolean;
}

export function OrderFilterBar({
  form,
  isLoading,
  onSubmit,
  onReset,
  onToggleFilterPanel,
  isFilterPanelOpen,
}: OrderFilterBarProps) {
  const { register, setValue, watch } = form;

  // Get authentication session to determine user role
  const { data: session } = useAuthQuery();
  const userRole = session?.user?.app_metadata?.role || "authenticated";
  const isShipper = userRole === "shipper";

  // Get order statuses for filtering
  const { data: statusesResponse } = useOrderStatuses();
  const orderStatuses = statusesResponse?.data || [];

  // Date filters
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // Search term
  const currentSearch = watch("search") || "";

  // Handle date range changes
  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    if (date) {
      setValue("date_start", format(date, "yyyy-MM-dd"));
    } else {
      setValue("date_start", undefined);
    }
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    if (date) {
      setValue("date_end", format(date, "yyyy-MM-dd"));
    } else {
      setValue("date_end", undefined);
    }
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    const numValue = Number(value);
    setValue("status_id", isNaN(numValue) ? undefined : numValue);
    // Auto submit form on change
    setTimeout(onSubmit, 0);
  };

  // Handle payment status change
  const handlePaymentStatusChange = (value: string) => {
    setValue(
      "payment_status",
      value === "all" ? undefined : (value as "Pending" | "Paid")
    );
    // Auto submit form on change
    setTimeout(onSubmit, 0);
  };

  // Clear search
  const handleClearSearch = () => {
    setValue("search", "");
    // Auto submit form on change
    setTimeout(onSubmit, 0);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-end">
      {/* Search bar */}
      <div className="relative flex-grow max-w-md">
        <Input
          placeholder="Tìm kiếm đơn hàng..."
          className="pl-9 pr-8"
          {...register("search")}
          disabled={isLoading}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {currentSearch && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </button>
        )}
      </div>

      {/* Date filters */}
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="justify-start text-left font-normal w-[140px]"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? (
                format(dateFrom, "dd/MM/yyyy", { locale: vi })
              ) : (
                <span>Từ ngày</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={handleDateFromChange}
              initialFocus
              disabled={(date) => (dateTo ? date > dateTo : false)}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="justify-start text-left font-normal w-[140px]"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? (
                format(dateTo, "dd/MM/yyyy", { locale: vi })
              ) : (
                <span>Đến ngày</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={handleDateToChange}
              initialFocus
              disabled={(date) => (dateFrom ? date < dateFrom : false)}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Status filter */}
      <Select onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Tất cả trạng thái</SelectItem>
          {orderStatuses.map((status) => (
            <SelectItem key={status.id} value={status.id.toString()}>
              {status.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Payment status filter */}
      <Select onValueChange={handlePaymentStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Thanh toán" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="Paid">Đã thanh toán</SelectItem>
          <SelectItem value="Pending">Chưa thanh toán</SelectItem>
        </SelectContent>
      </Select>

      {/* More filters (dropdown) - Không hiển thị cho shipper */}
      {!isShipper && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <ListFilter className="h-4 w-4" />
              <span className="sr-only">More filters</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Bộ lọc nâng cao</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={watch("has_delivery_issues") || false}
              onCheckedChange={(checked) => {
                setValue("has_delivery_issues", checked);
                setTimeout(onSubmit, 0);
              }}
            >
              Có vấn đề giao hàng
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={watch("cancelled_order") || false}
              onCheckedChange={(checked) => {
                setValue("cancelled_order", checked);
                setTimeout(onSubmit, 0);
              }}
            >
              Đơn hàng đã hủy
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={watch("user_id") === "registered"}
              onCheckedChange={(checked) => {
                setValue("user_id", checked ? "registered" : undefined);
                setTimeout(onSubmit, 0);
              }}
            >
              Khách hàng đăng ký
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Toggle filter panel button - Không hiển thị cho shipper */}
      {!isShipper && (
        <Button
          variant={isFilterPanelOpen ? "secondary" : "outline"}
          size="icon"
          onClick={onToggleFilterPanel}
          className="ml-2"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isFilterPanelOpen ? "rotate-180" : ""
            }`}
          />
          <span className="sr-only">Toggle filter panel</span>
        </Button>
      )}

      {/* Submit and Reset buttons */}
      <Button
        onClick={onSubmit}
        size="sm"
        className="whitespace-nowrap"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tải...
          </>
        ) : (
          "Áp dụng bộ lọc"
        )}
      </Button>

      <Button
        onClick={onReset}
        variant="ghost"
        size="sm"
        className="whitespace-nowrap"
        disabled={isLoading}
      >
        Đặt lại
      </Button>
    </div>
  );
}
