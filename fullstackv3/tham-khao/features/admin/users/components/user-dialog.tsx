"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AvatarUploader } from "./avatar-uploader"
import { useCreateUser } from "../hooks/use-create-user"
import { useUpdateUser } from "../hooks/use-update-user"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { PasswordInput } from "@/components/ui/password-input"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"

// Define the form schema with Zod
const userFormSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }).optional().or(z.literal("")),
  display_name: z.string().min(2, { message: "Tên hiển thị phải có ít nhất 2 ký tự" }),
  phone_number: z.string().optional(),
  role: z.enum(["admin", "staff", "shipper", "authenticated"]),
  gender: z.enum(["male", "female", "other"]).optional(),
  birth_date: z.string().optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: any
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const isEditing = !!user
  const { toast } = useSonnerToast()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null)

  // Initialize the form with default values or user data if editing
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email || "",
      password: "", // Always empty for security
      display_name: user?.display_name || "",
      phone_number: user?.phone_number || "",
      role: user?.role || "authenticated",
      gender: user?.gender || undefined,
      birth_date: user?.birth_date ? new Date(user.birth_date).toISOString().split("T")[0] : undefined,
    },
  })

  // Use the create and update mutations
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (isEditing) {
        // Update existing user
        await updateUser.mutateAsync({
          id: user.id,
          ...values,
          avatar_url: avatarUrl,
          // Only include password if it's provided
          ...(values.password ? { password: values.password } : {}),
        })
        toast.success("Cập nhật người dùng thành công")
      } else {
        // Create new user
        if (!values.password) {
          return toast.error("Mật khẩu là bắt buộc khi tạo người dùng mới")
        }
        await createUser.mutateAsync({
          ...values,
          avatar_url: avatarUrl,
        })
        toast.success("Tạo người dùng thành công")
      }
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin người dùng trong hệ thống."
              : "Thêm người dùng mới vào hệ thống. Người dùng sẽ nhận được email thông báo."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="avatar">Ảnh đại diện</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="email@example.com"
                            {...field}
                            disabled={isEditing} // Can't change email when editing
                          />
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
                        <FormLabel>{isEditing ? "Mật khẩu mới (tùy chọn)" : "Mật khẩu"}</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder={isEditing ? "Để trống nếu không thay đổi" : "Nhập mật khẩu"}
                            {...field}
                          />
                        </FormControl>
                        {isEditing && <FormDescription>Để trống nếu không muốn thay đổi mật khẩu</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên hiển thị</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyễn Văn A" {...field} />
                        </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="authenticated">Khách hàng</SelectItem>
                          <SelectItem value="shipper">Người giao hàng</SelectItem>
                          <SelectItem value="staff">Nhân viên</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Vai trò quyết định quyền hạn của người dùng trong hệ thống</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="avatar" className="space-y-4 py-4">
                <AvatarUploader userId={user?.id} initialAvatarUrl={user?.avatar_url} onAvatarChange={setAvatarUrl} />
              </TabsContent>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
                  {createUser.isPending || updateUser.isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Tạo mới"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
