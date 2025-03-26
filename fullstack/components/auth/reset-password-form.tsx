"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { getErrorMessage, validatePassword } from "@/lib/auth/auth-utils"
import { Loader2, ShieldAlert, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClientSupabaseClient } from "@/lib/supabase/supabase-client"

// Cập nhật kiểm tra mật khẩu trong form đặt lại mật khẩu
const resetPasswordFormSchema = z
  .object({
    password: z.string().min(6, {
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>

export function ResetPasswordForm() {
  const { updatePassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [passwordValue, setPasswordValue] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  // Kiểm tra lỗi từ URL (ví dụ: link hết hạn)
  const urlError = searchParams.get("error")
  const urlErrorCode = searchParams.get("error_code")
  const urlErrorDescription = searchParams.get("error_description")

  // Lấy code từ URL nếu có
  const code = searchParams.get("code")
  const type = searchParams.get("type")

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Kiểm tra mật khẩu khi người dùng nhập
  useEffect(() => {
    if (passwordValue) {
      const { errors } = validatePassword(passwordValue)
      setPasswordErrors(errors)
    } else {
      setPasswordErrors([])
    }
  }, [passwordValue])

  useEffect(() => {
    // Check if we have a valid session with reset token
    const checkToken = async () => {
      setIsLoading(true)
      try {
        // Kiểm tra lỗi từ URL
        if (urlError || urlErrorCode || urlErrorDescription) {
          setIsTokenValid(false)
          setIsLoading(false)
          return
        }

        const supabase = createClientSupabaseClient()

        // Nếu có code trong URL và là type=recovery, đổi code lấy session
        if (code && type === "recovery") {
          console.log("Đang xử lý code đặt lại mật khẩu:", code)
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error("Lỗi đổi code lấy session:", error)
            setIsTokenValid(false)
            toast({
              title: "Liên kết không hợp lệ",
              description: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }

          if (data.session) {
            console.log("Đổi code lấy session thành công")
            setIsTokenValid(true)
            setIsLoading(false)
            return
          }
        }

        // Kiểm tra session hiện tại
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Lỗi khi kiểm tra session:", error)
          setIsTokenValid(false)
          toast({
            title: "Lỗi xác thực",
            description: "Không thể xác thực phiên làm việc",
            variant: "destructive",
          })
        } else if (!data.session) {
          console.log("Không có session hợp lệ")
          setIsTokenValid(false)
          toast({
            title: "Liên kết không hợp lệ",
            description: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
            variant: "destructive",
          })
        } else {
          console.log("Đã tìm thấy session hợp lệ")
          setIsTokenValid(true)
        }
      } catch (error) {
        console.error("Error checking reset token:", error)
        setIsTokenValid(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkToken()
  }, [toast, urlError, urlErrorCode, urlErrorDescription, code, type])

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!isTokenValid) {
      toast({
        title: "Liên kết không hợp lệ",
        description: "Vui lòng yêu cầu liên kết đặt lại mật khẩu mới",
        variant: "destructive",
      })
      router.push("/quen-mat-khau")
      return
    }

    try {
      setIsSubmitting(true)
      setFormError(null)

      console.log("Đang cập nhật mật khẩu mới")
      const { success, error } = await updatePassword(values.password)

      if (!success) {
        setFormError(getErrorMessage(new Error(error || "")))
        toast({
          title: "Đặt lại mật khẩu thất bại",
          description: getErrorMessage(new Error(error || "")),
          variant: "destructive",
        })
        return
      }

      console.log("Cập nhật mật khẩu thành công")
      setResetSuccess(true)
      toast({
        title: "Đặt lại mật khẩu thành công",
        description: "Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.",
      })

      // Tự động chuyển hướng đến trang đăng nhập sau 3 giây
      setTimeout(() => {
        router.push("/dang-nhap")
      }, 3000)
    } catch (error) {
      console.error("Reset password error:", error)
      setFormError(getErrorMessage(error))
      toast({
        title: "Đặt lại mật khẩu thất bại",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang kiểm tra liên kết...</span>
      </div>
    )
  }

  if (resetSuccess) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>

        <div className="bg-primary/10 p-4 rounded-lg text-center border border-primary">
          <h3 className="font-medium mb-2 text-primary">Đặt lại mật khẩu thành công!</h3>
          <p className="text-sm text-muted-foreground">
            Mật khẩu của bạn đã được cập nhật thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây...
          </p>
        </div>

        <Button type="button" className="w-full" onClick={() => router.push("/dang-nhap")}>
          Đăng nhập ngay
        </Button>
      </div>
    )
  }

  if (isTokenValid === false) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="h-16 w-16 text-destructive" />
        </div>

        <div className="bg-destructive/10 p-4 rounded-lg text-center">
          <h3 className="font-medium mb-2 text-destructive">Liên kết không hợp lệ</h3>
          <p className="text-sm text-muted-foreground">
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.
          </p>
        </div>
        <Button type="button" className="w-full" onClick={() => router.push("/quen-mat-khau")}>
          Yêu cầu liên kết mới
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu mới</FormLabel>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    setPasswordValue(e.target.value)
                  }}
                  className="pr-10"
                />
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
              {passwordErrors.length > 0 && (
                <div className="mt-2">
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>
                      <ul className="text-xs list-disc pl-4 space-y-1">
                        {passwordErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
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
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...field}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span className="sr-only">{showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</span>
                </Button>
              </div>
              <FormMessage />
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
            "Đặt lại mật khẩu"
          )}
        </Button>
      </form>
    </Form>
  )
}

