"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { getErrorMessage } from "@/lib/auth/auth-utils"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const loginFormSchema = z.object({
  email: z.string().email({
    message: "Email không hợp lệ",
  }),
  password: z.string().min(1, {
    message: "Vui lòng nhập mật khẩu",
  }),
  rememberMe: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export function LoginForm() {
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Kiểm tra lỗi từ URL (ví dụ: tài khoản bị xóa)
  const error = searchParams.get("error")
  const errorCode = searchParams.get("error_code")
  const errorDescription = searchParams.get("error_description")

  // Cập nhật hiển thị thông báo lỗi trong form đăng nhập
  // Hiển thị thông báo lỗi cụ thể cho trường hợp tài khoản bị xóa
  useEffect(() => {
    if (error === "account_deleted") {
      setLoginError(
        "Tài khoản của bạn không còn tồn tại hoặc đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ nếu bạn cần trợ giúp.",
      )
      toast({
        title: "Tài khoản không tồn tại",
        description:
          "Tài khoản của bạn không còn tồn tại hoặc đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ nếu bạn cần trợ giúp.",
        variant: "destructive",
      })
    } else if (error === "session_invalid") {
      setLoginError("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.")
      toast({
        title: "Phiên đăng nhập đã hết hạn",
        description: "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.",
        variant: "destructive",
      })
    }
  }, [error, toast])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Cập nhật hiển thị lỗi trong form đăng nhập để hiển thị rõ ràng hơn
  async function onSubmit(values: LoginFormValues) {
    try {
      setIsSubmitting(true)
      setLoginError(null)

      const { success, error } = await signIn(values.email, values.password)

      if (!success) {
        const errorMessage = getErrorMessage(new Error(error))
        setLoginError(errorMessage)
        toast({
          title: "Đăng nhập thất bại",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại",
      })

      router.push(callbackUrl)
      router.refresh()
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = getErrorMessage(error)
      setLoginError(errorMessage)
      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      {(error || errorCode || errorDescription) && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {errorDescription
              ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
              : "Đã xảy ra lỗi. Vui lòng thử lại."}
          </AlertDescription>
        </Alert>
      )}

      {loginError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <Input placeholder="name@example.com" type="email" {...field} />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Mật khẩu</FormLabel>
                <Link href="/quen-mat-khau" className="text-sm font-medium text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="pr-10" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span className="sr-only">{showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</span>
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <div className="flex items-center space-x-2">
                <Checkbox checked={field.value} onCheckedChange={field.onChange} id="rememberMe" />
                <FormLabel htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                  Ghi nhớ đăng nhập
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </form>
    </Form>
  )
}

