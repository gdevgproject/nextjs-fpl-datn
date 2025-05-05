"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { DateRange as ReactDayPickerDateRange } from "react-day-picker";

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
import { cn } from "@/lib/utils";
import { DateRange, TimeFilterOption } from "../types";

interface TimeFilterProps {
  onFilterChange: (filterType: TimeFilterOption, dateRange?: DateRange) => void;
  currentFilter: TimeFilterOption;
  currentDateRange?: DateRange;
}

export function TimeFilter({
  onFilterChange,
  currentFilter,
  currentDateRange,
}: TimeFilterProps) {
  // Initialize date state from currentDateRange if available
  const [date, setDate] = useState<ReactDayPickerDateRange | undefined>(
    currentDateRange?.from && currentDateRange?.to
      ? { from: currentDateRange.from, to: currentDateRange.to }
      : undefined
  );

  const [open, setOpen] = useState(false);

  // Update local date state when currentDateRange prop changes
  useEffect(() => {
    if (currentDateRange?.from && currentDateRange?.to) {
      setDate({ from: currentDateRange.from, to: currentDateRange.to });
    }
  }, [currentDateRange]);

  const handleFilterChange = (value: string) => {
    if (value === "custom") {
      setOpen(true);
    } else {
      onFilterChange(value as TimeFilterOption);
    }
  };

  const handleDateSelect = (range: ReactDayPickerDateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
      // Convert ReactDayPickerDateRange to our custom DateRange
      const customDateRange: DateRange = {
        from: range.from,
        to: range.to,
      };
      onFilterChange("custom", customDateRange);
      // Don't close automatically to allow for adjustments
      // Only close when both dates are selected
      if (range.from && range.to) {
        setOpen(false);
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
      <Select value={currentFilter} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Chọn khoảng thời gian" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hôm nay</SelectItem>
          <SelectItem value="yesterday">Hôm qua</SelectItem>
          <SelectItem value="thisWeek">Tuần này</SelectItem>
          <SelectItem value="lastWeek">Tuần trước</SelectItem>
          <SelectItem value="thisMonth">Tháng này</SelectItem>
          <SelectItem value="lastMonth">Tháng trước</SelectItem>
          <SelectItem value="thisYear">Năm nay</SelectItem>
          <SelectItem value="custom">Tùy chọn...</SelectItem>
        </SelectContent>
      </Select>

      {currentFilter === "custom" && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal w-full sm:w-auto",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                    {format(date.to, "dd/MM/yyyy", { locale: vi })}
                  </>
                ) : (
                  format(date.from, "dd/MM/yyyy", { locale: vi })
                )
              ) : (
                <span>Chọn khoảng thời gian</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              locale={vi}
              disabled={(date) =>
                date > new Date() || date < new Date("2020-01-01")
              }
              footer={
                <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground">
                  Chọn ngày bắt đầu và kết thúc
                </div>
              }
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
