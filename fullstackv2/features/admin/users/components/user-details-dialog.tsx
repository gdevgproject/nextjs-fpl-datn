"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/shared/lib/utils"
import { useUserAddresses } from "../hooks/use-user-addresses"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Mail, Phone, Calendar, User } from "lucide-react"

interface UserDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
}

export function UserDetailsDialog({ open, onOpenChange, user }: UserDetailsDialogProps) {
  const { data: addressesData, isLoading: isLoadingAddresses } = useUserAddresses(user?.id)
  const addresses = addressesData?.data || []

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>
      case "staff":
        return <Badge variant="default">Nhân viên</Badge>
      case "shipper":
        return <Badge variant="outline">Người giao hàng</Badge>
      default:
        return <Badge variant="secondary">Khách hàng</Badge>
    }
  }

  const getGender = (gender?: string) => {
    switch (gender) {
      case "male":
        return "Nam"
      case "female":
        return "Nữ"
      case "other":
        return "Khác"
      default:
        return "Chưa cập nhật"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
          <DialogDescription>Xem thông tin chi tiết của người dùng trong hệ thống</DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-4 py-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar_url || ""} alt={user?.display_name || ""} />
            <AvatarFallback>{(user?.display_name || user?.email || "").substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{user?.display_name || "Chưa cập nhật"}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-1">{getRoleBadge(user?.role)}</div>
          </div>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="addresses">Địa chỉ ({addresses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>Thông tin cá nhân của người dùng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Số điện thoại:</span>
                    <span className="text-sm">{user?.phone_number || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Giới tính:</span>
                    <span className="text-sm">{getGender(user?.gender)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Ngày sinh:</span>
                    <span className="text-sm">{user?.birth_date ? formatDate(user.birth_date) : "Chưa cập nhật"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin tài khoản</CardTitle>
                <CardDescription>Thông tin về tài khoản người dùng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Vai trò:</span>
                    <span className="text-sm">{getRoleBadge(user?.role)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Ngày tạo:</span>
                    <span className="text-sm">{formatDate(user?.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Cập nhật lần cuối:</span>
                    <span className="text-sm">{formatDate(user?.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-4 py-4">
            {isLoadingAddresses ? (
              <div className="space-y-2">
                <Skeleton className="h-[100px] w-full" />
                <Skeleton className="h-[100px] w-full" />
              </div>
            ) : addresses.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-muted-foreground">
                  Người dùng chưa có địa chỉ nào
                </CardContent>
              </Card>
            ) : (
              addresses.map((address) => (
                <Card key={address.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">{address.recipient_name}</CardTitle>
                      {address.is_default && <Badge variant="outline">Mặc định</Badge>}
                    </div>
                    <CardDescription>{address.recipient_phone}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">
                        {address.street_address}, {address.ward}, {address.district}, {address.province_city}
                        {address.postal_code ? `, ${address.postal_code}` : ""}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
