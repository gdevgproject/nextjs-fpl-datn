"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { getErrorMessage, validatePassword } from "@/lib/auth/auth-utils"
import { Loader2, ShieldAlert, Eye, EyeOff, CheckCircle, AlertCircle, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

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
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)

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
      const { errors, strength } = validatePassword(passwordValue)
      setPasswordErrors(errors)
      setPasswordStrength(strength)
    } else {
      setPasswordErrors([])
      setPasswordStrength(0)
    }
  }, [passwordValue])

  // Đếm ngược để chuyển hướng sau khi đặt lại mật khẩu thành công
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resetSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (resetSuccess && countdown === 0) {
      router.push("/dang-nhap")
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [resetSuccess, countdown, router])

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

        // Giả lập kiểm tra token (không thực sự gọi API)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Giả lập token hợp lệ
        setIsTokenValid(true)
      } catch (error) {
        console.error("Error checking reset token:", error)
        setIsTokenValid(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkToken()
  }, [toast, urlError, urlErrorCode, urlErrorDescription, code, type])

  // Hiển thị thanh đánh giá độ mạnh mật khẩu
  const renderPasswordStrength = () => {
    const getStrengthText = () => {
      if (passwordStrength === 0) return "Chưa nhập mật khẩu"
      if (passwordStrength < 30) return "Yếu"
      if (passwordStrength < 60) return "Trung bình"
      if (passwordStrength < 80) return "Khá"
      return "Mạnh"
    }

    const getStrengthColor = () => {
      if (passwordStrength === 0) return "bg-gray-200"
      if (passwordStrength < 30) return "bg-red-500"
      if (passwordStrength < 60) return "bg-yellow-500"
      if (passwordStrength < 80) return "bg-blue-500"
      return "bg-green-500"
    }

    return (
      <div className="mt-2 space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs">{getStrengthText()}</span>
          <span className="text-xs">{passwordStrength}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getStrengthColor()} transition-all duration-300`}
            style={{ width: `${passwordStrength}%` }}
          />
        </div>
      </div>
    )
  }

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

      // Giả lập cập nhật mật khẩu (không thực sự gọi API)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setResetSuccess(true)
      toast({
        title: "Đặt lại mật khẩu thành công",
        description: "Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.",
      })

      // Tự động chuyển hướng đến trang đăng nhập sau 3 giây
      setCountdown(3)
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
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-muted-foreground">Đang kiểm tra liên kết...</span>
      </div>
    )
  }

  if (resetSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 py-2"
      >
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div className="bg-primary/10 p-4 rounded-lg text-center border border-primary">
          <h3 className="font-medium mb-2 text-primary">Đặt lại mật khẩu thành công!</h3>
          <p className="text-sm text-muted-foreground">
            Mật khẩu của bạn đã được cập nhật thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập trong {countdown}{" "}
            giây...
          </p>
        </div>

        <Button type="button" className="w-full" onClick={() => router.push("/dang-nhap")}>
          Đăng nhập ngay
        </Button>
      </motion.div>
    )
  }

  if (isTokenValid === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 py-2"
      >
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
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

        <Button type="button" variant="link" className="w-full" onClick={() => router.push("/dang-nhap")}>
          Quay lại đăng nhập
        </Button>
      </motion.div>
    )
  }

  return (
    <Form {...form}>
      {formError && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Alert variant="destructive" className="mb-4 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu mới</FormLabel>
              <div className="relative">
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        setPasswordValue(e.target.value)
                      }}
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
                </FormControl>
              </div>
              {renderPasswordStrength()}
              {passwordErrors.length > 0 && (
                <div className="mt-2">
                  <Alert variant="destructive" className="py-2 border-destructive/50 bg-destructive/10">
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
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...field}
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
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full transition-all duration-200 hover:bg-primary/90"
          disabled={isSubmitting}
        >
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

