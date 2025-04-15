"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Pencil, Star, Trash } from "lucide-react"
import { formatPhoneNumber } from "@/lib/utils/format"
import type { Address } from "../types"

interface AddressCardProps {
  address: Address
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onSetDefault: (id: number) => void
  isDeletingId?: number
  isSettingDefaultId?: number
}

// Using memo to prevent unnecessary re-renders when other address cards update
export const AddressCard = memo(function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDeletingId,
  isSettingDefaultId,
}: AddressCardProps) {
  const isDeleting = isDeletingId === address.id
  const isSettingDefault = isSettingDefaultId === address.id

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 ${
        address.is_default ? "border-primary shadow-sm" : ""
      }`}
    >
      {address.is_default && (
        <div className="absolute right-2 top-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
            Mặc định
          </Badge>
        </div>
      )}

      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{address.recipient_name}</h3>
              <p className="text-sm text-muted-foreground">{formatPhoneNumber(address.recipient_phone)}</p>
            </div>
          </div>

          <p className="text-sm">
            {address.street_address}, {address.ward}, {address.district}, {address.province_city}
            {address.postal_code && ` - ${address.postal_code}`}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {!address.is_default && (
              <Button
                onClick={() => onSetDefault(address.id)}
                size="sm"
                variant="outline"
                className="gap-1"
                disabled={isSettingDefault}
              >
                {isSettingDefault ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="text-xs">Đang đặt mặc định</span>
                  </>
                ) : (
                  <>
                    <Star className="h-3.5 w-3.5" />
                    <span className="text-xs">Đặt làm mặc định</span>
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={() => onEdit(address.id)}
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={isSettingDefault || isDeleting}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="text-xs">Sửa</span>
            </Button>

            {!address.is_default && (
              <Button
                onClick={() => onDelete(address.id)}
                size="sm"
                variant="outline"
                className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={isDeleting || isSettingDefault}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="text-xs">Đang xóa</span>
                  </>
                ) : (
                  <>
                    <Trash className="h-3.5 w-3.5" />
                    <span className="text-xs">Xóa</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

