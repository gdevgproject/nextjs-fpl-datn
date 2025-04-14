"use client"

import { useState } from "react"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { PasswordInput } from "@/components/ui/password-input"
import { toast } from "sonner"
import { useAuth } from "@/features/auth/context/auth-context"

const loginSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email format" }).min(5),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/\d/, { message: "Password must include at least one number" }),
})

export default function LoginForm() {
  const [isPending, setIsPending] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const redirectTo = searchParams.get("redirect") || "/"

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsPending(true)
    try {
      const { error } = await login(values.email, values.password)

      if (error) {
        toast.error("Đăng nhập thất bại: " + error.message)
        return
      }

      router.push(redirectTo)
      toast.success("Đăng nhập thành công!")
    } catch (error) {
      toast.error("Đã xảy ra lỗi không mong muốn")
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="password" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full mt-8" disabled={isPending}>
            {isPending ? (
              <div className="flex items-center justify-center gap-1">
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                <span>Đang đăng nhập...</span>
              </div>
            ) : (
              "Đăng nhập"
            )}
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
        </div>
      </div>
      <Button variant="outline" asChild>
        <Link href="/register">Tạo tài khoản mới</Link>
      </Button>
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
