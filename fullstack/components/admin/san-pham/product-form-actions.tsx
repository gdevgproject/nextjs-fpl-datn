import { Save, ArrowLeft, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"

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

interface ProductFormActionsProps {
  productId?: string
  isSaving: boolean
  isValid: boolean
}

export function ProductFormActions({ productId, isSaving, isValid }: ProductFormActionsProps) {
  return (
    <div className="flex flex-col-reverse justify-between gap-2 sm:flex-row sm:items-center">
      <Button variant="outline" asChild>
        <Link href="/admin/san-pham">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Link>
      </Button>

      <div className="flex flex-col gap-2 sm:flex-row">
        {productId && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa sản phẩm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xóa sản phẩm</DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Hủy</Button>
                <Button variant="destructive">Xóa sản phẩm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Button type="submit" disabled={isSaving || !isValid}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {productId ? "Đang cập nhật..." : "Đang tạo..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {productId ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

