"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Copy,
  Edit,
  MoreHorizontal,
  Trash2,
  Eye,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  PlusCircle,
} from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DiscountCodeDeleteDialog } from "@/components/admin/ma-giam-gia/discount-code-delete-dialog"
import { DiscountCodeQuickViewDialog } from "@/components/admin/ma-giam-gia/discount-code-quick-view-dialog"
import { DiscountCodeAnalyticsDialog } from "@/components/admin/ma-giam-gia/discount-code-analytics-dialog"
import { useMediaQuery } from "@/hooks/use-media-query"

// Mẫu dữ liệu mã giảm giá
const discountCodesData = [
  {
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
  },
  {
    id: "2",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    min_purchase_amount: 300000,
    max_discount_amount: 100000,
    usage_limit: 1000,
    usage_count: 89,
    start_date: "2023-01-01T00:00:00Z",
    end_date: "2023-12-31T23:59:59Z",
    is_active: true,
    status: "active",
    description: "Mã giảm giá chào mừng khách hàng mới",
    created_at: "2023-01-01T08:00:00Z",
  },
  {
    id: "3",
    code: "FALL50K",
    type: "fixed",
    value: 50000,
    min_purchase_amount: 500000,
    max_discount_amount: null,
    usage_limit: 200,
    usage_count: 0,
    start_date: "2023-09-15T00:00:00Z",
    end_date: "2023-11-15T23:59:59Z",
    is_active: true,
    status: "scheduled",
    description: "Giảm 50K cho mùa thu",
    created_at: "2023-08-20T14:30:00Z",
  },
  {
    id: "4",
    code: "SPRING2023",
    type: "percentage",
    value: 20,
    min_purchase_amount: 1000000,
    max_discount_amount: 300000,
    usage_limit: 150,
    usage_count: 150,
    start_date: "2023-03-01T00:00:00Z",
    end_date: "2023-05-31T23:59:59Z",
    is_active: false,
    status: "expired",
    description: "Giảm giá mùa xuân 2023",
    created_at: "2023-02-15T09:00:00Z",
  },
  {
    id: "5",
    code: "BLACKFRIDAY",
    type: "percentage",
    value: 30,
    min_purchase_amount: 1500000,
    max_discount_amount: 500000,
    usage_limit: 300,
    usage_count: 22,
    start_date: "2023-11-24T00:00:00Z",
    end_date: "2023-11-27T23:59:59Z",
    is_active: true,
    status: "scheduled",
    description: "Giảm giá Black Friday",
    created_at: "2023-10-30T11:00:00Z",
  },
  {
    id: "6",
    code: "FREESHIP",
    type: "shipping",
    value: 100,
    min_purchase_amount: 300000,
    max_discount_amount: null,
    usage_limit: 500,
    usage_count: 123,
    start_date: "2023-01-01T00:00:00Z",
    end_date: "2023-12-31T23:59:59Z",
    is_active: true,
    status: "active",
    description: "Miễn phí vận chuyển",
    created_at: "2023-01-01T08:30:00Z",
  },
]

interface DiscountCodeListProps {
  status: "all" | "active" | "scheduled" | "expired"
  selectedItems: string[]
  onSelectionChange: (items: string[]) => void
}

