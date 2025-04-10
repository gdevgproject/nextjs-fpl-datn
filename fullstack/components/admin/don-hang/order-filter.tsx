"use client"

import { useState } from "react"
import { CalendarIcon, Filter } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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

export default function OrderFilter() {
  const [open, setOpen] = useState(false)
  const [orderStatus, setOrderStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [sortBy, setSortBy] = useState("newest")

  const handleApplyFilter = () => {
    // Xử lý lọc ở đây
    console.log({
      orderStatus,
      paymentStatus,
      paymentMethod,
      dateFrom,
      dateTo,
      sortBy,
    })
    setOpen(false)
  }

  const handleResetFilter = () => {
    setOrderStatus("")
    setPaymentStatus("")
    setPaymentMethod("")
    setDateFrom(undefined)
    setDateTo(undefined)
    setSortBy("newest")
  }

  return (
    <div className="flex items-center space-x-2">
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sắp xếp theo" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Lọc
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Lọc đơn hàng</SheetTitle>
            <SheetDescription>Lọc đơn hàng theo các tiêu chí bên dưới</SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderStatus">Trạng thái đơn hàng</Label>
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
              <Label htmlFor="paymentStatus">Trạng thái thanh toán</Label>
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
              <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
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
              <Label>Thời gian đặt hàng</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom" className="text-xs">
                    Từ ngày
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="dateFrom"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo" className="text-xs">
                    Đến ngày
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="dateTo"
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={handleResetFilter}>
              Đặt lại
            </Button>
            <Button onClick={handleApplyFilter}>Áp dụng</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

