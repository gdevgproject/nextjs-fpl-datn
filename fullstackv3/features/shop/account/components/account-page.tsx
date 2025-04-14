"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";
import { AvatarUpload } from "./avatar-upload";
import { ProfileForm } from "./profile-form";
import { useToast } from "@/hooks/use-toast";

export function AccountPage() {
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  // Check if user just confirmed email
  const isNewConfirmation =
    searchParams.get("auth_action") === "email_confirmed";

  // Update active tab from URL if present
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "security"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Show toast notification on profile update success
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "profile_updated") {
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin cá nhân của bạn đã được cập nhật",
      });
    } else if (status === "avatar_updated") {
      toast({
        title: "Cập nhật thành công",
        description: "Ảnh đại diện của bạn đã được cập nhật",
      });
    }
  }, [searchParams, toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Thông tin tài khoản</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin cá nhân của bạn
        </p>
      </div>

      {isNewConfirmation && (
        <Alert className="border-success text-success-foreground bg-success/10">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle>Tài khoản đã được xác nhận!</AlertTitle>
          <AlertDescription>
            Cảm ơn bạn đã xác nhận email. Bây giờ bạn có thể sử dụng đầy đủ các
            tính năng của MyBeauty.
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ảnh đại diện</CardTitle>
              <CardDescription>
                Cập nhật ảnh đại diện của bạn. Ảnh sẽ được hiển thị trên trang
                cá nhân và trong các đánh giá.
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
                Cập nhật thông tin cá nhân của bạn. Thông tin này sẽ được hiển
                thị công khai.
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
  );
}
