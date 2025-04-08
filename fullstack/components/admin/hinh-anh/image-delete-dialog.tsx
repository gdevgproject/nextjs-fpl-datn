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

interface ImageDeleteDialogProps {
  image: {
    id: string
    product_name: string
    alt_text: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageDeleteDialog({ image, open, onOpenChange }: ImageDeleteDialogProps) {
  const handleDelete = () => {
    // Xử lý xóa hình ảnh (sẽ được thêm sau)
    console.log(`Deleting image with ID: ${image.id}`)

    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
          <AlertDialogDescription>
            Hình ảnh "{image.alt_text || "Không có mô tả"}" của sản phẩm "{image.product_name}" sẽ bị xóa vĩnh viễn.
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

