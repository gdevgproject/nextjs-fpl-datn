"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { getErrorMessage, checkEmailExists } from "@/lib/auth/auth-utils"
import { Loader2 } from "lucide-react"

const forgotPasswordFormSchema = z.object({
  email: z.string().email({
    message: "Email không hợp lệ",
  }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      setIsSubmitting(true)

      // Check if email exists
      const emailExists = await checkEmailExists(values.email)

      if (!emailExists) {
        // Still show success message for security reasons
        setEmailSent(true)
        toast({
          title: "Email đã được gửi",
          description: "Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu",
        })
        return
      }

      const { success, error } = await resetPassword(values.email)

      if (!success) {
        toast({
          title: "Yêu cầu thất bại",
          description: getErrorMessage(new Error(error)),
          variant: "destructive",
        })
        return
      }

      setEmailSent(true)
      toast({
        title: "Email đã được gửi",
        description: "Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu",
      })
    } catch (error) {
      console.error("Reset password error:", error)
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
        <div className="bg-muted p-4 rounded-lg text-center">
          <h3 className="font-medium mb-2">Email đã được gửi!</h3>
          <p className="text-sm text-muted-foreground">
            Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư (và
            thư mục spam) để tiếp tục.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setEmailSent(false)
            form.reset()
          }}
        >
          Gửi lại email
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" type="email" {...field} />
              </FormControl>
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
            "Gửi liên kết đặt lại mật khẩu"
          )}
        </Button>
      </form>
    </Form>
  )
}

