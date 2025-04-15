"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { LoginForm } from "./login-form";

export function LoginPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Hiển thị thông báo dựa trên auth_action
  useEffect(() => {
    const authAction = searchParams.get("auth_action");

    if (authAction === "email_confirmed") {
      toast({
        title: "Xác nhận email thành công!",
        description:
          "Tài khoản của bạn đã được xác nhận. Vui lòng đăng nhập để tiếp tục.",
        variant: "default",
      });
    } else if (authAction === "password_reset") {
      toast({
        title: "Đặt lại mật khẩu thành công!",
        description:
          "Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập với mật khẩu mới.",
        variant: "default",
      });
    }
  }, [searchParams, toast]);

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
        <p className="text-sm text-muted-foreground">
          Nhập thông tin đăng nhập của bạn để tiếp tục
        </p>
      </div>
      <LoginForm />
      <div className="text-center text-sm">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="text-primary hover:underline">
          Đăng ký
        </Link>
      </div>
    </>
  );
}
