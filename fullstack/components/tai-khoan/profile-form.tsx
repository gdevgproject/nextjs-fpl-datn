"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { AvatarUpload } from "@/components/tai-khoan/avatar-upload"
import { updateProfile } from "@/actions/profile-actions"
import type { Tables } from "@/types/supabase"
import { Loader2 } from "lucide-react"

const profileFormSchema = z.object({
  display_name: z
    .string()
    .min(2, {
      message: "Tên hiển thị phải có ít nhất 2 ký tự",
    })
    .max(50, {
      message: "Tên hiển thị không được vượt quá 50 ký tự",
    }),
  phone_number: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, {
    message: "Số điện thoại không hợp lệ",
  }),
  gender: z.string().optional(),
  birth_date: z.string().optional(),
  avatar_url: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  profile: Tables<"profiles"> | null
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: profile?.display_name || "",
      phone_number: profile?.phone_number || "",
      gender: profile?.gender || "",
      birth_date: profile?.birth_date ? new Date(profile.birth_date).toISOString().split("T")[0] : "",
      avatar_url: profile?.avatar_url || "",
    },
  })

  async function onSubmit(values: ProfileFormValues) {
    try {
      setIsSubmitting(true)

      const result = await updateProfile(values)

      if (result.success) {
        toast({
          title: "Cập nhật thành công",
          description: "Thông tin tài khoản của bạn đã được cập nhật",
        })
      } else {
        toast({
          title: "Cập nhật thất bại",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Cập nhật thất bại",
        description: "Đã xảy ra lỗi khi cập nhật thông tin tài khoản",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-center mb-6">
          <AvatarUpload
            currentAvatarUrl={profile?.avatar_url || ""}
            onAvatarChange={(url) => form.setValue("avatar_url", url)}
          />
        </div>

        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên hiển thị</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên hiển thị" {...field} />
              </FormControl>
              <FormDescription>Tên này sẽ được hiển thị trên trang web và trong đánh giá của bạn.</FormDescription>
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
                <Input placeholder="Nhập số điện thoại" {...field} />
              </FormControl>
              <FormDescription>Ví dụ: 0912345678 hoặc +84912345678</FormDescription>
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang cập nhật
            </>
          ) : (
            "Cập nhật thông tin"
          )}
        </Button>
      </form>
    </Form>
  )
}

