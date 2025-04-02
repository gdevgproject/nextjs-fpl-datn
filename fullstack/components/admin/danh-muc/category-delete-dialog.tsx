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

interface CategoryDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: {
    id: string
    name: string
    productCount?: number
    hasChildren?: boolean
  } | null
}

export function CategoryDeleteDialog({ open, onOpenChange, category }: CategoryDeleteDialogProps) {
  const router = useRouter()

  const handleDelete = () => {
    if (!category) return

    // Xử lý xóa danh mục ở đây
    console.log("Deleting category:", category)

    // Đóng dialog
    onOpenChange(false)

    // Refresh trang
    router.refresh()
  }

  if (!category) return null

  const hasBlockingCondition = (category.productCount && category.productCount > 0) || category.hasChildren

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
          <AlertDialogDescription>
            {hasBlockingCondition ? (
              <>
                <p className="mb-2">Không thể xóa danh mục "{category.name}" vì:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {category.productCount && category.productCount > 0 && (
                    <li>Danh mục này đang có {category.productCount} sản phẩm</li>
                  )}
                  {category.hasChildren && <li>Danh mục này đang có danh mục con</li>}
                </ul>
                <p className="mt-2">
                  Vui lòng xóa hoặc chuyển các sản phẩm và danh mục con sang danh mục khác trước khi xóa danh mục này.
                </p>
              </>
            ) : (
              <>Bạn có chắc chắn muốn xóa danh mục "{category.name}"? Hành động này không thể hoàn tác.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={hasBlockingCondition}
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

