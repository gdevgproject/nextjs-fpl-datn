"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export function OrderFilter() {
  const [searchTerm, setSearchTerm] = useState("")
  const [status, setStatus] = useState("")
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [isFiltered, setIsFiltered] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsFiltered(!!searchTerm || !!status || !!dateFrom || !!dateTo)
    // Thực hiện tìm kiếm
  }

  const handleReset = () => {
    setSearchTerm("")
    setStatus("")
    setDateFrom(undefined)
    setDateTo(undefined)
    setIsFiltered(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm theo mã đơn hàng"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Pending">Chờ xác nhận</SelectItem>
              <SelectItem value="Processing">Đang xử lý</SelectItem>
              <SelectItem value="Shipped">Đang giao hàng</SelectItem>
              <SelectItem value="Delivered">Đã giao hàng</SelectItem>
              <SelectItem value="Cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal sm:w-[180px]",
                    !dateFrom && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Từ ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus locale={vi} />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal sm:w-[180px]",
                    !dateTo && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy") : "Đến ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                  locale={vi}
                  disabled={(date) => (dateFrom ? date < dateFrom : false)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Lọc</Button>
            {isFiltered && (
              <Button type="button" variant="outline" onClick={handleReset}>
                <X className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

