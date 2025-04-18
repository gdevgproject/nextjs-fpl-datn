"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { LoginForm } from "./login-form";

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
    <>
      <div className="flex flex-col space-y-2 text-center mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
        <p className="text-sm text-muted-foreground">
          Nhập thông tin đăng nhập của bạn để tiếp tục
        </p>
      </div>
      <LoginForm />
      <div className="text-center text-sm mt-4">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="text-primary hover:underline">
          Đăng ký
        </Link>
      </div>
    </>
  );
}
