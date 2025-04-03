"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ProductLabelDatePickerProps {
  selectedDate: Date | null
  onSelect: (date: Date | null) => void
  onClose: () => void
}

export function ProductLabelDatePicker({ selectedDate, onSelect, onClose }: ProductLabelDatePickerProps) {
  const [date, setDate] = useState<Date | null>(selectedDate)

  const handleSave = () => {
    onSelect(date)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đặt thời hạn hiển thị nhãn</DialogTitle>
          <DialogDescription>
            Chọn ngày kết thúc hiển thị nhãn. Để trống nếu muốn hiển thị không giới hạn.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex flex-col space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày kết thúc"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date || undefined}
                  onSelect={setDate}
                  initialFocus
                  locale={vi}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>

            {date && (
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal text-muted-foreground"
                onClick={() => setDate(null)}
              >
                <X className="mr-2 h-4 w-4" />
                Xóa thời hạn (hiển thị không giới hạn)
              </Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

