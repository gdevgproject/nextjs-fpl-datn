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

interface ProductLabelDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  labelId: string | null
}

export function ProductLabelDeleteDialog({ open, onOpenChange, labelId }: ProductLabelDeleteDialogProps) {
  const router = useRouter()

  const handleDelete = () => {
    if (!labelId) return

    // Xử lý xóa nhãn sản phẩm ở đây
    console.log("Deleting product label:", labelId)

    // Đóng dialog
    onOpenChange(false)

    // Refresh trang
    router.refresh()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa nhãn sản phẩm</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa nhãn sản phẩm này? Hành động này sẽ gỡ bỏ nhãn khỏi tất cả sản phẩm đang được gắn.
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

