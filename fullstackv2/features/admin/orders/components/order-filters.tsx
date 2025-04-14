"use client"

import { useState, useEffect } from "react"
import { useDebounce } from "../hooks/use-debounce"
import { useOrderStatuses } from "../hooks/use-order-statuses"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search, X } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/shared/lib/utils"
import type { OrdersFilters } from "../hooks/use-orders"

interface OrderFiltersProps {
  onFilterChange: (filters: OrdersFilters) => void
}

export function OrderFilters({ onFilterChange }: OrderFiltersProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string | undefined>(undefined)
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)

  const debouncedSearch = useDebounce(search, 500)
  const { data: statusesData } = useOrderStatuses()
  const statuses = statusesData?.data || []

  useEffect(() => {
    const filters: OrdersFilters = {}

    if (debouncedSearch) {
      filters.search = debouncedSearch
    }

    if (status && status !== "all") {
      filters.status = Number.parseInt(status)
    }

    if (paymentStatus && paymentStatus !== "all") {
      filters.paymentStatus = paymentStatus
    }

    if (dateFrom) {
      filters.dateFrom = dateFrom.toISOString()
    }

    if (dateTo) {
      filters.dateTo = dateTo.toISOString()
    }

    onFilterChange(filters)
  }, [debouncedSearch, status, paymentStatus, dateFrom, dateTo, onFilterChange])

  const resetFilters = () => {
    setSearch("")
    setStatus(undefined)
    setPaymentStatus(undefined)
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  return (
    <div className="bg-card rounded-md border p-4 shadow-sm">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search">Tìm kiếm</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                type="search"
                placeholder="Tìm theo ID, tên, số điện thoại..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:w-[180px] space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select value={status} onValueChange={setStatus}>
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

          <div className="w-full md:w-[180px] space-y-2">
            <Label htmlFor="payment-status">Thanh toán</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
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

          <div className="w-full md:w-[180px] space-y-2">
            <Label>Từ ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus locale={vi} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-full md:w-[180px] space-y-2">
            <Label>Đến ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus locale={vi} />
              </PopoverContent>
            </Popover>
          </div>

          <Button variant="ghost" size="icon" onClick={resetFilters} className="h-10 w-10">
            <X className="h-4 w-4" />
            <span className="sr-only">Reset filters</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
