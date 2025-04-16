"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { useAuthQuery, useProfileQuery } from "@/features/auth/hooks";

export function AuthToastHandler({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useSonnerToast();
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;
  const { data: profile } = useProfileQuery(session?.user?.id);
  const processedRef = useRef<string | null>(null);

  useEffect(() => {
    // Lấy action từ URL
    const authAction = searchParams.get("auth_action");
    const authError = searchParams.get("auth_error");

    // Nếu không có action hoặc error, hoặc đã xử lý action này rồi, thì return
    if ((!authAction && !authError) || processedRef.current === authAction)
      return;

    // Lưu lại action hiện tại để tránh xử lý lại
    processedRef.current = authAction;

    if (authError) {
      toast("Lỗi xác thực", { description: decodeURIComponent(authError) });

      // Xóa query param để tránh hiển thị toast lại khi refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("auth_error");
      newUrl.searchParams.delete("error_code");
      router.replace(newUrl.pathname + newUrl.search);
      return;
    }

    // Xử lý các loại thông báo khác nhau
    if (authAction) {
      switch (authAction) {
        case "email_confirmed":
          toast("Xác nhận email thành công!", {
            description:
              "Tài khoản của bạn đã được xác nhận. Vui lòng đăng nhập để tiếp tục.",
          });
          break;
        case "password_reset":
          toast("Đặt lại mật khẩu thành công!", {
            description:
              "Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập với mật khẩu mới.",
          });
          break;
        case "signed_in":
          toast("Đăng nhập thành công!", {
            description: `Chào mừng ${
              profile?.display_name || "bạn"
            } quay trở lại.`,
          });
          break;
        case "password_changed":
          toast("Đổi mật khẩu thành công!", {
            description: "Mật khẩu của bạn đã được cập nhật thành công.",
          });
          break;
      }

      // Xóa query param để tránh hiển thị toast lại khi refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("auth_action");
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, toast, router, profile, isAuthenticated]);

  return <>{children}</>;
}
