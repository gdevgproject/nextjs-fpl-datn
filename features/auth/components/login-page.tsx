"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoginForm } from "./login-form";
import { MagicLinkForm } from "./magic-link-form";

export function LoginPage() {
  const searchParams = useSearchParams();
  const { toast } = useSonnerToast();

  // Hiển thị thông báo dựa trên auth_action
  useEffect(() => {
    const authAction = searchParams.get("auth_action");

    if (authAction === "email_confirmed") {
      toast("Xác nhận email thành công!", {
        description:
          "Tài khoản của bạn đã được xác nhận. Vui lòng đăng nhập để tiếp tục.",
      });
    } else if (authAction === "password_reset") {
      toast("Đặt lại mật khẩu thành công!", {
        description:
          "Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập với mật khẩu mới.",
      });
    }
  }, [searchParams, toast]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
        <p className="text-sm text-muted-foreground">
          Chọn phương thức đăng nhập
        </p>
      </div>
      <Tabs defaultValue="password" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="password" className="flex-1 text-center">
            Bằng mật khẩu
          </TabsTrigger>
          <TabsTrigger value="magic" className="flex-1 text-center">
            Bằng magic link
          </TabsTrigger>
        </TabsList>
        <TabsContent value="password">
          <LoginForm />
        </TabsContent>
        <TabsContent value="magic">
          <MagicLinkForm />
        </TabsContent>
      </Tabs>
      <div className="text-center text-sm">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="text-primary hover:underline">
          Đăng ký
        </Link>
      </div>
    </div>
  );
}
