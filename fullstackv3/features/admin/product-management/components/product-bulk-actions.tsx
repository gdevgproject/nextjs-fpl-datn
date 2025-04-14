"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Trash2, RotateCcw, Tag, FolderPlus, FolderMinus, TagOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { toast } from "sonner"
import { useProductLookups } from "../queries"
import {
  useBulkSoftDeleteProducts,
  useBulkRestoreProducts,
  useBulkAssignCategoryToProducts,
  useBulkRemoveCategoryFromProducts,
  useBulkAssignLabelToProducts,
  useBulkRemoveLabelFromProducts,
} from "../queries"

interface ProductBulkActionsProps {
  selectedProductIds: number[]
  onActionComplete: () => void
}

export function ProductBulkActions({ selectedProductIds, onActionComplete }: ProductBulkActionsProps) {
  // For tracking active dialog states
  const [activeDialog, setActiveDialog] = useState<
    "delete" | "restore" | "add-category" | "remove-category" | "add-label" | "remove-label" | null
  >(null)

  // For selected category/label in dialogs
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedLabelId, setSelectedLabelId] = useState<number | null>(null)
  const [labelValidUntil, setLabelValidUntil] = useState<Date | null>(null)

  // Get lookup data for dropdowns
  const { data: lookups, isLoading: isLoadingLookups } = useProductLookups()

  // Mutation hooks for bulk operations
  const bulkDelete = useBulkSoftDeleteProducts()
  const bulkRestore = useBulkRestoreProducts()
  const bulkAddCategory = useBulkAssignCategoryToProducts()
  const bulkRemoveCategory = useBulkRemoveCategoryFromProducts()
  const bulkAddLabel = useBulkAssignLabelToProducts()
  const bulkRemoveLabel = useBulkRemoveLabelFromProducts()

  // Handle bulk delete confirmation
  const handleBulkDelete = async () => {
    try {
      const result = await bulkDelete.mutateAsync({
        productIds: selectedProductIds,
      })

      if (result.success) {
        toast.success(`Đã xóa ${result.affectedCount} sản phẩm thành công`)
        onActionComplete()
      } else {
        toast.error("Xóa sản phẩm thất bại: " + result.message)
      }
    } catch (error) {
      toast.error("Xóa sản phẩm thất bại")
      console.error(error)
    } finally {
      setActiveDialog(null)
    }
  }

  // Handle bulk restore confirmation
  const handleBulkRestore = async () => {
    try {
      const result = await bulkRestore.mutateAsync({
        productIds: selectedProductIds,
      })

      if (result.success) {
        toast.success(`Đã khôi phục ${result.affectedCount} sản phẩm thành công`)
        onActionComplete()
      } else {
        toast.error("Khôi phục sản phẩm thất bại: " + result.message)
      }
    } catch (error) {
      toast.error("Khôi phục sản phẩm thất bại")
      console.error(error)
    } finally {
      setActiveDialog(null)
    }
  }

  // Handle add category to products
  const handleAddCategory = async () => {
    if (!selectedCategoryId) {
      toast.error("Vui lòng chọn danh mục")
      return
    }

    try {
      const result = await bulkAddCategory.mutateAsync({
        productIds: selectedProductIds,
        categoryId: selectedCategoryId,
      })

      if (result.success) {
        toast.success(`Đã thêm danh mục cho ${result.affectedCount} sản phẩm thành công`)
        onActionComplete()
      } else {
        toast.error("Thêm danh mục thất bại: " + result.message)
      }
    } catch (error) {
      toast.error("Thêm danh mục thất bại")
      console.error(error)
    } finally {
      setActiveDialog(null)
      setSelectedCategoryId(null)
    }
  }

  // Handle remove category from products
  const handleRemoveCategory = async () => {
    if (!selectedCategoryId) {
      toast.error("Vui lòng chọn danh mục")
      return
    }

    try {
      const result = await bulkRemoveCategory.mutateAsync({
        productIds: selectedProductIds,
        categoryId: selectedCategoryId,
      })

      if (result.success) {
        toast.success(`Đã xóa danh mục khỏi ${result.affectedCount} sản phẩm thành công`)
        onActionComplete()
      } else {
        toast.error("Xóa danh mục thất bại: " + result.message)
      }
    } catch (error) {
      toast.error("Xóa danh mục thất bại")
      console.error(error)
    } finally {
      setActiveDialog(null)
      setSelectedCategoryId(null)
    }
  }

  // Handle add label to products
  const handleAddLabel = async () => {
    if (!selectedLabelId) {
      toast.error("Vui lòng chọn nhãn")
      return
    }

    try {
      const result = await bulkAddLabel.mutateAsync({
        productIds: selectedProductIds,
        labelId: selectedLabelId,
        valid_until: labelValidUntil ? labelValidUntil.toISOString() : undefined,
      })

      if (result.success) {
        toast.success(`Đã thêm nhãn cho ${result.affectedCount} sản phẩm thành công`)
        onActionComplete()
      } else {
        toast.error("Thêm nhãn thất bại: " + result.message)
      }
    } catch (error) {
      toast.error("Thêm nhãn thất bại")
      console.error(error)
    } finally {
      setActiveDialog(null)
      setSelectedLabelId(null)
      setLabelValidUntil(null)
    }
  }

  // Handle remove label from products
  const handleRemoveLabel = async () => {
    if (!selectedLabelId) {
      toast.error("Vui lòng chọn nhãn")
      return
    }

    try {
      const result = await bulkRemoveLabel.mutateAsync({
        productIds: selectedProductIds,
        labelId: selectedLabelId,
      })

      if (result.success) {
        toast.success(`Đã xóa nhãn khỏi ${result.affectedCount} sản phẩm thành công`)
        onActionComplete()
      } else {
        toast.error("Xóa nhãn thất bại: " + result.message)
      }
    } catch (error) {
      toast.error("Xóa nhãn thất bại")
      console.error(error)
    } finally {
      setActiveDialog(null)
      setSelectedLabelId(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center p-2 bg-muted/50 rounded-md">
      <span className="text-sm font-medium">Đã chọn {selectedProductIds.length} sản phẩm</span>

      <div className="flex-1"></div>

      {/* Bulk Delete Button */}
      <AlertDialog open={activeDialog === "delete"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setActiveDialog("delete")}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedProductIds.length} sản phẩm đã chọn không? Hành động này sẽ chỉ ẩn sản
              phẩm khỏi cửa hàng và có thể khôi phục sau này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleBulkDelete}
              disabled={bulkDelete.isPending}
            >
              {bulkDelete.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Restore Button */}
      <AlertDialog open={activeDialog === "restore"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={() => setActiveDialog("restore")}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Khôi phục
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận khôi phục sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn khôi phục {selectedProductIds.length} sản phẩm đã chọn không? Hành động này sẽ hiển
              thị lại sản phẩm trong cửa hàng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkRestore} disabled={bulkRestore.isPending}>
              {bulkRestore.isPending ? "Đang khôi phục..." : "Xác nhận khôi phục"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Category Dialog */}
      <Dialog open={activeDialog === "add-category"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={() => setActiveDialog("add-category")}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Thêm danh mục
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm danh mục cho sản phẩm</DialogTitle>
            <DialogDescription>
              Chọn danh mục để thêm vào {selectedProductIds.length} sản phẩm đã chọn.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Danh mục</Label>
              <Select
                value={selectedCategoryId?.toString() || ""}
                onValueChange={(value) => setSelectedCategoryId(Number(value))}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {!isLoadingLookups &&
                    lookups?.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Hủy
            </Button>
            <Button
              type="submit"
              onClick={handleAddCategory}
              disabled={!selectedCategoryId || bulkAddCategory.isPending}
            >
              {bulkAddCategory.isPending ? "Đang thêm..." : "Thêm danh mục"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Category Dialog */}
      <Dialog open={activeDialog === "remove-category"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={() => setActiveDialog("remove-category")}>
            <FolderMinus className="h-4 w-4 mr-2" />
            Xóa danh mục
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa danh mục khỏi sản phẩm</DialogTitle>
            <DialogDescription>
              Chọn danh mục để xóa khỏi {selectedProductIds.length} sản phẩm đã chọn.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-remove">Danh mục</Label>
              <Select
                value={selectedCategoryId?.toString() || ""}
                onValueChange={(value) => setSelectedCategoryId(Number(value))}
              >
                <SelectTrigger id="category-remove">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {!isLoadingLookups &&
                    lookups?.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Hủy
            </Button>
            <Button
              type="submit"
              onClick={handleRemoveCategory}
              disabled={!selectedCategoryId || bulkRemoveCategory.isPending}
            >
              {bulkRemoveCategory.isPending ? "Đang xóa..." : "Xóa danh mục"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Label Dialog */}
      <Dialog open={activeDialog === "add-label"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={() => setActiveDialog("add-label")}>
            <Tag className="h-4 w-4 mr-2" />
            Thêm nhãn
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm nhãn cho sản phẩm</DialogTitle>
            <DialogDescription>
              Chọn nhãn để thêm vào {selectedProductIds.length} sản phẩm đã chọn và tùy chọn thời hạn hiệu lực.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">Nhãn</Label>
              <Select
                value={selectedLabelId?.toString() || ""}
                onValueChange={(value) => setSelectedLabelId(Number(value))}
              >
                <SelectTrigger id="label">
                  <SelectValue placeholder="Chọn nhãn" />
                </SelectTrigger>
                <SelectContent>
                  {!isLoadingLookups &&
                    lookups?.productLabels.map((label) => (
                      <SelectItem key={label.id} value={label.id.toString()}>
                        {label.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid-until">Hiệu lực đến (tùy chọn)</Label>
              <DatePicker
                selected={labelValidUntil}
                onSelect={setLabelValidUntil}
                disabled={(date) => date < new Date()}
                placeholder="Chọn ngày hết hạn (tùy chọn)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Hủy
            </Button>
            <Button type="submit" onClick={handleAddLabel} disabled={!selectedLabelId || bulkAddLabel.isPending}>
              {bulkAddLabel.isPending ? "Đang thêm..." : "Thêm nhãn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Label Dialog */}
      <Dialog open={activeDialog === "remove-label"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={() => setActiveDialog("remove-label")}>
            <TagOff className="h-4 w-4 mr-2" />
            Xóa nhãn
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa nhãn khỏi sản phẩm</DialogTitle>
            <DialogDescription>Chọn nhãn để xóa khỏi {selectedProductIds.length} sản phẩm đã chọn.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label-remove">Nhãn</Label>
              <Select
                value={selectedLabelId?.toString() || ""}
                onValueChange={(value) => setSelectedLabelId(Number(value))}
              >
                <SelectTrigger id="label-remove">
                  <SelectValue placeholder="Chọn nhãn" />
                </SelectTrigger>
                <SelectContent>
                  {!isLoadingLookups &&
                    lookups?.productLabels.map((label) => (
                      <SelectItem key={label.id} value={label.id.toString()}>
                        {label.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Hủy
            </Button>
            <Button type="submit" onClick={handleRemoveLabel} disabled={!selectedLabelId || bulkRemoveLabel.isPending}>
              {bulkRemoveLabel.isPending ? "Đang xóa..." : "Xóa nhãn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

