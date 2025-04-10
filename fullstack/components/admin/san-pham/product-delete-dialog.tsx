"use client"

import { useState } from "react"
import { Trash2, AlertTriangle } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProductDeleteDialogProps {
  productId: string
  productName: string
  productCode: string
  variant?: "button" | "icon"
  onDelete?: () => void
}

export function ProductDeleteDialog({
  productId,
  productName,
  productCode,
  variant = "button",
  onDelete,
}: ProductDeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => {
    setIsDeleting(true)

    // Giả lập xóa sản phẩm
    setTimeout(() => {
      setIsDeleting(false)
      setOpen(false)
      setConfirmText("")

      if (onDelete) {
        onDelete()
      } else {
        // Hiển thị thông báo thành công
        alert(`Đã xóa sản phẩm: ${productName}`)
      }
    }, 1000)
  }

  const isConfirmValid = confirmText === productCode

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "button" ? (
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa sản phẩm
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa sản phẩm</DialogTitle>
          <DialogDescription>
            Hành động này sẽ xóa sản phẩm khỏi hệ thống. Sản phẩm sẽ không còn hiển thị trên trang web.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-700">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div className="text-sm">
              <p>Cảnh báo: Hành động này không thể hoàn tác.</p>
              <p>Tất cả dữ liệu liên quan đến sản phẩm này sẽ bị xóa.</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm text-muted-foreground">Thông tin sản phẩm:</p>
            <p className="font-medium">{productName}</p>
            <p className="text-sm text-muted-foreground">Mã sản phẩm: {productCode}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete">Nhập mã sản phẩm để xác nhận xóa</Label>
            <Input
              id="confirm-delete"
              placeholder={`Nhập "${productCode}" để xác nhận`}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Nhập chính xác mã sản phẩm "{productCode}" để xác nhận xóa.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={!isConfirmValid || isDeleting}>
            {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

