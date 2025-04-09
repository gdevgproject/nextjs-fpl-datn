"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "./profile-form"
import { ProfilePicture } from "./profile-picture"
import { useAuth } from "@/features/auth/context/auth-context"
import { useProfile } from "../hooks/use-profile"
import { ProfileSkeleton } from "./profile-skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AccountInfo() {
  const { user } = useAuth()
  const { profile, isLoading, error } = useProfile()
  const [activeTab, setActiveTab] = useState("profile")

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>Không thể tải thông tin tài khoản. Vui lòng thử lại sau.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>Quản lý thông tin cá nhân và ảnh đại diện của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <ProfilePicture avatarUrl={profile?.avatar_url} userId={user?.id} />
          </div>
          <div className="w-full md:w-2/3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Thông tin cơ bản</TabsTrigger>
                <TabsTrigger value="security" disabled>
                  Bảo mật
                </TabsTrigger>
                <TabsTrigger value="preferences" disabled>
                  Tùy chọn
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <ProfileForm profile={profile} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
