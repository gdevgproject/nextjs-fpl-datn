"use client"

import { useState } from "react"
import { useUserAddresses } from "../queries"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import { AddressForm } from "./address-form"
import { AddressList } from "./address-list"
import { useAuth } from "@/lib/providers/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export function AddressPage() {
  const { isAuthenticated } = useAuth()
  const { data: addresses, isLoading } = useUserAddresses()
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)

  // Xử lý khi thêm địa chỉ mới
  const handleAddNew = () => {
    setIsAddingNew(true)
    setEditingAddressId(null)
  }

  // Xử lý khi hủy thêm/sửa
  const handleCancel = () => {
    setIsAddingNew(false)
    setEditingAddressId(null)
  }

  // Xử lý khi sửa địa chỉ
  const handleEdit = (addressId: number) => {
    setEditingAddressId(addressId)
    setIsAddingNew(false)
  }

  // Xử lý khi thêm/sửa thành công
  const handleSuccess = () => {
    setIsAddingNew(false)
    setEditingAddressId(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Địa chỉ giao hàng</h1>
          <p className="text-muted-foreground">Vui lòng đăng nhập để quản lý địa chỉ giao hàng</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Địa chỉ giao hàng</h1>
          <p className="text-muted-foreground">Quản lý địa chỉ giao hàng của bạn</p>
        </div>
        {!isAddingNew && !editingAddressId && (
          <Button onClick={handleAddNew} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            <span>Thêm địa chỉ mới</span>
          </Button>
        )}
      </div>

      {isAddingNew && (
        <Card>
          <CardHeader>
            <CardTitle>Thêm địa chỉ mới</CardTitle>
            <CardDescription>Nhập thông tin địa chỉ giao hàng mới của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressForm onCancel={handleCancel} onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      )}

      {editingAddressId && addresses && (
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa địa chỉ</CardTitle>
            <CardDescription>Cập nhật thông tin địa chỉ giao hàng của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <AddressForm
              address={addresses.find((addr) => addr.id === editingAddressId)}
              onCancel={handleCancel}
              onSuccess={handleSuccess}
            />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      ) : (
        <AddressList
          addresses={addresses || []}
          onEdit={handleEdit}
          isEditing={!!editingAddressId}
          isAdding={isAddingNew}
        />
      )}
    </div>
  )
}

