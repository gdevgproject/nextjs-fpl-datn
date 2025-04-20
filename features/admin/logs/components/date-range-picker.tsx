"use client";

import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Thêm hook để kiểm tra kích thước màn hình
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string | undefined) => void;
  onEndDateChange: (date: string | undefined) => void;
  className?: string;
  align?: "start" | "center" | "end";
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
  align = "start",
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    startDate && endDate
      ? {
          from: new Date(startDate),
          to: new Date(endDate),
        }
      : undefined
  );

  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Reset state when props change
  React.useEffect(() => {
    if (!startDate && !endDate) {
      setDate(undefined);
    } else if (startDate || endDate) {
      setDate({
        from: startDate ? new Date(startDate) : undefined,
        to: endDate ? new Date(endDate) : undefined,
      });
    }
  }, [startDate, endDate]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);

    if (range?.from) {
      onStartDateChange(format(range.from, "yyyy-MM-dd"));
    } else {
      onStartDateChange(undefined);
    }

    if (range?.to) {
      onEndDateChange(format(range.to, "yyyy-MM-dd"));
    } else {
      onEndDateChange(undefined);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(undefined);
    onStartDateChange(undefined);
    onEndDateChange(undefined);
    setOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex">
            <Button
              id="date"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-haspopup="dialog"
              className={cn(
                "w-full justify-between text-left font-normal rounded-r-none border-r-0",
                !date && "text-muted-foreground"
              )}
              onClick={() => setOpen(true)}
            >
              <div className="flex items-center truncate">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <span className="truncate">
                      {format(date.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                      {format(date.to, "dd/MM/yyyy", { locale: vi })}
                    </span>
                  ) : (
                    <span className="truncate">
                      {format(date.from, "dd/MM/yyyy", { locale: vi })}
                    </span>
                  )
                ) : (
                  <span>Chọn khoảng thời gian</span>
                )}
              </div>
            </Button>
            {date && (
              <Button
                variant="outline"
                size="icon"
                className="rounded-l-none border-l-0"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Xóa</span>
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align} side="bottom">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from || new Date()}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={isDesktop ? 2 : 1}
            locale={vi}
            className="border-0"
          />
          <div className="flex items-center justify-between border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!date}
            >
              Xóa
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Áp dụng
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
