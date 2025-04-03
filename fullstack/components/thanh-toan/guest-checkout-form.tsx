"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordInput } from "@/components/ui/password-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, LogIn } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const guestFormSchema = z.object({
  name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ"),
  createAccount: z.boolean().optional(),
  password: z.string().optional(),
})

type GuestFormValues = z.infer<typeof guestFormSchema>

interface GuestCheckoutFormProps {
  onSubmit: (values: { name: string; email: string; phone: string }) => void
  onCancel: () => void
}

export function GuestCheckoutForm({ onSubmit, onCancel }: GuestCheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"guest" | "login">("guest")
  const { toast } = useToast()

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      createAccount: false,
      password: "",
    },
  })

  const createAccount = form.watch("createAccount")

  const handleSubmit = async (values: GuestFormValues) => {
    setIsSubmitting(true)
    try {
      if (values.createAccount && (!values.password || values.password.length < 6)) {
        form.setError("password", {
          type: "manual",
          message: "Mật khẩu phải có ít nhất 6 ký tự",
        })
        setIsSubmitting(false)
        return
      }

      // Nếu người dùng chọn tạo tài khoản, ở đây sẽ gọi API để tạo tài khoản
      if (values.createAccount && values.password) {
        // Giả lập tạo tài khoản
        await new Promise((resolve) => setTimeout(resolve, 1000))
        toast({
          title: "Tạo tài khoản thành công",
          description: "Bạn có thể sử dụng tài khoản này để đăng nhập sau này.",
        })
      }

      onSubmit({
        name: values.name,
        email: values.email,
        phone: values.phone,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tiếp tục thanh toán. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "guest" | "login")}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="guest" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Khách</span>
        </TabsTrigger>
        <TabsTrigger value="login" className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          <span>Đăng nhập</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="guest" className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập họ tên của bạn" {...field} />
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
                    <Input type="email" placeholder="Nhập email của bạn" {...field} />
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
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập số điện thoại của bạn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="createAccount"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tạo tài khoản cho lần mua sau</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Tạo tài khoản để theo dõi đơn hàng và lưu thông tin cho lần mua sau
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {createAccount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="Tạo mật khẩu (ít nhất 6 ký tự)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Tiếp tục"}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="login" className="mt-6">
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Đăng nhập để sử dụng thông tin đã lưu và theo dõi đơn hàng dễ dàng hơn
          </p>
          <Button asChild className="w-full">
            <Link href="/dang-nhap?redirect=/thanh-toan">
              <LogIn className="mr-2 h-4 w-4" />
              Đăng nhập
            </Link>
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}

