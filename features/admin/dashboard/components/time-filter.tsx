"use client";

import { useState } from "react";
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
import { DateRange } from "../types";

interface TimeFilterProps {
  onFilterChange: (filterType: string, dateRange?: DateRange) => void;
  currentFilter: string;
}

export function TimeFilter({ onFilterChange, currentFilter }: TimeFilterProps) {
  const [date, setDate] = useState<ReactDayPickerDateRange | undefined>(
    undefined
  );
  const [open, setOpen] = useState(false);

  const handleFilterChange = (value: string) => {
    if (value === "custom") {
      setOpen(true);
    } else {
      onFilterChange(value);
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
      setOpen(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Select value={currentFilter} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Chọn khoảng thời gian" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hôm nay</SelectItem>
          <SelectItem value="thisWeek">Tuần này</SelectItem>
          <SelectItem value="thisMonth">Tháng này</SelectItem>
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
                "justify-start text-left font-normal",
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
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
