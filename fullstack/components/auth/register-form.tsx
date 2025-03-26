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
import { getErrorMessage } from "@/lib/auth/auth-utils"
import { Loader2 } from "lucide-react"

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

type RegisterFormValues = z.infer<typeof registerFormSchema>

export function RegisterForm() {
  const { signUp } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      displayName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    try {
      setIsSubmitting(true)

      const { success, error } = await signUp(values.email, values.password, {
        display_name: values.displayName,
        phone_number: values.phoneNumber,
      })

      if (!success) {
        toast({
          title: "Đăng ký thất bại",
          description: getErrorMessage(new Error(error)),
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng kiểm tra email của bạn để xác nhận tài khoản",
      })

      router.push("/xac-nhan-email")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Đăng ký thất bại",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên hiển thị</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên hiển thị" {...field} />
              </FormControl>
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
              <FormControl>
                <Input placeholder="Nhập số điện thoại" {...field} />
              </FormControl>
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
              <FormControl>
                <Input placeholder="name@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
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
            "Đăng ký"
          )}
        </Button>
      </form>
    </Form>
  )
}

