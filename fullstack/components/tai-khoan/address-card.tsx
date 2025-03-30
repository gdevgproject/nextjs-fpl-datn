"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Pencil, Trash2, CheckCircle, Loader2 } from "lucide-react"

interface AddressCardProps {
  address: {
    id: number
    recipient_name: string
    recipient_phone: string
    province_city: string
    district: string
    ward: string
    street_address: string
    is_default: boolean
  }
}

export function AddressCard({ address }: AddressCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSettingDefault, setIsSettingDefault] = useState(false)
  const [isDefault, setIsDefault] = useState(address.is_default)

  const handleDelete = () => {
    setIsDeleting(true)

    // Giả lập API call
    setTimeout(() => {
      toast({
        title: "Xóa địa chỉ thành công",
        description: "Địa chỉ đã được xóa khỏi sổ địa chỉ của bạn",
      })
      setIsDeleting(false)
    }, 1000)
  }

  const handleSetDefault = () => {
    if (isDefault) return

    setIsSettingDefault(true)

    // Giả lập API call
    setTimeout(() => {
      setIsDefault(true)
      toast({
        title: "Đặt địa chỉ mặc định thành công",
        description: "Địa chỉ đã được đặt làm địa chỉ mặc định",
      })
      setIsSettingDefault(false)
    }, 1000)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{address.recipient_name}</CardTitle>
          {isDefault && (
            <Badge variant="outline" className="border-primary text-primary">
              Mặc định
            </Badge>
          )}
        </div>
        <CardDescription>{address.recipient_phone}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm">
          {address.street_address}, {address.ward}, {address.district}, {address.province_city}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/tai-khoan/dia-chi/${address.id}/chinh-sua`}>
              <Pencil className="mr-2 h-4 w-4" />
              Sửa
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa địa chỉ</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xóa
                    </>
                  ) : (
                    "Xác nhận"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {!isDefault && (
          <Button variant="ghost" size="sm" onClick={handleSetDefault} disabled={isSettingDefault}>
            {isSettingDefault ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Đặt mặc định
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

