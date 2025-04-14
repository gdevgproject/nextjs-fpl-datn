"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { registerSchema } from "../validators";
import { PasswordStrengthIndicator } from "./password-strength-indicator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import {
  FormNotification,
  FormNotificationLink,
} from "@/components/ui/form-notification";
import { getFormErrorMessage } from "@/lib/utils/error-utils";
import { useRegisterMutation } from "../hooks";

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      display_name: "",
      phone_number: "",
    },
  });

  const password = form.watch("password");
  const email = form.watch("email");

  // Sử dụng TanStack Query mutation
  const registerMutation = useRegisterMutation();

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setServerError(null);
    setErrorCode(null);
    registerMutation.mutate(values, {
      onSuccess: (result) => {
        if (result && result.error) {
          if (result.code === "email_taken") {
            setErrorCode(result.code);
          } else {
            setServerError(result.error);
            toast({
              title: "Đăng ký thất bại",
              description: result.error,
              variant: "destructive",
            });
          }
          return;
        }
        toast({
          title: "Đăng ký thành công",
          description: "Vui lòng kiểm tra email để xác nhận tài khoản",
        });
        router.push("/kiem-tra-email");
      },
      onError: (error) => {
        toast({
          title: "Đăng ký thất bại",
          description: getFormErrorMessage(error),
          variant: "destructive",
        });
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {serverError && errorCode !== "email_taken" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  placeholder="example@example.com"
                  {...field}
                />
              </FormControl>

              {errorCode === "email_taken" ? (
                <FormNotification
                  type="info"
                  title="Email này đã được sử dụng."
                  action={
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        Bạn đã có tài khoản?
                      </span>
                      <FormNotificationLink
                        href={`/dang-nhap?email=${encodeURIComponent(email)}`}
                      >
                        Đăng nhập ngay
                      </FormNotificationLink>
                    </div>
                  }
                />
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên hiển thị</FormLabel>
              <FormControl>
                <Input placeholder="Nguyễn Văn A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại (tùy chọn)</FormLabel>
              <FormControl>
                <Input placeholder="0912345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <PasswordStrengthIndicator password={password} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xác nhận mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={registerMutation.isLoading}
        >
          {registerMutation.isLoading ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </form>
    </Form>
  );
}
