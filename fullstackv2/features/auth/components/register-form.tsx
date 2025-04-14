"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/ui/icons"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { PasswordInput } from "@/components/ui/password-input"
import { toast } from "sonner"
import { useAuth } from "@/features/auth/context/auth-context"

const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Tên phải có ít nhất 2 ký tự" })
      .max(50, { message: "Tên không được vượt quá 50 ký tự" }),

    email: z.string().email({ message: "Email không hợp lệ" }),

    phone: z
      .string()
      .regex(/^\d+$/, { message: "Số điện thoại chỉ được chứa các chữ số" })
      .min(10, { message: "Số điện thoại phải có ít nhất 10 chữ số" })
      .max(15, { message: "Số điện thoại không được vượt quá 15 chữ số" })
      .optional(),

    password: z
      .string()
      .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
      .regex(/[A-Z]/, {
        message: "Mật khẩu phải chứa ít nhất một chữ hoa",
      })
      .regex(/\d/, { message: "Mật khẩu phải chứa ít nhất một chữ số" })
      .regex(/[\W_]/, {
        message: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt",
      }),
    confirmPassword: z.string().min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  })

export default function RegisterForm() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const { register } = useAuth()

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsPending(true)
    try {
      const { error, user } = await register({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
      })

      if (error) {
        toast.error("Đăng ký thất bại: " + error.message)
        return
      }

      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.")
      router.push("/")
    } catch (error) {
      toast.error("Đã xảy ra lỗi không mong muốn")
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="grid gap-6">
        <Button variant="outline" type="button" disabled={isPending}>
          <Icons.google className="mr-2 h-4 w-4" />
          Đăng ký với Google
        </Button>
        <Separator />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} disabled={isPending} />
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
                      <Input placeholder="example@mail.com" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại (tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder="0123456789" {...field} disabled={isPending} />
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
                      <PasswordInput placeholder="Mật khẩu" {...field} disabled={isPending} />
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
                      <PasswordInput placeholder="Xác nhận mật khẩu" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button className="mt-8 w-full" type="submit" disabled={isPending}>
              {isPending ? (
                <div className="flex items-center justify-center gap-1">
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  <span>Đang đăng ký...</span>
                </div>
              ) : (
                "Đăng ký"
              )}
            </Button>
          </form>
        </Form>
      </div>
      <div className="text-center">
        <Link href="/login" className="w-full">
          <Button variant="outline" className="w-full">
            Quay lại đăng nhập
          </Button>
        </Link>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Đăng nhập với</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Button variant="outline" disabled={isPending}>
          {isPending ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}{" "}
          Google
        </Button>
        <Button variant="outline" disabled={isPending}>
          {isPending ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4" />
          )}{" "}
          GitHub
        </Button>
      </div>
    </div>
  )
}
