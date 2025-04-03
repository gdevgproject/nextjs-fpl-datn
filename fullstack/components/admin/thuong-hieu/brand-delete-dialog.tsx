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

interface BrandDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand: {
    id: string
    name: string
    productCount?: number
  } | null
}

export function BrandDeleteDialog({ open, onOpenChange, brand }: BrandDeleteDialogProps) {
  const router = useRouter()

  const handleDelete = () => {
    if (!brand) return

    // Xử lý xóa thương hiệu ở đây
    console.log("Deleting brand:", brand)

    // Đóng dialog
    onOpenChange(false)

    // Refresh trang
    router.refresh()
  }

  if (!brand) return null

  const hasProducts = brand.productCount && brand.productCount > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa thương hiệu</AlertDialogTitle>
          <AlertDialogDescription>
            {hasProducts ? (
              <>
                <p>
                  Thương hiệu "{brand.name}" đang có {brand.productCount} sản phẩm. Bạn cần xóa hoặc chuyển các sản phẩm
                  này sang thương hiệu khác trước khi xóa thương hiệu.
                </p>
              </>
            ) : (
              <>Bạn có chắc chắn muốn xóa thương hiệu "{brand.name}"? Hành động này không thể hoàn tác.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={hasProducts}>
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

