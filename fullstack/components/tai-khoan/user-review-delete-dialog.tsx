"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Trash2 } from "lucide-react"

interface UserReviewDeleteDialogProps {
  reviewId: number
  productName: string
  onDelete: (reviewId: number) => void
}

export function UserReviewDeleteDialog({ reviewId, productName, onDelete }: UserReviewDeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Gọi callback để cập nhật UI
      onDelete(reviewId)

      // Đóng dialog
      setIsOpen(false)

      // Hiển thị thông báo thành công
      toast({
        title: "Đã xóa đánh giá",
        description: `Đánh giá của bạn về "${productName}" đã được xóa thành công.`,
      })
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi xóa đánh giá. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Xóa đánh giá</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa đánh giá</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa đánh giá về sản phẩm "{productName}"? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa
              </>
            ) : (
              "Xóa đánh giá"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

