"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { getErrorMessage, validatePassword, savePendingConfirmationEmail } from "@/lib/auth/auth-utils"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Cập nhật kiểm tra mật khẩu trong form đăng ký
const registerFormSchema = z
  .object({
    displayName: z.string().min(2, {
      message: "Tên hiển thị phải có ít nhất 2 ký tự",
    }),
    phoneNumber: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, {
      message: "Số điện thoại không hợp lệ",
    }),
    email: z.string().email({
      message: "Email không hợp lệ",
    }),
    password: z.string().min(6, {
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerFormSchema>

export function RegisterForm() {
  const { signUp } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [passwordValue, setPasswordValue] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      displayName: "",
      phoneNumber: "",
      email: "",
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

  async function onSubmit(values: RegisterFormValues) {
    try {
      setIsSubmitting(true)
      setFormError(null)

      const { success, error } = await signUp(values.email, values.password, {
        display_name: values.displayName,
        phone_number: values.phoneNumber,
      })

      if (!success) {
        setFormError(error || "Đăng ký thất bại. Vui lòng thử lại.")
        toast({
          title: "Đăng ký thất bại",
          description: getErrorMessage(new Error(error || "Đăng ký thất bại")),
          variant: "destructive",
        })
        return
      }

      // Lưu email vào localStorage để có thể gửi lại email xác nhận
      savePendingConfirmationEmail(values.email)

      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng kiểm tra email của bạn để xác nhận tài khoản",
      })

      router.push("/xac-nhan-email")
    } catch (error) {
      console.error("Registration error:", error)
      setFormError(getErrorMessage(error))
      toast({
        title: "Đăng ký thất bại",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên hiển thị</FormLabel>
              <div className="relative">
                <Input placeholder="Nhập tên hiển thị" {...field} />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <div className="relative">
                <Input placeholder="Nhập số điện thoại" {...field} />
              </div>
              <FormDescription>Ví dụ: 0912345678 hoặc +84912345678</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormLabel>Mật khẩu</FormLabel>
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
            "Đăng ký"
          )}
        </Button>
      </form>
    </Form>
  )
}

