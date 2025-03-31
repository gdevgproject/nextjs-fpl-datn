"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { Loader2, CheckCircle, Mail, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { createClientSupabaseClient } from "@/lib/supabase/supabase-client"

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
  const [isSuccess, setIsSuccess] = useState(false)

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
      // Set initial progress to 0 when cooldown starts
      setCooldownProgress(0)

      // Calculate the interval for smooth updates (aim for ~60 updates during the cooldown)
      const updateInterval = Math.max(50, Math.floor((cooldown * 1000) / 60))

      // Start the countdown timer
      cooldownTimerRef.current = setTimeout(() => {
        setCooldown((prevCooldown) => prevCooldown - 1)
      }, 1000)

      // Create a separate timer for smooth progress updates
      progressTimerRef.current = setInterval(() => {
        setCooldownProgress((prevProgress) => {
          // Calculate exact progress based on initial cooldown and elapsed time
          const elapsedRatio = (cooldown - 1 + (Date.now() % 1000) / 1000) / cooldown
          const newProgress = 100 - elapsedRatio * 100
          return Math.min(newProgress, 100)
        })
      }, updateInterval)
    } else {
      // When cooldown reaches 0, ensure progress is at 100%
      setCooldownProgress(100)

      // Clear any existing timers
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }
    }

    // Cleanup function to clear timers when component unmounts or cooldown changes
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current)
        cooldownTimerRef.current = null
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }
    }
  }, [cooldown])

  // Cập nhật thời gian cooldown để phản ánh giới hạn tốc độ gửi email
  async function onSubmit(values: z.infer<typeof forgotPasswordFormSchema>) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const supabase = createClientSupabaseClient()
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/dat-lai-mat-khau`,
      })

      if (error) {
        // Check if it's a cooldown error
        if (error.message.includes("For security purposes, you can only request this")) {
          // Try to extract the waiting time from the error message
          const waitTimeMatch = error.message.match(/after (\d+) seconds/)
          const waitTime = waitTimeMatch ? Number.parseInt(waitTimeMatch[1], 10) : 60

          setCooldown(waitTime)
          setFormError(`Vui lòng đợi ${waitTime} giây trước khi yêu cầu lại.`)
        } else {
          setFormError(error.message)
        }
        setIsSubmitting(false)
        return
      }

      // Success
      setIsSuccess(true)
      setCooldown(60) // Set a cooldown to prevent spam
      startCooldown()
    } catch (error) {
      console.error("Reset password error:", error)
      setFormError("Đã xảy ra lỗi. Vui lòng thử lại sau.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const startCooldown = () => {
    setCooldownProgress(0)
    const updateInterval = Math.max(50, Math.floor((cooldown * 1000) / 60))

    cooldownTimerRef.current = setTimeout(() => {
      setCooldown((prevCooldown) => prevCooldown - 1)
    }, 1000)

    progressTimerRef.current = setInterval(() => {
      setCooldownProgress((prevProgress) => {
        const elapsedRatio = (cooldown - 1 + (Date.now() % 1000) / 1000) / cooldown
        const newProgress = 100 - elapsedRatio * 100
        return Math.min(newProgress, 100)
      })
    }, updateInterval)
  }

  // Thêm nút quay lại trang đăng nhập ở cuối form
  if (isSuccess) {
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
            setIsSuccess(false)
          }}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Gửi lại email (${cooldown}s)` : "Gửi lại email"}
        </Button>

        <Button type="button" className="w-full" variant="link" onClick={() => router.push("/dang-nhap")}>
          Quay lại đăng nhập
        </Button>
      </motion.div>
    )
  }

  return (
    <Form {...form}>
      {(error || errorCode || errorDescription) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
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

      {formError && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Alert variant="destructive" className="mb-4 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-primary/10 p-3">
          <Mail className="h-10 w-10 text-primary" />
        </div>
      </div>

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
          type="submit"
          className="w-full transition-all duration-200 hover:bg-primary/90"
          disabled={isSubmitting || cooldown > 0}
        >
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

        <Button type="button" className="w-full" variant="link" onClick={() => router.push("/dang-nhap")}>
          Quay lại đăng nhập
        </Button>
      </form>
    </Form>
  )
}

