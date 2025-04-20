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
    const errorDescription = searchParams.get("error_description");

    // Nếu không có action hoặc error, hoặc đã xử lý action này rồi, thì return
    if ((!authAction && !authError) || processedRef.current === authAction)
      return;

    // Lưu lại action hiện tại để tránh xử lý lại
    processedRef.current = authAction;

    if (authError) {
      const errorMessage = errorDescription
        ? decodeURIComponent(errorDescription)
        : decodeURIComponent(authError);

      toast("Lỗi xác thực", { description: errorMessage });

      // Xóa query param để tránh hiển thị toast lại khi refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("auth_error");
      newUrl.searchParams.delete("error_description");
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
        case "signed_out":
          toast("Đăng xuất thành công!", {
            description: "Bạn đã đăng xuất khỏi tài khoản.",
          });
          break;
        case "password_changed":
          toast("Đổi mật khẩu thành công!", {
            description: "Mật khẩu của bạn đã được cập nhật thành công.",
          });
          break;
        case "magic_link_sent":
          toast("Đã gửi Magic Link!", {
            description: "Vui lòng kiểm tra email của bạn để đăng nhập.",
          });
          break;
        case "profile_updated":
          toast("Cập nhật thông tin thành công!", {
            description: "Thông tin tài khoản của bạn đã được cập nhật.",
          });
          break;
        case "verification_email_sent":
          toast("Đã gửi email xác nhận!", {
            description: "Vui lòng kiểm tra hộp thư để xác nhận email của bạn.",
          });
          break;
        case "verification_error":
          toast("Lỗi xác thực email", {
            description:
              "Có lỗi xảy ra trong quá trình xác thực email. Vui lòng thử lại.",
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
