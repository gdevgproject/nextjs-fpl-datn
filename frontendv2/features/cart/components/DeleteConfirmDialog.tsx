"use client"

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

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteConfirmDialog({ open, onOpenChange, onConfirm }: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader className="gap-2">
          <AlertDialogTitle className="text-center">Thông báo</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Bạn chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 sm:gap-0">
          <AlertDialogCancel className="m-0 w-full">Đóng</AlertDialogCancel>
          <AlertDialogAction className="m-0 w-full bg-blue-600 hover:bg-blue-700" onClick={onConfirm}>
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

