"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { getErrorMessage, validatePassword, savePendingConfirmationEmail } from "@/lib/auth/auth-utils"
import { Loader2, Eye, EyeOff, User, Phone, Mail, Lock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

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
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      displayName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
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

  // Xử lý chuyển bước
  const nextStep = () => {
    const fieldsToValidate =
      currentStep === 1 ? ["displayName", "phoneNumber", "email"] : ["password", "confirmPassword"]

    const isValid = fieldsToValidate.every((field) => {
      const result = form.trigger(field as keyof RegisterFormValues)
      return result
    })

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  async function onSubmit(values: RegisterFormValues) {
    try {
      setIsSubmitting(true)
      setFormError(null)

      // Giả lập đăng ký (không thực sự gọi API)
      await new Promise((resolve) => setTimeout(resolve, 2000))

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

  // Hiển thị thanh tiến trình
  const renderProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-xs font-medium">
          Bước {currentStep}/{totalSteps}
        </span>
        <span className="text-xs font-medium">{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
    </div>
  )

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

      {renderProgressBar()}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên hiển thị</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Nhập tên hiển thị" className="pl-10" {...field} />
                      </div>
                    </FormControl>
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
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Nhập số điện thoại" className="pl-10" {...field} />
                      </div>
                    </FormControl>
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
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="name@example.com" type="email" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="button" className="w-full transition-all duration-200 hover:bg-primary/90" onClick={nextStep}>
              Tiếp tục
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link href="/dang-nhap" className="font-medium text-primary hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
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

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={prevStep}>
                Quay lại
              </Button>
              <Button
                type="submit"
                className="flex-1 transition-all duration-200 hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý
                  </>
                ) : (
                  "Đăng ký"
                )}
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link href="/dang-nhap" className="font-medium text-primary hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </form>
    </Form>
  )
}

