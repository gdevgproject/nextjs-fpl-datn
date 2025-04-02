"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

interface BannerFilterProps {
  onClose?: () => void
}

export function BannerFilter({ onClose }: BannerFilterProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [status, setStatus] = useState<string>("all")
  const [showActive, setShowActive] = useState(true)
  const [showInactive, setShowInactive] = useState(true)
  const [showScheduled, setShowScheduled] = useState(true)
  const [showExpired, setShowExpired] = useState(true)
  const [impressionRange, setImpressionRange] = useState([0, 50000])
  const [clickRange, setClickRange] = useState([0, 5000])

  const handleApplyFilter = () => {
    // Implement filter logic here
    console.log({
      startDate,
      endDate,
      status,
      showActive,
      showInactive,
      showScheduled,
      showExpired,
      impressionRange,
      clickRange,
    })

    if (onClose) onClose()
  }

  const handleResetFilter = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setStatus("all")
    setShowActive(true)
    setShowInactive(true)
    setShowScheduled(true)
    setShowExpired(true)
    setImpressionRange([0, 50000])
    setClickRange([0, 5000])
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Lọc banner</h4>

      <div className="space-y-2">
        <Label htmlFor="status">Trạng thái</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="inactive">Không hoạt động</SelectItem>
            <SelectItem value="scheduled">Đã lên lịch</SelectItem>
            <SelectItem value="expired">Đã hết hạn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Hiển thị</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-active" className="cursor-pointer">
              Đang hoạt động
            </Label>
            <Switch id="show-active" checked={showActive} onCheckedChange={setShowActive} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-inactive" className="cursor-pointer">
              Không hoạt động
            </Label>
            <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-scheduled" className="cursor-pointer">
              Đã lên lịch
            </Label>
            <Switch id="show-scheduled" checked={showScheduled} onCheckedChange={setShowScheduled} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-expired" className="cursor-pointer">
              Đã hết hạn
            </Label>
            <Switch id="show-expired" checked={showExpired} onCheckedChange={setShowExpired} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Thời gian bắt đầu</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Thời gian kết thúc</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Lượt hiển thị</Label>
          <span className="text-xs text-muted-foreground">
            {impressionRange[0].toLocaleString()} - {impressionRange[1].toLocaleString()}
          </span>
        </div>
        <Slider defaultValue={impressionRange} max={50000} step={1000} onValueChange={setImpressionRange} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Lượt nhấp chuột</Label>
          <span className="text-xs text-muted-foreground">
            {clickRange[0].toLocaleString()} - {clickRange[1].toLocaleString()}
          </span>
        </div>
        <Slider defaultValue={clickRange} max={5000} step={100} onValueChange={setClickRange} />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={handleResetFilter}>
          Đặt lại
        </Button>
        <Button onClick={handleApplyFilter}>Áp dụng</Button>
      </div>
    </div>
  )
}

