"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { useToast } from "@/components/ui/use-toast"
import { deleteAddress, setDefaultAddress } from "@/actions/address-actions"
import type { Tables } from "@/types/supabase"
import { Pencil, Trash2, Check } from "lucide-react"

interface AddressListProps {
  addresses: Tables<"addresses">[]
  defaultAddressId?: number | null
}

export function AddressList({ addresses, defaultAddressId }: AddressListProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null)
  const [isSettingDefault, setIsSettingDefault] = useState(false)
  const { toast } = useToast()

  const handleDeleteClick = (addressId: number) => {
    setAddressToDelete(addressId)
  }

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return

    try {
      setIsDeleting(true)

      const result = await deleteAddress(addressToDelete)

      if (result.success) {
        toast({
          title: "Xóa địa chỉ thành công",
          description: "Địa chỉ đã được xóa khỏi danh sách của bạn",
        })
      } else {
        toast({
          title: "Xóa địa chỉ thất bại",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({
        title: "Xóa địa chỉ thất bại",
        description: "Đã xảy ra lỗi khi xóa địa chỉ",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setAddressToDelete(null)
    }
  }

  const handleSetDefault = async (addressId: number) => {
    try {
      setIsSettingDefault(true)

      const result = await setDefaultAddress(addressId)

      if (result.success) {
        toast({
          title: "Đặt địa chỉ mặc định thành công",
          description: "Địa chỉ đã được đặt làm mặc định",
        })
      } else {
        toast({
          title: "Đặt địa chỉ mặc định thất bại",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error setting default address:", error)
      toast({
        title: "Đặt địa chỉ mặc định thất bại",
        description: "Đã xảy ra lỗi khi đặt địa chỉ mặc định",
        variant: "destructive",
      })
    } finally {
      setIsSettingDefault(false)
    }
  }

  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="mb-4 text-center text-muted-foreground">
            Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ để tiện cho việc giao hàng.
          </p>
          <Button asChild>
            <Link href="/tai-khoan/dia-chi/them">Thêm địa chỉ mới</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => {
        const isDefault = address.is_default || address.id === defaultAddressId

        return (
          <Card key={address.id} className={isDefault ? "border-primary" : ""}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{address.recipient_name}</h4>
                    {isDefault && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Mặc định
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{address.recipient_phone}</p>
                  <p className="text-sm">
                    {address.street_address}, {address.ward}, {address.district}, {address.province_city}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={isSettingDefault}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Đặt mặc định
                    </Button>
                  )}

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/tai-khoan/dia-chi/${address.id}/chinh-sua`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => handleDeleteClick(address.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      <AlertDialog open={!!addressToDelete} onOpenChange={(open) => !open && setAddressToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa địa chỉ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa địa chỉ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

