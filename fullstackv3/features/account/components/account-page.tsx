"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/providers/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2 } from "lucide-react"
import { AvatarUpload } from "./avatar-upload"
import { ProfileForm } from "./profile-form"

export function AccountPage() {
  const { profile } = useAuth()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("profile")

  // Kiểm tra xem người dùng vừa xác nhận email không
  const isNewConfirmation = searchParams.get("auth_action") === "email_confirmed"

  // Cập nhật tab active từ URL nếu có
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["profile", "security"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Thông tin tài khoản</h1>
        <p className="text-muted-foreground">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {isNewConfirmation && (
        <Alert className="border-success text-success-foreground bg-success/10">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle>Tài khoản đã được xác nhận!</AlertTitle>
          <AlertDescription>
            Cảm ơn bạn đã xác nhận email. Bây giờ bạn có thể sử dụng đầy đủ các tính năng của MyBeauty.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ảnh đại diện</CardTitle>
              <CardDescription>
                Cập nhật ảnh đại diện của bạn. Ảnh sẽ được hiển thị trên trang cá nhân và trong các đánh giá.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <AvatarUpload />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân của bạn. Thông tin này sẽ được hiển thị công khai.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email</CardTitle>
              <CardDescription>Email đăng nhập của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-md border px-3 py-2 w-full bg-muted/50">
                  {profile?.id ? profile.id : "Chưa đăng nhập"}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

