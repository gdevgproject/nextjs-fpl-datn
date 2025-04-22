"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

type ErrorState = {
  error: string;
  errorCode: string;
  errorDescription: string;
};

export function CheckEmailPage() {
  const router = useRouter();
  const { toast } = useSonnerToast();
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  useEffect(() => {
    // Kiểm tra hash URL có chứa lỗi không
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && hash.includes("error=")) {
        // Phân tích các tham số từ hash
        const params = new URLSearchParams(hash.substring(1));
        const error = params.get("error") || "";
        const errorCode = params.get("error_code") || "";
        const errorDescription = params.get("error_description") || "";

        setErrorState({
          error,
          errorCode,
          errorDescription: decodeURIComponent(
            errorDescription.replace(/\+/g, " ")
          ),
        });

        // Xử lý lỗi user_banned
        if (errorCode === "user_banned") {
          // Đảm bảo component đã mount hoàn toàn và dùng đúng cú pháp của useSonnerToast
          setTimeout(() => {
            toast("Tài khoản đã bị khóa", {
              description:
                "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
              // Tôn trọng duration mặc định từ useSonnerToast
            });
          }, 0);

          // Không chuyển hướng ngay để người dùng đọc thông báo
          setTimeout(() => {
            router.push("/dang-nhap");
          }, 4000);
        }

        // Xóa hash từ URL để tránh hiển thị lại lỗi khi refresh
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    }
  }, [router, toast]);

  // Nếu là lỗi user_banned, hiển thị thông báo khóa tài khoản
  if (errorState?.errorCode === "user_banned") {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Tài khoản bị khóa</CardTitle>
          <CardDescription>
            Tài khoản của bạn hiện đang bị khóa trên hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tài khoản bị khóa</AlertTitle>
            <AlertDescription>
              {errorState.errorDescription ||
                "Tài khoản của bạn đã bị khóa trên hệ thống. Vui lòng liên hệ quản trị viên để được hỗ trợ."}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/dang-nhap">Quay lại đăng nhập</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Hiển thị giao diện thông thường
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Kiểm tra email của bạn</CardTitle>
        <CardDescription>
          Nếu bạn không nhận được email, vui lòng kiểm tra thư mục spam hoặc thử
          lại sau.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p>
          <strong>Lưu ý:</strong> Vui lòng nhấp vào liên kết xác nhận trên{" "}
          <b>cùng trình duyệt và thiết bị</b> mà bạn đã đăng ký tài khoản để
          hoàn tất xác thực.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button asChild className="w-full">
          <Link href="/dang-nhap">Quay lại đăng nhập</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
