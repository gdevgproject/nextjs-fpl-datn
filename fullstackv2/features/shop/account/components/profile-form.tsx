"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useUpdateProfile } from "../hooks/use-update-profile"
import type { ProfileData } from "../types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/shared/lib/utils"
import { CalendarIcon } from "lucide-react"

const profileSchema = z.object({
  display_name: z.string().min(2, {
    message: "Tên hiển thị phải có ít nhất 2 ký tự",
  }),
  phone_number: z
    .string()
    .regex(/^\d+$/, { message: "Số điện thoại chỉ được chứa các chữ số" })
    .min(10, { message: "Số điện thoại phải có ít nhất 10 chữ số" })
    .max(15, { message: "Số điện thoại không được vượt quá 15 chữ số" })
    .optional()
    .nullable(),
  gender: z.string().optional().nullable(),
  birth_date: z.date().optional().nullable(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  profile: ProfileData | null
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { updateProfile, isUpdating } = useUpdateProfile()
  const [success, setSuccess] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: profile?.display_name || "",
      phone_number: profile?.phone_number || "",
      gender: profile?.gender || "",
      birth_date: profile?.birth_date ? new Date(profile.birth_date) : undefined,
    },
  })

  async function onSubmit(values: ProfileFormValues) {
    setSuccess(false)
    try {
      await updateProfile(values)
      setSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Failed to update profile:", error)
    }
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
                <Input placeholder="Nhập tên hiển thị" {...field} />
              </FormControl>
              <FormDescription>Tên này sẽ được hiển thị trên trang web và trong các đơn hàng của bạn.</FormDescription>
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
                <Input placeholder="Nhập số điện thoại" {...field} value={field.value || ""} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
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
            <FormItem className="flex flex-col">
              <FormLabel>Ngày sinh</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày sinh</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              "Cập nhật thông tin"
            )}
          </Button>
          {success && <p className="text-sm text-green-600">Cập nhật thành công!</p>}
        </div>
      </form>
    </Form>
  )
}
