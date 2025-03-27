"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getPendingConfirmationEmail, clearPendingConfirmationEmail } from "@/lib/auth/auth-utils"
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

export function EmailConfirmation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)
  const [emailResent, setEmailResent] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [cooldownProgress, setCooldownProgress] = useState(0)

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

  // Xử lý cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    let progressTimer: NodeJS.Timeout

    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000)

      const updateProgress = () => {
        setCooldownProgress((prev) => {
          const newProgress = ((60 - cooldown) / 60) * 100
          return Math.min(newProgress, 100)
        })
      }

      updateProgress()
      progressTimer = setInterval(updateProgress, 100)
    } else {
      setCooldownProgress(100)
    }

    return () => {
      if (timer) clearTimeout(timer)
      if (progressTimer) clearInterval(progressTimer)
    }
  }, [cooldown])

  async function handleResendEmail() {
    try {
      if (cooldown > 0) {
        toast({
          title: "Vui lòng đợi",
          description: `Bạn có thể gửi lại email sau ${cooldown} giây`,
          variant: "destructive",
        })
        return
      }

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

      // Giả lập gửi email (không thực sự gọi API)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setEmailResent(true)
      setCooldown(60) // Đặt cooldown 60 giây
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

        <Alert className="bg-primary/10 border-primary">
          <CheckCircle className="h-4 w-4 text-primary" />
          <AlertTitle>Xác nhận email thành công!</AlertTitle>
          <AlertDescription>
            {autoLogin
              ? "Tài khoản của bạn đã được kích hoạt và bạn đã được đăng nhập tự động."
              : "Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ."}
          </AlertDescription>
        </Alert>

        <Button
          type="button"
          className="w-full transition-all duration-200 hover:bg-primary/90"
          onClick={() => router.push(autoLogin ? "/" : "/dang-nhap")}
        >
          {autoLogin ? "Đi đến trang chủ" : "Đăng nhập ngay"}
        </Button>
      </motion.div>
    )
  }

  // Nếu có lỗi, hiển thị thông báo lỗi
  if (error || errorCode || errorDescription) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 py-2"
      >
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Xác nhận email thất bại</AlertTitle>
          <AlertDescription>
            {errorDescription
              ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
              : "Liên kết xác nhận không hợp lệ hoặc đã hết hạn."}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          {cooldown > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Thời gian chờ</span>
                <span>{cooldown}s</span>
              </div>
              <Progress value={cooldownProgress} className="h-2" />
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResendEmail}
            disabled={isResending || cooldown > 0}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi lại
              </>
            ) : cooldown > 0 ? (
              `Gửi lại email xác nhận (${cooldown}s)`
            ) : (
              "Gửi lại email xác nhận"
            )}
          </Button>

          <Button
            type="button"
            className="w-full transition-all duration-200 hover:bg-primary/90"
            onClick={() => router.push("/dang-nhap")}
          >
            Quay lại đăng nhập
          </Button>
        </div>
      </motion.div>
    )
  }

  // Hiển thị thông báo chờ xác nhận
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 py-2"
    >
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-primary/10 p-3">
          {emailResent ? (
            <CheckCircle className="h-10 w-10 text-primary" />
          ) : (
            <Mail className="h-10 w-10 text-primary" />
          )}
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg text-center">
        <h3 className="font-medium mb-2">Kiểm tra email của bạn</h3>
        <p className="text-sm text-muted-foreground">
          Chúng tôi đã gửi email xác nhận đến địa chỉ email {email ? <strong>{email}</strong> : "của bạn"}. Vui lòng
          kiểm tra hộp thư (và thư mục spam) để xác nhận tài khoản.
        </p>
      </div>

      <div className="space-y-2">
        {cooldown > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Thời gian chờ</span>
              <span>{cooldown}s</span>
            </div>
            <Progress value={cooldownProgress} className="h-2" />
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleResendEmail}
          disabled={isResending || cooldown > 0}
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang gửi lại
            </>
          ) : cooldown > 0 ? (
            `Gửi lại email xác nhận (${cooldown}s)`
          ) : (
            "Gửi lại email xác nhận"
          )}
        </Button>

        <Button
          type="button"
          className="w-full transition-all duration-200 hover:bg-primary/90"
          onClick={() => router.push("/dang-nhap")}
        >
          Đã xác nhận? Đăng nhập
        </Button>

        <Button type="button" variant="link" className="w-full" onClick={() => router.push("/dang-ky")}>
          Quay lại đăng ký
        </Button>
      </div>
    </motion.div>
  )
}

