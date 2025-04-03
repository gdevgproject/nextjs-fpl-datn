"use client"

import { useRouter } from "next/navigation"

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

interface DiscountDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  discountId: string | null
}

export function DiscountDeleteDialog({ open, onOpenChange, discountId }: DiscountDeleteDialogProps) {
  const router = useRouter()

  const handleDelete = () => {
    if (!discountId) return

    // Xử lý xóa mã giảm giá ở đây
    console.log("Deleting discount:", discountId)

    // Đóng dialog
    onOpenChange(false)

    // Refresh trang
    router.refresh()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa mã giảm giá</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

