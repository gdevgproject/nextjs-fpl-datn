"use client"

import { useState } from "react"
import { Clock, Plus, Trash2, Save, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const daysOfWeek = [
  { id: "monday", name: "Thứ Hai" },
  { id: "tuesday", name: "Thứ Ba" },
  { id: "wednesday", name: "Thứ Tư" },
  { id: "thursday", name: "Thứ Năm" },
  { id: "friday", name: "Thứ Sáu" },
  { id: "saturday", name: "Thứ Bảy" },
  { id: "sunday", name: "Chủ Nhật" },
]

type BusinessHour = {
  day: string
  open: boolean
  openTime: string
  closeTime: string
}

export function ShopBusinessHours() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showBusinessHours, setShowBusinessHours] = useState<boolean>(true)
  const [specialNotes, setSpecialNotes] = useState<string>("Cửa hàng đóng cửa vào các ngày lễ lớn.")
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([
    { day: "monday", open: true, openTime: "08:00", closeTime: "20:00" },
    { day: "tuesday", open: true, openTime: "08:00", closeTime: "20:00" },
    { day: "wednesday", open: true, openTime: "08:00", closeTime: "20:00" },
    { day: "thursday", open: true, openTime: "08:00", closeTime: "20:00" },
    { day: "friday", open: true, openTime: "08:00", closeTime: "20:00" },
    { day: "saturday", open: true, openTime: "09:00", closeTime: "18:00" },
    { day: "sunday", open: false, openTime: "09:00", closeTime: "18:00" },
  ])
  const [specialDates, setSpecialDates] = useState<Array<{ date: string; open: boolean; note: string }>>([
    { date: "2023-12-25", open: false, note: "Đóng cửa - Giáng sinh" },
    { date: "2024-01-01", open: false, note: "Đóng cửa - Năm mới" },
  ])
  const { toast } = useToast()

  const handleBusinessHourChange = (index: number, field: keyof BusinessHour, value: string | boolean) => {
    const newHours = [...businessHours]
    newHours[index] = { ...newHours[index], [field]: value }
    setBusinessHours(newHours)
  }

  const handleSpecialDateChange = (index: number, field: keyof (typeof specialDates)[0], value: string | boolean) => {
    const newDates = [...specialDates]
    newDates[index] = { ...newDates[index], [field]: value }
    setSpecialDates(newDates)
  }

  const handleAddSpecialDate = () => {
    setSpecialDates([...specialDates, { date: "", open: false, note: "" }])
  }

  const handleRemoveSpecialDate = (index: number) => {
    const newDates = [...specialDates]
    newDates.splice(index, 1)
    setSpecialDates(newDates)
  }

  const handleSaveBusinessHours = () => {
    setIsLoading(true)

    // Giả lập API call
    setTimeout(() => {
      console.log("Business hours:", businessHours)
      console.log("Special dates:", specialDates)
      console.log("Show business hours:", showBusinessHours)
      console.log("Special notes:", specialNotes)
      setIsLoading(false)
      toast({
        title: "Cập nhật thành công",
        description: "Giờ làm việc đã được cập nhật",
      })
    }, 1000)
  }

  const getDayName = (dayId: string) => {
    const day = daysOfWeek.find((d) => d.id === dayId)
    return day ? day.name : dayId
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Giờ làm việc</CardTitle>
        <CardDescription>Cập nhật giờ làm việc của cửa hàng</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Hiển thị giờ làm việc</Label>
            <p className="text-sm text-muted-foreground">Hiển thị giờ làm việc trên website</p>
          </div>
          <Switch checked={showBusinessHours} onCheckedChange={setShowBusinessHours} />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Giờ làm việc hàng ngày
          </h3>

          <div className="space-y-4">
            {businessHours.map((hour, index) => (
              <div key={index} className="grid gap-4 sm:grid-cols-12 items-center">
                <div className="sm:col-span-3">
                  <p className="font-medium">{getDayName(hour.day)}</p>
                </div>
                <div className="sm:col-span-2">
                  <Switch
                    checked={hour.open}
                    onCheckedChange={(value) => handleBusinessHourChange(index, "open", value)}
                  />
                  <span className="ml-2 text-sm">{hour.open ? "Mở cửa" : "Đóng cửa"}</span>
                </div>
                {hour.open && (
                  <>
                    <div className="sm:col-span-3">
                      <Label className="sr-only">Giờ mở cửa</Label>
                      <Input
                        type="time"
                        value={hour.openTime}
                        onChange={(e) => handleBusinessHourChange(index, "openTime", e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-1 text-center">đến</div>
                    <div className="sm:col-span-3">
                      <Label className="sr-only">Giờ đóng cửa</Label>
                      <Input
                        type="time"
                        value={hour.closeTime}
                        onChange={(e) => handleBusinessHourChange(index, "closeTime", e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Ngày đặc biệt</h3>

          {specialDates.map((date, index) => (
            <div key={index} className="grid gap-4 sm:grid-cols-12 items-end">
              <div className="sm:col-span-3">
                <Label>Ngày</Label>
                <Input
                  type="date"
                  value={date.date}
                  onChange={(e) => handleSpecialDateChange(index, "date", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center h-10">
                  <Switch
                    checked={date.open}
                    onCheckedChange={(value) => handleSpecialDateChange(index, "open", value)}
                  />
                  <span className="ml-2 text-sm">{date.open ? "Mở cửa" : "Đóng cửa"}</span>
                </div>
              </div>
              <div className="sm:col-span-6">
                <Label>Ghi chú</Label>
                <Input
                  placeholder="Ví dụ: Đóng cửa - Lễ Quốc Khánh"
                  value={date.note}
                  onChange={(e) => handleSpecialDateChange(index, "note", e.target.value)}
                />
              </div>
              <div className="sm:col-span-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSpecialDate(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={handleAddSpecialDate}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm ngày đặc biệt
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Ghi chú đặc biệt</Label>
          <Textarea
            placeholder="Nhập ghi chú về giờ làm việc (ví dụ: đóng cửa vào các ngày lễ)"
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            className="resize-none"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Ghi chú này sẽ được hiển thị cùng với giờ làm việc trên website.
          </p>
        </div>

        <Button onClick={handleSaveBusinessHours} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

