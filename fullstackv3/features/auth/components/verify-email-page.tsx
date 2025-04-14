"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useVerifyOtpMutation } from "../hooks";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function VerifyEmailPage({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const verifyOtpMutation = useVerifyOtpMutation();

  useEffect(() => {
    verifyOtpMutation.mutate(token, {
      onSuccess: (result) => {
        if (result.error) {
          setStatus("error");
          setErrorMessage(result.error);
          return;
        }
        setStatus("success");
        setTimeout(() => {
          router.push("/dang-nhap?auth_action=email_confirmed");
        }, 3000);
      },
      onError: () => {
        setStatus("error");
        setErrorMessage("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex flex-col space-y-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Xác nhận email</h1>

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Đang xác nhận email của bạn...
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-medium">Xác nhận thành công!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Email của bạn đã được xác nhận. Bạn sẽ được chuyển hướng đến trang
              đăng nhập trong vài giây.
            </p>
          </div>
          <Button asChild>
            <Link href="/dang-nhap?auth_action=email_confirmed">
              Đến trang đăng nhập
            </Link>
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <Alert variant="destructive">
            <AlertTitle>Xác nhận thất bại</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                "Liên kết xác nhận không hợp lệ hoặc đã hết hạn. Vui lòng thử lại."}
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link href="/dang-ky">Đăng ký lại</Link>
            </Button>
            <Button asChild>
              <Link href="/">Quay lại trang chủ</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
