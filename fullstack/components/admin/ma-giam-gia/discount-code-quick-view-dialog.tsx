"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Copy, X } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface DiscountCodeQuickViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  discountCodeId: string | null
}

// Mẫu dữ liệu chi tiết mã giảm giá
const discountCodeDetails = {
  id: "1",
  code: "SUMMER2023",
  type: "percentage",
  value: 15,
  min_purchase_amount: 500000,
  max_discount_amount: 200000,
  usage_limit: 100,
  usage_count: 45,
  start_date: "2023-06-01T00:00:00Z",
  end_date: "2023-08-31T23:59:59Z",
  is_active: true,
  status: "active",
  description: "Giảm giá mùa hè 2023",
  created_at: "2023-05-15T10:00:00Z",
  updated_at: "2023-05-16T08:30:00Z",
  created_by: "Admin",
  applies_to: "all",
  excluded_products: [],
  excluded_categories: [],
  customer_eligibility: "all",
  usage_limit_per_customer: 1,
}

export function DiscountCodeQuickViewDialog({ open, onOpenChange, discountCodeId }: DiscountCodeQuickViewDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [discountCode, setDiscountCode] = useState<any>(null)

  useEffect(() => {
    if (open && discountCodeId) {
      setIsLoading(true)

      // Giả lập tải dữ liệu
      const loadData = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setDiscountCode(discountCodeDetails)
        setIsLoading(false)
      }

      loadData()
    } else {
      setDiscountCode(null)
    }
  }, [open, discountCodeId])

  const handleCopyCode = () => {
    if (discountCode) {
      navigator.clipboard.writeText(discountCode.code)

      toast({
        title: "Đã sao chép",
        description: `Mã "${discountCode.code}" đã được sao chép vào clipboard.`,
      })
    }
  }

  const getDiscountValue = (type: string, value: number) => {
    switch (type) {
      case "percentage":
        return `${value}%`
      case "fixed":
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
      case "shipping":
        return value === 100 ? "Miễn phí vận chuyển" : `${value}% phí vận chuyển`
      default:
        return `${value}`
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Đang hoạt động
          </Badge>
        )
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Lên lịch
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Hết hạn
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Vô hiệu
          </Badge>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết mã giảm giá</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 absolute right-4 top-4"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Đóng</span>
            </Button>
          </DialogTitle>
          <DialogDescription>Xem thông tin chi tiết về mã giảm giá</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        ) : discountCode ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{discountCode.code}</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Sao chép mã</span>
                </Button>
              </div>
              {getStatusBadge(discountCode.status)}
            </div>

            <p className="text-sm text-muted-foreground">{discountCode.description}</p>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Loại giảm giá</p>
                <p className="text-muted-foreground">
                  {discountCode.type === "percentage"
                    ? "Phần trăm"
                    : discountCode.type === "fixed"
                      ? "Số tiền cố định"
                      : "Miễn phí vận chuyển"}
                </p>
              </div>

              <div>
                <p className="font-medium">Giá trị</p>
                <p className="text-muted-foreground">{getDiscountValue(discountCode.type, discountCode.value)}</p>
              </div>

              <div>
                <p className="font-medium">Đơn hàng tối thiểu</p>
                <p className="text-muted-foreground">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                    discountCode.min_purchase_amount,
                  )}
                </p>
              </div>

              <div>
                <p className="font-medium">Giảm giá tối đa</p>
                <p className="text-muted-foreground">
                  {discountCode.max_discount_amount
                    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        discountCode.max_discount_amount,
                      )
                    : "Không giới hạn"}
                </p>
              </div>

              <div>
                <p className="font-medium">Thời gian bắt đầu</p>
                <p className="text-muted-foreground">
                  {format(new Date(discountCode.start_date), "HH:mm 'ngày' dd/MM/yyyy", { locale: vi })}
                </p>
              </div>

              <div>
                <p className="font-medium">Thời gian kết thúc</p>
                <p className="text-muted-foreground">
                  {format(new Date(discountCode.end_date), "HH:mm 'ngày' dd/MM/yyyy", { locale: vi })}
                </p>
              </div>

              <div>
                <p className="font-medium">Giới hạn sử dụng</p>
                <p className="text-muted-foreground">{discountCode.usage_limit} lần</p>
              </div>

              <div>
                <p className="font-medium">Đã sử dụng</p>
                <p className="text-muted-foreground">
                  {discountCode.usage_count} lần (
                  {Math.round((discountCode.usage_count / discountCode.usage_limit) * 100)}%)
                </p>
              </div>

              <div>
                <p className="font-medium">Giới hạn mỗi khách hàng</p>
                <p className="text-muted-foreground">{discountCode.usage_limit_per_customer} lần</p>
              </div>

              <div>
                <p className="font-medium">Áp dụng cho</p>
                <p className="text-muted-foreground">
                  {discountCode.applies_to === "all" ? "Tất cả sản phẩm" : "Sản phẩm được chọn"}
                </p>
              </div>

              <div>
                <p className="font-medium">Đối tượng khách hàng</p>
                <p className="text-muted-foreground">
                  {discountCode.customer_eligibility === "all" ? "Tất cả khách hàng" : "Khách hàng được chọn"}
                </p>
              </div>

              <div>
                <p className="font-medium">Ngày tạo</p>
                <p className="text-muted-foreground">
                  {format(new Date(discountCode.created_at), "dd/MM/yyyy", { locale: vi })}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button asChild>
                <a href={`/admin/ma-giam-gia/${discountCode.id}`}>Xem chi tiết</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-muted-foreground">Không tìm thấy thông tin mã giảm giá</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

