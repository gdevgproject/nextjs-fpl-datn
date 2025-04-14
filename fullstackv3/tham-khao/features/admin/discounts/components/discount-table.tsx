"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useDiscounts } from "../hooks/use-discounts"
import { useDeleteDiscount } from "../hooks/use-delete-discount"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatCurrency } from "@/shared/lib/utils"

interface DiscountTableProps {
  search: string
  onEdit: (discount: any) => void
}

export function DiscountTable({ search, onEdit }: DiscountTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [discountToDelete, setDiscountToDelete] = useState<any>(null)
  const toast = useSonnerToast()

  // Fetch discounts with pagination and search
  const { data, isLoading, isError } = useDiscounts({
    search,
  })

  const deleteMutation = useDeleteDiscount()

  const handleDeleteClick = (discount: any) => {
    setDiscountToDelete(discount)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!discountToDelete) return

    try {
      await deleteMutation.mutateAsync({ id: discountToDelete.id })
      toast.success("Mã giảm giá đã được xóa thành công")
    } catch (error) {
      toast.error(`Lỗi khi xóa mã giảm giá: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setDeleteDialogOpen(false)
      setDiscountToDelete(null)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return "Không giới hạn"
    return new Date(date).toLocaleDateString("vi-VN")
  }

  const getStatusBadge = (discount: any) => {
    const now = new Date()

    if (!discount.is_active) {
      return (
        <Badge variant="outline" className="bg-muted">
          Không hoạt động
        </Badge>
      )
    }

    if (discount.end_date && new Date(discount.end_date) < now) {
      return <Badge variant="destructive">Hết hạn</Badge>
    }

    if (discount.start_date && new Date(discount.start_date) > now) {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500">
          Sắp diễn ra
        </Badge>
      )
    }

    if (discount.remaining_uses !== null && discount.remaining_uses <= 0) {
      return <Badge variant="destructive">Hết lượt dùng</Badge>
    }

    return (
      <Badge variant="success" className="bg-green-500">
        Đang hoạt động
      </Badge>
    )
  }

  const getDiscountValue = (discount: any) => {
    if (discount.discount_percentage) {
      return `${discount.discount_percentage}%${discount.max_discount_amount ? ` (tối đa ${formatCurrency(discount.max_discount_amount)})` : ""}`
    } else if (discount.max_discount_amount) {
      return formatCurrency(discount.max_discount_amount)
    }
    return "Không xác định"
  }

  if (isLoading) {
    return <div className="text-center py-4">Đang tải...</div>
  }

  if (isError) {
    return <div className="text-center py-4 text-destructive">Đã xảy ra lỗi khi tải dữ liệu</div>
  }

  const discounts = data?.data || []

  if (discounts.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/10">
        <p className="text-muted-foreground">Không tìm thấy mã giảm giá nào</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã giảm giá</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Lượt sử dụng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell className="font-medium">{discount.code}</TableCell>
                <TableCell className="max-w-[200px] truncate">{discount.description || "—"}</TableCell>
                <TableCell>{getDiscountValue(discount)}</TableCell>
                <TableCell>
                  {discount.start_date || discount.end_date ? (
                    <span>
                      {formatDate(discount.start_date)} - {formatDate(discount.end_date)}
                    </span>
                  ) : (
                    "Không giới hạn"
                  )}
                </TableCell>
                <TableCell>
                  {discount.max_uses !== null ? (
                    <span>
                      {discount.remaining_uses !== null ? discount.remaining_uses : 0}/{discount.max_uses}
                    </span>
                  ) : (
                    "Không giới hạn"
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(discount)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Mở menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(discount)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(discount)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Mã giảm giá "{discountToDelete?.code}" sẽ bị xóa vĩnh viễn khỏi hệ
              thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