export function DiscountCodeList({ status, selectedItems, onSelectionChange }: DiscountCodeListProps) {
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showQuickViewDialog, setShowQuickViewDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [selectedDiscountCode, setSelectedDiscountCode] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Lọc dữ liệu dựa trên trạng thái
  const filteredData = status === "all" ? discountCodesData : discountCodesData.filter((item) => item.status === status)

  const handleToggleActive = async (id: string, currentState: boolean) => {
    setIsProcessing(true)

    try {
      // Giả lập xử lý backend
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: currentState ? "Đã vô hiệu hóa mã giảm giá" : "Đã kích hoạt mã giảm giá",
        description: `Mã giảm giá đã được ${currentState ? "vô hiệu hóa" : "kích hoạt"} thành công.`,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `Có lỗi xảy ra khi ${currentState ? "vô hiệu hóa" : "kích hoạt"} mã giảm giá. Vui lòng thử lại.`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)

    toast({
      title: "Đã sao chép",
      description: `Mã "${code}" đã được sao chép vào clipboard.`,
    })
  }

  const handleDelete = async () => {
    if (!selectedDiscountCode) return

    setIsProcessing(true)

    try {
      // Giả lập xử lý backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Đã xóa mã giảm giá",
        description: "Mã giảm giá đã được xóa thành công.",
      })

      // Cập nhật danh sách đã chọn
      if (selectedItems.includes(selectedDiscountCode)) {
        onSelectionChange(selectedItems.filter((id) => id !== selectedDiscountCode))
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa mã giảm giá. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setShowDeleteDialog(false)
      setSelectedDiscountCode(null)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(filteredData.map((item) => item.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, id])
    } else {
      onSelectionChange(selectedItems.filter((item) => item !== id))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Đang hoạt động
          </Badge>
        )
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="mr-1 h-3 w-3" />
            Lên lịch
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Hết hạn
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <XCircle className="mr-1 h-3 w-3" />
            Vô hiệu
          </Badge>
        )
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

  if (filteredData.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <AlertCircle className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Không có mã giảm giá</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {status === "all"
            ? "Bạn chưa tạo mã giảm giá nào. Hãy tạo mã giảm giá đầu tiên."
            : status === "active"
              ? "Không có mã giảm giá nào đang hoạt động."
              : status === "scheduled"
                ? "Không có mã giảm giá nào được lên lịch."
                : "Không có mã giảm giá nào đã hết hạn."}
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/ma-giam-gia/them">
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm mã giảm giá
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedItems.length > 0 && filteredData.every((item) => selectedItems.includes(item.id))}
                  onCheckedChange={handleSelectAll}
                  aria-label="Chọn tất cả"
                />
              </TableHead>
              <TableHead className="min-w-[150px]">Mã giảm giá</TableHead>
              {!isMobile && <TableHead>Giá trị</TableHead>}
              {!isMobile && <TableHead>Điều kiện</TableHead>}
              <TableHead>Thời hạn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(discount.id)}
                    onCheckedChange={(checked) => handleSelectItem(discount.id, checked as boolean)}
                    aria-label={`Chọn mã ${discount.code}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{discount.code}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyCode(discount.code)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span className="sr-only">Sao chép mã</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sao chép mã</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-xs text-muted-foreground">{discount.description}</span>
                    {isMobile && (
                      <span className="mt-1 text-xs">{getDiscountValue(discount.type, discount.value)}</span>
                    )}
                  </div>
                </TableCell>
                {!isMobile && <TableCell>{getDiscountValue(discount.type, discount.value)}</TableCell>}
                {!isMobile && (
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs">
                        Tối thiểu:{" "}
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                          discount.min_purchase_amount,
                        )}
                      </span>
                      {discount.max_discount_amount && (
                        <span className="text-xs">
                          Tối đa:{" "}
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                            discount.max_discount_amount,
                          )}
                        </span>
                      )}
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs">
                      Từ: {format(new Date(discount.start_date), "dd/MM/yyyy", { locale: vi })}
                    </span>
                    <span className="text-xs">
                      Đến: {format(new Date(discount.end_date), "dd/MM/yyyy", { locale: vi })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(discount.status)}
                    <div className="flex items-center">
                      <Switch
                        checked={discount.is_active}
                        onCheckedChange={(checked) => handleToggleActive(discount.id, discount.is_active)}
                        disabled={isProcessing}
                        aria-label={`${discount.is_active ? "Vô hiệu hóa" : "Kích hoạt"} mã ${discount.code}`}
                      />
                      <span className="ml-2 text-xs">{discount.is_active ? "Đang bật" : "Đã tắt"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Mở menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedDiscountCode(discount.id)
                          setShowQuickViewDialog(true)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Xem nhanh</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedDiscountCode(discount.id)
                          setShowAnalyticsDialog(true)
                        }}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Phân tích</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/ma-giam-gia/${discount.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Chỉnh sửa</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedDiscountCode(discount.id)
                          setShowDeleteDialog(true)
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Xóa</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DiscountCodeDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDelete={handleDelete}
        isDeleting={isProcessing}
      />

      <DiscountCodeQuickViewDialog
        open={showQuickViewDialog}
        onOpenChange={setShowQuickViewDialog}
        discountCodeId={selectedDiscountCode}
      />

      <DiscountCodeAnalyticsDialog
        open={showAnalyticsDialog}
        onOpenChange={setShowAnalyticsDialog}
        discountCodeId={selectedDiscountCode}
      />
    </>
  )
}

