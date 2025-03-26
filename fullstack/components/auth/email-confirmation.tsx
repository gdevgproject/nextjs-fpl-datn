"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  sendVerificationEmail,
  getPendingConfirmationEmail,
  clearPendingConfirmationEmail,
} from "@/lib/auth/auth-utils"
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function EmailConfirmation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)
  const [emailResent, setEmailResent] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  // Kiểm tra xem người dùng đã được đăng nhập tự động chưa
  const autoLogin = searchParams.get("auto_login") === "true"

  // Kiểm tra xem email đã được xác nhận thành công chưa
  const success = searchParams.get("success") === "true"

  // Kiểm tra lỗi từ URL (ví dụ: link hết hạn)
  const error = searchParams.get("error")
  const errorCode = searchParams.get("error_code")
  const errorDescription = searchParams.get("error_description")

  useEffect(() => {
    // Lấy email từ localStorage
    const storedEmail = getPendingConfirmationEmail()
    setEmail(storedEmail)

    // Nếu xác nhận thành công, xóa email khỏi localStorage
    if (success) {
      clearPendingConfirmationEmail()

      // Hiển thị thông báo thành công
      toast({
        title: "Xác nhận email thành công",
        description: "Tài khoản của bạn đã được kích hoạt và bạn đã được đăng nhập tự động.",
      })
    }
  }, [success, toast])

  async function handleResendEmail() {
    try {
      setIsResending(true)

      if (!email) {
        toast({
          title: "Không tìm thấy email",
          description: "Vui lòng đăng ký lại hoặc đăng nhập",
          variant: "destructive",
        })
        router.push("/dang-ky")
        return
      }

      const { success, error } = await sendVerificationEmail(email)

      if (!success) {
        toast({
          title: "Gửi email thất bại",
          description: error || "Không thể gửi email xác nhận. Vui lòng thử lại sau.",
          variant: "destructive",
        })
        return
      }

      setEmailResent(true)
      toast({
        title: "Email đã được gửi lại",
        description: "Vui lòng kiểm tra hộp thư của bạn",
      })
    } catch (error) {
      console.error("Error resending verification email:", error)
      toast({
        title: "Gửi email thất bại",
        description: "Không thể gửi email xác nhận. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  // Nếu xác nhận thành công, hiển thị thông báo thành công
  if (success) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>

        <Alert className="bg-primary/10 border-primary">
          <AlertTitle>Xác nhận email thành công!</AlertTitle>
          <AlertDescription>
            {autoLogin
              ? "Tài khoản của bạn đã được kích hoạt và bạn đã được đăng nhập tự động."
              : "Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ."}
          </AlertDescription>
        </Alert>

        <Button type="button" className="w-full" onClick={() => router.push(autoLogin ? "/" : "/dang-nhap")}>
          {autoLogin ? "Đi đến trang chủ" : "Đăng nhập ngay"}
        </Button>
      </div>
    )
  }

  // Nếu có lỗi, hiển thị thông báo lỗi
  if (error || errorCode || errorDescription) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>

        <Alert variant="destructive">
          <AlertTitle>Xác nhận email thất bại</AlertTitle>
          <AlertDescription>
            {errorDescription
              ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
              : "Liên kết xác nhận không hợp lệ hoặc đã hết hạn."}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Button type="button" variant="outline" className="w-full" onClick={handleResendEmail} disabled={isResending}>
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi lại
              </>
            ) : (
              "Gửi lại email xác nhận"
            )}
          </Button>

          <Button type="button" className="w-full" onClick={() => router.push("/dang-nhap")}>
            Quay lại đăng nhập
          </Button>
        </div>
      </div>
    )
  }

  // Hiển thị thông báo chờ xác nhận
  return (
    <div className="space-y-4 py-4">
      <div className="flex justify-center mb-4">
        {emailResent ? <CheckCircle className="h-16 w-16 text-primary" /> : <Mail className="h-16 w-16 text-primary" />}
      </div>

      <div className="bg-muted p-4 rounded-lg text-center">
        <h3 className="font-medium mb-2">Kiểm tra email của bạn</h3>
        <p className="text-sm text-muted-foreground">
          Chúng tôi đã gửi email xác nhận đến địa chỉ email {email ? <strong>{email}</strong> : "của bạn"}. Vui lòng
          kiểm tra hộp thư (và thư mục spam) để xác nhận tài khoản.
        </p>
      </div>

      <div className="space-y-2">
        <Button type="button" variant="outline" className="w-full" onClick={handleResendEmail} disabled={isResending}>
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang gửi lại
            </>
          ) : (
            "Gửi lại email xác nhận"
          )}
        </Button>

        <Button type="button" className="w-full" onClick={() => router.push("/dang-nhap")}>
          Đã xác nhận? Đăng nhập
        </Button>
      </div>
    </div>
  )
}

