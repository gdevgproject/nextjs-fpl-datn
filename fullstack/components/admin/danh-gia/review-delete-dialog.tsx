"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface ReviewDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reviewId: string
}

export function ReviewDeleteDialog({ open, onOpenChange, reviewId }: ReviewDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [notifyCustomer, setNotifyCustomer] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = async () => {
    if (!reviewId || !confirmDelete) return

    setIsDeleting(true)

    try {
      // Xử lý xóa đánh giá (sẽ được thêm logic sau)
      console.log("Deleting review:", reviewId, { notifyCustomer })

      // Giả lập xử lý backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Đã xóa đánh giá",
        description: "Đánh giá đã được xóa thành công.",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa đánh giá. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Xác nhận xóa đánh giá</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn đánh giá khỏi
            hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify-customer"
              checked={notifyCustomer}
              onCheckedChange={(checked) => setNotifyCustomer(checked as boolean)}
              disabled={isDeleting}
            />
            <Label htmlFor="notify-customer">Gửi email thông báo cho khách hàng</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-delete"
              checked={confirmDelete}
              onCheckedChange={(checked) => setConfirmDelete(checked as boolean)}
              disabled={isDeleting}
            />
            <Label htmlFor="confirm-delete" className="font-medium">
              Tôi hiểu rằng hành động này không thể hoàn tác
            </Label>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting || !confirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Đang xóa..." : "Xóa đánh giá"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

