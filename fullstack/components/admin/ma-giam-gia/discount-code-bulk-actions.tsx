"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Trash2, Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
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

interface DiscountCodeBulkActionsProps {
  selectedCount: number
  onClearSelection: () => void
}

export function DiscountCodeBulkActions({ selectedCount, onClearSelection }: DiscountCodeBulkActionsProps) {
  const { toast } = useToast()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleActivate = async () => {
    setIsProcessing(true)

    try {
      // Giả lập xử lý backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Đã kích hoạt mã giảm giá",
        description: `${selectedCount} mã giảm giá đã được kích hoạt thành công.`,
      })

      onClearSelection()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi kích hoạt mã giảm giá. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeactivate = async () => {
    setIsProcessing(true)

    try {
      // Giả lập xử lý backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Đã vô hiệu hóa mã giảm giá",
        description: `${selectedCount} mã giảm giá đã được vô hiệu hóa thành công.`,
      })

      onClearSelection()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi vô hiệu hóa mã giảm giá. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async () => {
    setIsProcessing(true)

    try {
      // Giả lập xử lý backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Đã xuất mã giảm giá",
        description: `${selectedCount} mã giảm giá đã được xuất thành công.`,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xuất mã giảm giá. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    setIsProcessing(true)

    try {
      // Giả lập xử lý backend
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Đã xóa mã giảm giá",
        description: `${selectedCount} mã giảm giá đã được xóa thành công.`,
      })

      onClearSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa mã giảm giá. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between rounded-md border bg-muted/50 p-2 mt-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8 gap-1" disabled={isProcessing}>
            <X className="h-4 w-4" />
            <span>Bỏ chọn</span>
          </Button>
          <span className="text-sm">
            Đã chọn <strong>{selectedCount}</strong> mã giảm giá
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleActivate} className="h-8 gap-1" disabled={isProcessing}>
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Kích hoạt</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleDeactivate} className="h-8 gap-1" disabled={isProcessing}>
            <XCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Vô hiệu hóa</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleExport} className="h-8 gap-1" disabled={isProcessing}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="h-8 gap-1"
            disabled={isProcessing}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Xóa</span>
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa mã giảm giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedCount} mã giảm giá đã chọn? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Đang xóa..." : "Xóa mã giảm giá"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

