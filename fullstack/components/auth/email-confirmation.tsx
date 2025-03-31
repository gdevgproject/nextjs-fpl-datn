"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import {
  getErrorMessage,
  getPendingConfirmationEmail,
  clearPendingConfirmationEmail,
  sendVerificationEmail,
} from "@/lib/auth/auth-utils"
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function EmailConfirmation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [email, setEmail] = useState<string | null>(null)

  // Lấy các tham số từ URL
  const success = searchParams.get("success") === "true"
  const autoLogin = searchParams.get("auto_login") === "true"
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  // Lấy email từ localStorage khi component được mount
  useEffect(() => {
    const pendingEmail = getPendingConfirmationEmail()
    setEmail(pendingEmail)
  }, [])

  // Xử lý đếm ngược để gửi lại email
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Xử lý gửi lại email xác nhận
  const handleResendEmail = async () => {
    if (!email || isResending || countdown > 0) return

    try {
      setIsResending(true)

      const result = await sendVerificationEmail(email)

      if (!result.success) {
        toast({
          title: "Gửi email thất bại",
          description: result.error || "Không thể gửi email xác nhận. Vui lòng thử lại sau.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Email đã được gửi",
        description: "Vui lòng kiểm tra hộp thư của bạn để xác nhận tài khoản.",
      })

      // Bắt đầu đếm ngược 60 giây
      setCountdown(60)
    } catch (error) {
      console.error("Error resending verification email:", error)
      toast({
        title: "Gửi email thất bại",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  // Xử lý chuyển hướng đến trang đăng nhập
  const handleGoToLogin = () => {
    // Xóa email khỏi localStorage
    clearPendingConfirmationEmail()
    router.push("/dang-nhap")
  }

  // Hiển thị thông báo thành công
  if (success || autoLogin || user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Email đã được xác nhận!</CardTitle>
          <CardDescription className="text-center">
            {autoLogin
              ? "Tài khoản của bạn đã được xác nhận và bạn đã được đăng nhập tự động."
              : "Tài khoản của bạn đã được xác nhận thành công."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Xác nhận thành công</AlertTitle>
            <AlertDescription>
              Bạn đã xác nhận email thành công. Giờ đây bạn có thể sử dụng đầy đủ các tính năng của tài khoản.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/")}>
            Đi đến trang chủ
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Xác nhận thất bại</CardTitle>
          <CardDescription className="text-center">
            {errorDescription || "Liên kết xác nhận không hợp lệ hoặc đã hết hạn."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi xác nhận</AlertTitle>
            <AlertDescription>
              {error === "invalid_link"
                ? "Liên kết xác nhận không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại email xác nhận."
                : errorDescription || "Đã xảy ra lỗi khi xác nhận email của bạn."}
            </AlertDescription>
          </Alert>

          {email && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Bạn có thể yêu cầu gửi lại email xác nhận:</p>
              <Button
                onClick={handleResendEmail}
                disabled={isResending || countdown > 0}
                className="w-full"
                variant="outline"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : countdown > 0 ? (
                  `Gửi lại sau ${countdown}s`
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Gửi lại email xác nhận
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={handleGoToLogin}>
            Đi đến đăng nhập
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/" className="hover:underline">
              Quay lại trang chủ
            </Link>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Hiển thị thông báo chờ xác nhận
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-10 w-10 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">Kiểm tra email của bạn</CardTitle>
        <CardDescription className="text-center">
          Chúng tôi đã gửi email xác nhận đến <span className="font-medium">{email || "địa chỉ email của bạn"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Mail className="h-4 w-4 text-blue-600" />
          <AlertTitle>Kiểm tra hộp thư của bạn</AlertTitle>
          <AlertDescription>
            Vui lòng kiểm tra hộp thư đến và thư mục spam để tìm email xác nhận. Nhấp vào liên kết trong email để hoàn
            tất quá trình đăng ký.
          </AlertDescription>
        </Alert>

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Không nhận được email?</p>
          <Button
            onClick={handleResendEmail}
            disabled={!email || isResending || countdown > 0}
            className="w-full"
            variant="outline"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : countdown > 0 ? (
              `Gửi lại sau ${countdown}s`
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Gửi lại email xác nhận
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button className="w-full" variant="outline" onClick={handleGoToLogin}>
          Đi đến đăng nhập
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            Quay lại trang chủ
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

