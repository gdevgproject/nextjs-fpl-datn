"use client"

import { useState } from "react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Category } from "@/types/san-pham"

interface CategoryMoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  categories: Category[]
}

export function CategoryMoveDialog({ open, onOpenChange, category, categories }: CategoryMoveDialogProps) {
  const [targetCategoryId, setTargetCategoryId] = useState<string>("none")
  const [isLoading, setIsLoading] = useState(false)

  if (!category) return null

  // Lọc ra các danh mục có thể là danh mục cha (không phải chính nó và không phải con của nó)
  const eligibleParentCategories = categories.filter((c) => {
    // Không phải chính nó
    if (c.id === category.id) return false

    // Không phải con của nó (tránh tạo vòng lặp)
    let currentCategory = c
    while (currentCategory.parent_category_id) {
      if (currentCategory.parent_category_id === category.id) return false
      currentCategory = categories.find((parent) => parent.id === currentCategory.parent_category_id) || currentCategory
    }

    return true
  })

  const handleMove = async () => {
    setIsLoading(true)

    try {
      // Giả lập việc di chuyển danh mục
      await new Promise((resolve) => setTimeout(resolve, 500))

      const targetName =
        targetCategoryId === "none"
          ? "danh mục gốc"
          : categories.find((c) => c.id === targetCategoryId)?.name || "danh mục khác"

      toast.success(`Đã di chuyển danh mục "${category.name}" đến ${targetName}`)
      onOpenChange(false)
    } catch (error) {
      toast.error("Có lỗi xảy ra khi di chuyển danh mục")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Di chuyển danh mục</DialogTitle>
          <DialogDescription>Chọn vị trí mới cho danh mục "{category.name}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="parent-category">Danh mục cha mới</Label>
            <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
              <SelectTrigger id="parent-category">
                <SelectValue placeholder="Chọn danh mục cha mới" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không có (danh mục gốc)</SelectItem>
                {eligibleParentCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleMove} disabled={isLoading}>
            {isLoading ? "Đang di chuyển..." : "Di chuyển"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

