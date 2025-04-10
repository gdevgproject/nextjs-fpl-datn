"use client"

import { useState } from "react"
import { Trash2, Copy, ArrowUpDown, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ProductVariantBulkActionsProps {
  selectedCount: number
  onDelete: () => void
  onDuplicate?: () => void
  onUpdateStock?: () => void
}

export function ProductVariantBulkActions({
  selectedCount,
  onDelete,
  onDuplicate,
  onUpdateStock,
}: ProductVariantBulkActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{selectedCount} đã chọn</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onDuplicate && (
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Sao chép biến thể
            </DropdownMenuItem>
          )}
          {onUpdateStock && (
            <DropdownMenuItem onClick={onUpdateStock}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Cập nhật tồn kho
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa biến thể
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xóa biến thể</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xóa {selectedCount} biến thể đã chọn không?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-destructive/10 p-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-destructive mr-2" />
                <h4 className="text-sm font-medium text-destructive">Cảnh báo</h4>
              </div>
              <div className="mt-2 text-sm text-destructive">
                Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến các biến thể này sẽ bị xóa vĩnh viễn.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete()
                setIsDeleteDialogOpen(false)
              }}
            >
              Xóa {selectedCount} biến thể
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

