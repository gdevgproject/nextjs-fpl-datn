"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { sendVerificationEmail } from "@/lib/auth/auth-utils"
import { Loader2, Mail, CheckCircle } from "lucide-react"

export function EmailConfirmation() {
  const router = useRouter()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)
  const [emailResent, setEmailResent] = useState(false)

  async function handleResendEmail() {
    try {
      setIsResending(true)

      // Get email from localStorage (saved during registration)
      const email = localStorage.getItem("pendingConfirmationEmail")

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

  return (
    <div className="space-y-4 py-4">
      <div className="flex justify-center mb-4">
        {emailResent ? <CheckCircle className="h-16 w-16 text-primary" /> : <Mail className="h-16 w-16 text-primary" />}
      </div>

      <div className="bg-muted p-4 rounded-lg text-center">
        <h3 className="font-medium mb-2">Kiểm tra email của bạn</h3>
        <p className="text-sm text-muted-foreground">
          Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư (và thư mục spam) để xác
          nhận tài khoản.
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

