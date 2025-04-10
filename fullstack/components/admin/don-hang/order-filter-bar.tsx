"use client"

import { useState } from "react"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const orderStatuses = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Chờ xử lý", value: "Pending" },
  { label: "Đang xử lý", value: "Processing" },
  { label: "Đang giao hàng", value: "Shipped" },
  { label: "Đã giao hàng", value: "Delivered" },
  { label: "Đã hủy", value: "Cancelled" },
]

const paymentStatuses = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Chờ thanh toán", value: "Pending" },
  { label: "Đã thanh toán", value: "Paid" },
  { label: "Thanh toán thất bại", value: "Failed" },
  { label: "Đã hoàn tiền", value: "Refunded" },
]

const paymentMethods = [
  { label: "Tất cả phương thức", value: "" },
  { label: "Thanh toán khi nhận hàng (COD)", value: "COD" },
  { label: "Chuyển khoản ngân hàng", value: "Banking" },
  { label: "Ví Momo", value: "Momo" },
  { label: "ZaloPay", value: "ZaloPay" },
  { label: "VNPay", value: "VNPay" },
]

const sortOptions = [
  { label: "Mới nhất", value: "newest" },
  { label: "Cũ nhất", value: "oldest" },
  { label: "Giá trị cao nhất", value: "highest" },
  { label: "Giá trị thấp nhất", value: "lowest" },
]

export default function OrderFilterBar() {
  const [orderStatus, setOrderStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [date, setDate] = useState<DateRange | undefined>()
  const [sortBy, setSortBy] = useState("newest")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")

  const hasActiveFilters = orderStatus || paymentStatus || paymentMethod || date || minAmount || maxAmount

  const handleResetFilters = () => {
    setOrderStatus("")
    setPaymentStatus("")
    setPaymentMethod("")
    setDate(undefined)
    setSortBy("newest")
    setMinAmount("")
    setMaxAmount("")
  }

  return (
    <div className="bg-muted/40 p-4 rounded-lg mb-4">
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <h3 className="text-sm font-medium mb-2 md:mb-0">Lọc đơn hàng</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters} className="self-start">
            <X className="h-4 w-4 mr-1" /> Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div className="space-y-2">
          <label htmlFor="orderStatus" className="text-sm font-medium">
            Trạng thái đơn hàng
          </label>
          <Select value={orderStatus} onValueChange={setOrderStatus}>
            <SelectTrigger id="orderStatus">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {orderStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="paymentStatus" className="text-sm font-medium">
            Trạng thái thanh toán
          </label>
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger id="paymentStatus">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {paymentStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="paymentMethod" className="text-sm font-medium">
            Phương thức thanh toán
          </label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger id="paymentMethod">
              <SelectValue placeholder="Chọn phương thức" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Khoảng thời gian</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
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
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label htmlFor="sortBy" className="text-sm font-medium">
            Sắp xếp theo
          </label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sortBy">
              <SelectValue placeholder="Chọn cách sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Khoảng giá trị đơn hàng</label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Giá trị tối thiểu"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full"
            />
            <span className="text-muted-foreground">đến</span>
            <Input
              type="number"
              placeholder="Giá trị tối đa"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-end space-x-2">
          <Button className="flex-1">Áp dụng bộ lọc</Button>
          <Button variant="outline" onClick={handleResetFilters}>
            Đặt lại
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {orderStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Trạng thái: {orderStatuses.find((s) => s.value === orderStatus)?.label}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => setOrderStatus("")}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {paymentStatus && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Thanh toán: {paymentStatuses.find((s) => s.value === paymentStatus)?.label}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => setPaymentStatus("")}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {paymentMethod && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Phương thức: {paymentMethods.find((m) => m.value === paymentMethod)?.label}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => setPaymentMethod("")}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {date && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Thời gian: {format(date.from as Date, "dd/MM/yyyy", { locale: vi })}
              {date.to && ` - ${format(date.to as Date, "dd/MM/yyyy", { locale: vi })}`}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => setDate(undefined)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {(minAmount || maxAmount) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Giá trị: {minAmount || "0"}đ - {maxAmount || "∞"}đ
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setMinAmount("")
                  setMaxAmount("")
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

