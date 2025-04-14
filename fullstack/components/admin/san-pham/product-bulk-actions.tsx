"use client"

import { useState } from "react"
import { X, Trash2, Copy, Tag, Archive, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProductBulkActionsProps {
  selectedCount: number
  onClearSelection: () => void
}

export function ProductBulkActions({ selectedCount, onClearSelection }: ProductBulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleBulkDelete = () => {
    // Xử lý xóa hàng loạt
    setShowDeleteDialog(false)
    onClearSelection()
  }

  return (
    <Card className="mb-4 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="font-medium">Đã chọn {selectedCount} sản phẩm</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Tag className="h-4 w-4 mr-2" />
              Gắn nhãn
            </Button>

            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Nhân bản
            </Button>

            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4 mr-2" />
              Lưu trữ
            </Button>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa sản phẩm hàng loạt</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa {selectedCount} sản phẩm đã chọn? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
                    Xác nhận xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="ghost" size="icon" onClick={onClearSelection}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

