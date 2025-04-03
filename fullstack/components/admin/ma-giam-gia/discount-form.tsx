"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"

interface DiscountFormProps {
  id?: string
}

// Mock data for edit mode
const discountData = {
  id: "1",
  code: "SUMMER2023",
  description: "Giảm giá mùa hè 2023",
  discount_percentage: 15,
  max_discount_amount: 200000,
  min_order_value: 500000,
  max_uses: 100,
  remaining_uses: 45,
  start_date: new Date("2023-06-01"),
  end_date: new Date("2023-08-31"),
  is_active: true,
}

export function DiscountForm({ id }: DiscountFormProps) {
  const router = useRouter()
  const isEditMode = !!id

  // Form state
  const [code, setCode] = useState(isEditMode ? discountData.code : "")
  const [description, setDescription] = useState(isEditMode ? discountData.description : "")
  const [discountPercentage, setDiscountPercentage] = useState(
    isEditMode ? discountData.discount_percentage.toString() : "",
  )
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(
    isEditMode ? discountData.max_discount_amount.toString() : "",
  )
  const [minOrderValue, setMinOrderValue] = useState(isEditMode ? discountData.min_order_value.toString() : "")
  const [maxUses, setMaxUses] = useState(isEditMode ? discountData.max_uses.toString() : "")
  const [startDate, setStartDate] = useState<Date | undefined>(isEditMode ? discountData.start_date : undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(isEditMode ? discountData.end_date : undefined)
  const [isActive, setIsActive] = useState(isEditMode ? discountData.is_active : true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Xử lý submit form ở đây
    console.log({
      code,
      description,
      discountPercentage,
      maxDiscountAmount,
      minOrderValue,
      maxUses,
      startDate,
      endDate,
      isActive,
    })

    // Chuyển hướng về trang danh sách
    router.push("/admin/ma-giam-gia")
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="col-span-1 sm:col-span-2">
                <Label htmlFor="code">
                  Mã giảm giá <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="Nhập mã giảm giá (VD: SUMMER2023)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1"
                  required
                />
                <p className="mt-1 text-sm text-muted-foreground">Mã giảm giá sẽ được hiển thị cho khách hàng</p>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Nhập mô tả mã giảm giá"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="discount_percentage">
                  Phần trăm giảm giá (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Nhập phần trăm giảm giá"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="max_discount_amount">Giảm tối đa (VNĐ)</Label>
                <Input
                  id="max_discount_amount"
                  type="number"
                  min="0"
                  placeholder="Nhập số tiền giảm tối đa"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-muted-foreground">Để trống nếu không giới hạn số tiền giảm</p>
              </div>

              <div>
                <Label htmlFor="min_order_value">
                  Giá trị đơn tối thiểu (VNĐ) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="min_order_value"
                  type="number"
                  min="0"
                  placeholder="Nhập giá trị đơn tối thiểu"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="max_uses">
                  Số lượt sử dụng tối đa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="max_uses"
                  type="number"
                  min="1"
                  placeholder="Nhập số lượt sử dụng tối đa"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label>
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>
                  Ngày kết thúc <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) =>
                        (startDate ? date < startDate : false) || date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="is_active">Kích hoạt mã giảm giá</Label>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Mã giảm giá sẽ chỉ có hiệu lực khi được kích hoạt</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/ma-giam-gia")}>
                Hủy
              </Button>
              <Button type="submit">{isEditMode ? "Cập nhật" : "Tạo mã giảm giá"}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

