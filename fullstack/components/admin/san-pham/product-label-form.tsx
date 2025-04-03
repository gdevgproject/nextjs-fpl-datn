"use client"

import type React from "react"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProductLabelColorPicker } from "./product-label-color-picker"

interface ProductLabelFormProps {
  label?: {
    id: string
    name: string
    color_code: string
    description?: string
  } | null
  onClose: () => void
  onSave: (label: { id: string; name: string; color_code: string; description: string }) => void
}

export function ProductLabelForm({ label, onClose, onSave }: ProductLabelFormProps) {
  const [name, setName] = useState(label?.name || "")
  const [colorCode, setColorCode] = useState(label?.color_code || "#10b981")
  const [description, setDescription] = useState(label?.description || "")
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({})

  const isEditMode = !!label

  const validate = () => {
    const newErrors: { name?: string; description?: string } = {}

    if (!name.trim()) {
      newErrors.name = "Tên nhãn không được để trống"
    }

    if (description.length > 100) {
      newErrors.description = "Mô tả không được vượt quá 100 ký tự"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    onSave({
      id: label?.id || `new-${Date.now()}`,
      name,
      color_code: colorCode,
      description,
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Chỉnh sửa nhãn" : "Tạo nhãn mới"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Chỉnh sửa thông tin nhãn sản phẩm"
              : "Tạo nhãn mới nếu không tìm thấy nhãn phù hợp trong danh sách có sẵn"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên nhãn <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Nhập tên nhãn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả ngắn về nhãn"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              rows={3}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            <p className="text-xs text-muted-foreground">{description.length}/100 ký tự</p>
          </div>

          <div className="space-y-2">
            <Label>
              Màu sắc <span className="text-red-500">*</span>
            </Label>
            <ProductLabelColorPicker color={colorCode} onChange={setColorCode} />
          </div>

          <div className="space-y-2">
            <Label>Xem trước</Label>
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full" style={{ backgroundColor: colorCode }} />
              <div className="rounded-full px-3 py-1 text-sm text-white" style={{ backgroundColor: colorCode }}>
                {name || "Tên nhãn"}
              </div>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {isEditMode ? "Cập nhật" : "Tạo nhãn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

