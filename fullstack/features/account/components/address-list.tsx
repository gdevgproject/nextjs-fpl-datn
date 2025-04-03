"use client"

import { useDeleteAddress, useSetDefaultAddress } from "../queries"
import { AddressCard } from "./address-card"
import { useToast } from "@/hooks/use-toast"
import type { Address } from "@/lib/types/shared.types"

interface AddressListProps {
  addresses: Address[]
  onEdit: (addressId: number) => void
  isEditing: boolean
  isAdding: boolean
}

export function AddressList({ addresses, onEdit, isEditing, isAdding }: AddressListProps) {
  const { toast } = useToast()
  const deleteAddressMutation = useDeleteAddress()
  const setDefaultAddressMutation = useSetDefaultAddress()

  // Xử lý khi xóa địa chỉ
  const handleDelete = async (addressId: number) => {
    try {
      await deleteAddressMutation.mutateAsync(addressId)
      toast({
        title: "Xóa địa chỉ thành công",
        description: "Địa chỉ đã được xóa khỏi danh sách của bạn",
      })
    } catch (error) {
      toast({
        title: "Xóa địa chỉ thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi xóa địa chỉ",
        variant: "destructive",
      })
    }
  }

  // Xử lý khi đặt địa chỉ mặc định
  const handleSetDefault = async (addressId: number) => {
    try {
      await setDefaultAddressMutation.mutateAsync(addressId)
      toast({
        title: "Đặt địa chỉ mặc định thành công",
        description: "Địa chỉ đã được đặt làm mặc định",
      })
    } catch (error) {
      toast({
        title: "Đặt địa chỉ mặc định thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi đặt địa chỉ mặc định",
        variant: "destructive",
      })
    }
  }

  if (addresses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-medium">Bạn chưa có địa chỉ nào</h3>
        <p className="mt-1 text-sm text-muted-foreground">Thêm địa chỉ giao hàng để thuận tiện cho việc đặt hàng</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          onEdit={() => onEdit(address.id)}
          onDelete={() => handleDelete(address.id)}
          onSetDefault={() => handleSetDefault(address.id)}
          disabled={
            isEditing ||
            isAdding ||
            deleteAddressMutation.isPending ||
            setDefaultAddressMutation.isPending ||
            // Vô hiệu hóa nút "Đặt làm mặc định" cho địa chỉ đang được đặt làm mặc định
            (setDefaultAddressMutation.isPending && setDefaultAddressMutation.variables === address.id)
          }
        />
      ))}
    </div>
  )
}

