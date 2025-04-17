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

interface UserAddressSetDefaultDialogProps {
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

export function UserAddressSetDefaultDialog({
  open,
  onOpenChange,
  address,
  onConfirm,
}: UserAddressSetDefaultDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSetDefault = async () => {
    if (!address) return

    setIsProcessing(true)

    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onConfirm()
    } catch (error) {
      console.error("Error setting default address:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!address) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Đặt địa chỉ mặc định</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn đặt địa chỉ này làm địa chỉ mặc định cho người dùng? Địa chỉ mặc định hiện tại sẽ
            không còn là mặc định nữa.
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
          <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
          <Button onClick={handleSetDefault} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Đặt làm mặc định"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

