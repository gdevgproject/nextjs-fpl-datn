"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { getErrorMessage } from "@/lib/auth/auth-utils"
import { Loader2, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MagicLinkForm } from "./magic-link-form"
import { motion } from "framer-motion"
// Thêm import
import { AuthSocialButtons } from "@/components/auth/auth-social-buttons"

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
  const [activeTab, setActiveTab] = useState("password")

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

      // Giả lập đăng nhập (không thực sự gọi API)
      // Trong thực tế, bạn sẽ gọi signIn từ useAuth
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Giả lập thành công
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại",
      })

      router.push(callbackUrl)
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
    <Card className="w-full border-none shadow-none">
      <CardHeader className="p-0 pb-6 space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
        <CardDescription className="text-center">Chọn phương thức đăng nhập của bạn</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="password" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="password"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Lock className="w-4 h-4 mr-2" />
              Mật khẩu
            </TabsTrigger>
            <TabsTrigger
              value="magic-link"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Mail className="w-4 h-4 mr-2" />
              Magic Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="mt-0">
            <Form {...form}>
              {(error || errorCode || errorDescription) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive" className="mb-4 border-destructive/50 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errorDescription
                        ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
                        : "Đã xảy ra lỗi. Vui lòng thử lại."}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive" className="mb-4 border-destructive/50 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Mật khẩu</FormLabel>
                        <Link href="/quen-mat-khau" className="text-xs font-medium text-primary hover:underline">
                          Quên mật khẩu?
                        </Link>
                      </div>
                      <div className="relative">
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10"
                              {...field}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="rememberMe"
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </FormControl>
                      <FormLabel htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                        Ghi nhớ đăng nhập
                      </FormLabel>
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
                    "Đăng nhập"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="magic-link" className="mt-0">
            <MagicLinkForm />
          </TabsContent>
        </Tabs>
      </CardContent>
      {/* Cập nhật phần CardFooter */}
      <CardFooter className="p-0 pt-6 flex flex-col space-y-4">
        <div className="relative flex items-center justify-center w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <span className="relative bg-card px-2 text-xs uppercase text-muted-foreground">hoặc</span>
        </div>

        <AuthSocialButtons />

        <p className="text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link href="/dang-ky" className="font-medium text-primary hover:underline">
            Đăng ký
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

