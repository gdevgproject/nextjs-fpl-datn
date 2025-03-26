"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { getErrorMessage } from "@/lib/auth/auth-utils"
import { Loader2 } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase/supabaseClient"

const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, {
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>

export function ResetPasswordForm() {
  const { updatePassword } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(true)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    // Check if we have a valid session with reset token
    const checkToken = async () => {
      try {
        const supabase = createClientSupabaseClient()
        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
          setIsTokenValid(false)
          toast({
            title: "Liên kết không hợp lệ",
            description: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error checking reset token:", error)
        setIsTokenValid(false)
      }
    }

    checkToken()
  }, [toast])

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!isTokenValid) {
      toast({
        title: "Liên kết không hợp lệ",
        description: "Vui lòng yêu cầu liên kết đặt lại mật khẩu mới",
        variant: "destructive",
      })
      router.push("/quen-mat-khau")
      return
    }

    try {
      setIsSubmitting(true)

      const { success, error } = await updatePassword(values.password)

      if (!success) {
        toast({
          title: "Đặt lại mật khẩu thất bại",
          description: getErrorMessage(new Error(error)),
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Đặt lại mật khẩu thành công",
        description: "Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.",
      })

      router.push("/dang-nhap")
    } catch (error) {
      console.error("Reset password error:", error)
      toast({
        title: "Đặt lại mật khẩu thất bại",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isTokenValid) {
    return (
      <div className="space-y-4 py-4">
        <div className="bg-destructive/10 p-4 rounded-lg text-center">
          <h3 className="font-medium mb-2 text-destructive">Liên kết không hợp lệ</h3>
          <p className="text-sm text-muted-foreground">
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.
          </p>
        </div>
        <Button type="button" className="w-full" onClick={() => router.push("/quen-mat-khau")}>
          Yêu cầu liên kết mới
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu mới</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" type="password" {...field} />
              </FormControl>
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
              <FormControl>
                <Input placeholder="••••••••" type="password" {...field} />
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
            "Đặt lại mật khẩu"
          )}
        </Button>
      </form>
    </Form>
  )
}

