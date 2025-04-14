"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { loginSchema } from "../validators"
import { login } from "../actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormNotification, FormNotificationLink } from "@/components/ui/form-notification"

// Cập nhật schema để thêm trường rememberMe
const extendedLoginSchema = loginSchema.extend({
  rememberMe: z.boolean().default(false),
})

// Định nghĩa kiểu dữ liệu cho kết quả trả về từ API
type LoginResult = {
  error?: string
  code?: string
  success?: boolean
  data?: any
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Lấy email từ query params (nếu được chuyển từ trang đăng ký)
  const emailFromParams = searchParams.get("email")

  const form = useForm<z.infer<typeof extendedLoginSchema>>({
    resolver: zodResolver(extendedLoginSchema),
    defaultValues: {
      email: emailFromParams || "",
      password: "",
      rememberMe: false,
    },
  })

  // Lấy email từ form để hiển thị trong thông báo lỗi
  const email = form.watch("email")

  // Cập nhật form khi emailFromParams thay đổi
  useEffect(() => {
    if (emailFromParams) {
      form.setValue("email", emailFromParams)
    }
  }, [emailFromParams, form])

  // Thay đổi hàm onSubmit để xử lý đăng nhập hiệu quả hơn
  async function onSubmit(values: z.infer<typeof extendedLoginSchema>) {
    setIsLoading(true)
    setServerError(null)
    setErrorCode(null)

    try {
      const result = (await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      })) as LoginResult

      if (result.error) {
        // Handle email_not_confirmed with inline alert
        if (result.code === "email_not_confirmed") {
          setErrorCode(result.code)
        } else {
          // Handle other errors with toast
          setServerError(result.error)
          toast({
            title: "Đăng nhập thất bại",
            description: result.error,
            variant: "destructive",
          })
        }
        setIsLoading(false)
        return
      }

      // Thêm auth_action vào URL để AuthToastHandler hiển thị thông báo
      const redirectTo = searchParams.get("redirect") || "/"
      const redirectUrl = new URL(redirectTo, window.location.origin)
      redirectUrl.searchParams.set("auth_action", "signed_in")

      // Sử dụng window.location.href thay vì router.push để force reload trang
      window.location.href = redirectUrl.toString()
    } catch (error) {
      console.error("Lỗi đăng nhập:", error)
      toast({
        title: "Đăng nhập thất bại",
        description: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
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
                <Input placeholder="example@example.com" {...field} />
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
                  <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Ghi nhớ đăng nhập</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {errorCode === "email_not_confirmed" && (
          <FormNotification
            type="info"
            title="Email chưa được xác nhận"
            description="Bạn cần xác nhận email trước khi đăng nhập. Vui lòng kiểm tra hộp thư của bạn."
            action={
              <div className="flex gap-2 mt-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/xac-nhan-email">Kiểm tra trạng thái</Link>
                </Button>
                <FormNotificationLink href={`/dang-ky?email=${encodeURIComponent(email)}`}>
                  Đăng ký lại
                </FormNotificationLink>
              </div>
            }
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>
    </Form>
  )
}

