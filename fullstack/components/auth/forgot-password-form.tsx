"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { getErrorMessage } from "@/lib/auth/auth-utils"
import { Loader2, CheckCircle, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

const forgotPasswordFormSchema = z.object({
  email: z.string().email({
    message: "Email không hợp lệ",
  }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [cooldownProgress, setCooldownProgress] = useState(0)
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null)
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Kiểm tra lỗi từ URL (ví dụ: link hết hạn)
  const error = searchParams.get("error")
  const errorCode = searchParams.get("error_code")
  const errorDescription = searchParams.get("error_description")

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  })

  // Xử lý cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      // Cập nhật thời gian cooldown mỗi giây
      cooldownTimerRef.current = setTimeout(() => {
        setCooldown((prevCooldown) => prevCooldown - 1)
      }, 1000)

      // Cập nhật thanh tiến trình
      const initialCooldown = cooldown
      const updateProgress = () => {
        setCooldownProgress((prevProgress) => {
          const newProgress = ((initialCooldown - cooldown + 1) / initialCooldown) * 100
          return Math.min(newProgress, 100)
        })
      }

      updateProgress()
      progressTimerRef.current = setInterval(updateProgress, 100)
    } else {
      setCooldownProgress(100)
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }
    }

    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current)
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }
    }
  }, [cooldown])

  // Cập nhật thời gian cooldown để phản ánh giới hạn tốc độ gửi email
  // Thay đổi từ 60 giây thành 1800 giây (30 phút) để đảm bảo không vượt quá giới hạn 2 email/giờ
  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      // Nếu đang trong thời gian cooldown, hiển thị thông báo và không gửi yêu cầu
      if (cooldown > 0) {
        setFormError(`Vì lý do bảo mật, bạn chỉ có thể yêu cầu sau ${cooldown} giây nữa.`)
        return
      }

      setIsSubmitting(true)
      setFormError(null)

      const { success, error, cooldown: newCooldown } = await resetPassword(values.email)

      if (!success) {
        // Kiểm tra nếu lỗi là do cooldown
        if (error && error.includes("bảo mật") && newCooldown) {
          setCooldown(newCooldown)
          setFormError(`Vì lý do bảo mật, bạn chỉ có thể yêu cầu sau ${newCooldown} giây nữa.`)
        } else {
          setFormError(getErrorMessage(new Error(error || "")))
          toast({
            title: "Yêu cầu thất bại",
            description: getErrorMessage(new Error(error || "")),
            variant: "destructive",
          })
        }
        return
      }

      setEmailSent(true)
      // Đặt cooldown 1800 giây (30 phút) sau khi gửi thành công để đảm bảo không vượt quá giới hạn 2 email/giờ
      setCooldown(1800)
      toast({
        title: "Email đã được gửi",
        description: "Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu",
      })

      // Reset form sau khi gửi thành công
      form.reset()
    } catch (error) {
      console.error("Reset password error:", error)
      setFormError(getErrorMessage(error))
      toast({
        title: "Yêu cầu thất bại",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (emailSent) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>

        <div className="bg-muted p-4 rounded-lg text-center">
          <h3 className="font-medium mb-2">Email đã được gửi!</h3>
          <p className="text-sm text-muted-foreground">
            Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư (và
            thư mục spam) để tiếp tục.
          </p>
        </div>

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
          onClick={() => {
            setEmailSent(false)
          }}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Gửi lại email (${cooldown}s)` : "Gửi lại email"}
        </Button>
      </div>
    )
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

      {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center mb-4">
        <Mail className="h-16 w-16 text-primary" />
      </div>

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

        {cooldown > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Thời gian chờ</span>
              <span>{cooldown}s</span>
            </div>
            <Progress value={cooldownProgress} className="h-2" />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting || cooldown > 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý
            </>
          ) : cooldown > 0 ? (
            `Gửi liên kết đặt lại mật khẩu (${cooldown}s)`
          ) : (
            "Gửi liên kết đặt lại mật khẩu"
          )}
        </Button>
      </form>
    </Form>
  )
}

