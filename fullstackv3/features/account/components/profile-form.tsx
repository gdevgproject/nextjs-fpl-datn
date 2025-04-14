"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/providers/auth-context"
import { useUpdateUserProfile } from "../queries"
import { Loader2 } from "lucide-react"

const profileFormSchema = z.object({
  display_name: z.string().min(2, {
    message: "Tên hiển thị phải có ít nhất 2 ký tự",
  }),
  phone_number: z
    .string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, { message: "Số điện thoại không hợp lệ" })
    .optional()
    .or(z.literal("")),
  gender: z.string().optional(),
  birth_date: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const updateProfileMutation = useUpdateUserProfile()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: profile?.display_name || "",
      phone_number: profile?.phone_number || "",
      gender: profile?.gender || "",
      birth_date: profile?.birth_date ? new Date(profile.birth_date).toISOString().split("T")[0] : "",
    },
  })

  // Cập nhật form khi profile thay đổi
  useEffect(() => {
    if (profile) {
      form.setValue("display_name", profile.display_name || "")
      form.setValue("phone_number", profile.phone_number || "")
      form.setValue("gender", profile.gender || "")
      form.setValue("birth_date", profile.birth_date ? new Date(profile.birth_date).toISOString().split("T")[0] : "")
    }
  }, [profile, form])

  async function onSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Cập nhật thành công",
          description: "Thông tin tài khoản đã được cập nhật",
        })
      },
      onError: (error) => {
        toast({
          title: "Cập nhật thất bại",
          description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật thông tin",
          variant: "destructive",
        })
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên hiển thị</FormLabel>
              <FormControl>
                <Input placeholder="Nguyễn Văn A" {...field} />
              </FormControl>
              <FormDescription>
                Tên này sẽ được hiển thị trên trang cá nhân và trong các đánh giá của bạn.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <FormControl>
                <Input placeholder="0912345678" {...field} />
              </FormControl>
              <FormDescription>Số điện thoại sẽ được sử dụng để liên hệ khi giao hàng.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giới tính</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birth_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày sinh</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang cập nhật...
            </>
          ) : (
            "Cập nhật thông tin"
          )}
        </Button>
      </form>
    </Form>
  )
}

