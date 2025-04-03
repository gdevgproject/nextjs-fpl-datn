"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Copy } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { Brand } from "@/types/san-pham"

interface BrandDuplicateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand: Brand | null
}

export function BrandDuplicateDialog({ open, onOpenChange, brand }: BrandDuplicateDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [newName, setNewName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Khi dialog mở, đặt tên mặc định
  const handleOpenChange = (open: boolean) => {
    if (open && brand) {
      setNewName(`${brand.name} (Bản sao)`)
    }
    onOpenChange(open)
  }

  const handleDuplicate = () => {
    if (!brand || !newName.trim()) return

    setIsLoading(true)

    // Giả lập việc nhân bản thương hiệu
    setTimeout(() => {
      setIsLoading(false)
      onOpenChange(false)

      toast({
        title: "Đã nhân bản thương hiệu",
        description: `Thương hiệu "${brand.name}" đã được nhân bản thành "${newName}".`,
      })

      // Làm mới trang
      router.refresh()
    }, 1000)
  }

  if (!brand) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nhân bản thương hiệu</DialogTitle>
          <DialogDescription>Tạo một bản sao của thương hiệu "{brand.name}" với tên mới.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-name">Tên thương hiệu mới</Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nhập tên thương hiệu mới"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleDuplicate} disabled={!newName.trim() || isLoading}>
            {isLoading ? (
              "Đang nhân bản..."
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Nhân bản
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

