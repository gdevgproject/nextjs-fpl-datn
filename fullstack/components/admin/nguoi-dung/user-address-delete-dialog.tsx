"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface UserAddressDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: {
    id: string
    recipient_name: string
    province_city: string
    district: string
    ward: string
    street_address: string
    is_default: boolean
  } | null
  onConfirm: () => void
}

export function UserAddressDeleteDialog({ open, onOpenChange, address, onConfirm }: UserAddressDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!address) return

    setIsDeleting(true)

    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onConfirm()
    } catch (error) {
      console.error("Error deleting address:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!address) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa địa chỉ</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.
            {address.is_default && (
              <div className="mt-2 text-destructive font-medium">Lưu ý: Đây là địa chỉ mặc định của người dùng.</div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="bg-muted/50 p-3 rounded-md text-sm">
          <p>
            <span className="font-medium">Người nhận:</span> {address.recipient_name}
          </p>
          <p>
            <span className="font-medium">Địa chỉ:</span> {address.street_address}, {address.ward}, {address.district},{" "}
            {address.province_city}
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa địa chỉ"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

