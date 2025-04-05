"use client"

import { useState } from "react"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"

// Activity types based on database schema
const activityTypes = [
  { value: "all", label: "Tất cả loại hoạt động" },
  { value: "product_create", label: "Thêm sản phẩm" },
  { value: "product_update", label: "Cập nhật sản phẩm" },
  { value: "product_delete", label: "Xóa sản phẩm" },
  { value: "order_status_update", label: "Cập nhật trạng thái đơn hàng" },
  { value: "discount_create", label: "Tạo mã giảm giá" },
  { value: "discount_update", label: "Cập nhật mã giảm giá" },
  { value: "discount_delete", label: "Xóa mã giảm giá" },
  { value: "user_role_update", label: "Cập nhật quyền người dùng" },
  { value: "review_approve", label: "Duyệt đánh giá" },
  { value: "review_reject", label: "Từ chối đánh giá" },
  { value: "banner_create", label: "Thêm banner" },
  { value: "banner_update", label: "Cập nhật banner" },
  { value: "banner_delete", label: "Xóa banner" },
  { value: "category_create", label: "Thêm danh mục" },
  { value: "category_update", label: "Cập nhật danh mục" },
  { value: "category_delete", label: "Xóa danh mục" },
  { value: "brand_create", label: "Thêm thương hiệu" },
  { value: "brand_update", label: "Cập nhật thương hiệu" },
  { value: "brand_delete", label: "Xóa thương hiệu" },
  { value: "inventory_update", label: "Cập nhật tồn kho" },
]

// Admin users would be fetched from the database in a real implementation
const adminUsers = [
  { value: "all", label: "Tất cả người dùng" },
  { value: "1", label: "Admin" },
  { value: "2", label: "Nhân viên" },
]

export function ActivityLogFilterEnhanced() {
  const [activityType, setActivityType] = useState("all")
  const [adminUser, setAdminUser] = useState("all")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [activeFilters, setActiveFilters] = useState<{
    activityType: boolean
    adminUser: boolean
    date: boolean
  }>({
    activityType: false,
    adminUser: false,
    date: false,
  })

  const handleApplyFilter = () => {
    // Update active filters
    setActiveFilters({
      activityType: activityType !== "all",
      adminUser: adminUser !== "all",
      date: date !== undefined,
    })

    // Xử lý lọc (sẽ được triển khai sau)
    console.log("Filtering by:", { activityType, adminUser, date })
  }

  const handleResetFilter = () => {
    setActivityType("all")
    setAdminUser("all")
    setDate(undefined)
    setActiveFilters({
      activityType: false,
      adminUser: false,
      date: false,
    })
  }

  const handleRemoveFilter = (filter: keyof typeof activeFilters) => {
    if (filter === "activityType") {
      setActivityType("all")
      setActiveFilters((prev) => ({ ...prev, activityType: false }))
    } else if (filter === "adminUser") {
      setAdminUser("all")
      setActiveFilters((prev) => ({ ...prev, adminUser: false }))
    } else if (filter === "date") {
      setDate(undefined)
      setActiveFilters((prev) => ({ ...prev, date: false }))
    }
  }

  const getActivityTypeLabel = () => {
    return activityTypes.find((type) => type.value === activityType)?.label || ""
  }

  const getAdminUserLabel = () => {
    return adminUsers.find((user) => user.value === adminUser)?.label || ""
  }

  const hasActiveFilters = Object.values(activeFilters).some(Boolean)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger>
              <SelectValue placeholder="Loại hoạt động" />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Select value={adminUser} onValueChange={setAdminUser}>
            <SelectTrigger>
              <SelectValue placeholder="Người thực hiện" />
            </SelectTrigger>
            <SelectContent>
              {adminUsers.map((user) => (
                <SelectItem key={user.value} value={user.value}>
                  {user.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleApplyFilter} size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Button onClick={handleResetFilter} variant="outline" size="sm" disabled={!hasActiveFilters}>
            Đặt lại
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {activeFilters.activityType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Loại: {getActivityTypeLabel()}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleRemoveFilter("activityType")}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Xóa bộ lọc loại hoạt động</span>
              </Button>
            </Badge>
          )}
          {activeFilters.adminUser && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Người dùng: {getAdminUserLabel()}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleRemoveFilter("adminUser")}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Xóa bộ lọc người dùng</span>
              </Button>
            </Badge>
          )}
          {activeFilters.date && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Ngày: {format(date!, "dd/MM/yyyy", { locale: vi })}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleRemoveFilter("date")}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Xóa bộ lọc ngày</span>
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

