"use client";

import { useEffect, memo, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { useUpdateUserProfile } from "../queries";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthQuery, useProfileQuery } from "@/features/auth/hooks";

// Define form validation schema with proper error messages
const profileFormSchema = z.object({
  display_name: z.string().min(2, {
    message: "Tên hiển thị phải có ít nhất 2 ký tự",
  }),
  phone_number: z
    .string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, {
      message: "Số điện thoại không hợp lệ",
    })
    .optional()
    .or(z.literal("")),
  gender: z.string().optional(),
  birth_date: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Using memo to prevent unnecessary re-renders
const ProfileForm = memo(function ProfileForm() {
  const { data: session } = useAuthQuery();
  const user = session?.user;
  const { data: profile } = useProfileQuery(user?.id);
  const { toast } = useSonnerToast();
  const router = useRouter();
  const updateProfileMutation = useUpdateUserProfile();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: profile?.display_name || "",
      phone_number: profile?.phone_number || "",
      gender: profile?.gender || "",
      birth_date: profile?.birth_date
        ? new Date(profile.birth_date).toISOString().split("T")[0]
        : "",
    },
    mode: "onChange", // Validate on change for better UX
  });

  // Reset form when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        display_name: profile.display_name || "",
        phone_number: profile.phone_number || "",
        gender: profile.gender || "",
        birth_date: profile.birth_date
          ? new Date(profile.birth_date).toISOString().split("T")[0]
          : "",
      });
    }
  }, [profile, form]);

  // Enhanced form submission with better error handling
  const onSubmit = useCallback(
    async (data: ProfileFormValues) => {
      if (!user?.id) {
        toast("Lỗi cập nhật", {
          description: "Bạn cần đăng nhập để thực hiện thao tác này",
        });
        return;
      }

      try {
        await updateProfileMutation.mutateAsync(data);

        // Chuyển hướng với status để hiển thị thông báo thành công
        router.push("/tai-khoan?status=profile_updated");
      } catch (error) {
        toast("Cập nhật thất bại", {
          description:
            error instanceof Error
              ? error.message
              : "Đã xảy ra lỗi khi cập nhật thông tin",
        });

        // Khi có lỗi, vẫn phải refresh cache để đảm bảo dữ liệu mới nhất
        if (user?.id) {
          queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
        }
      }
    },
    [updateProfileMutation, router, toast, user?.id, queryClient]
  );

  // Quick check if form is dirty (has changes)
  const hasChanges = form.formState.isDirty;

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
                <Input
                  placeholder="Nguyễn Văn A"
                  {...field}
                  disabled={updateProfileMutation.isPending}
                />
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
                <Input
                  placeholder="0912345678"
                  {...field}
                  disabled={updateProfileMutation.isPending}
                />
              </FormControl>
              <FormDescription>
                Số điện thoại của bạn sẽ được sử dụng để liên hệ khi giao hàng
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới tính</FormLabel>
                <Select
                  disabled={updateProfileMutation.isPending}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Nam">Nam</SelectItem>
                    <SelectItem value="Nữ">Nữ</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
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
                  <Input
                    type="date"
                    {...field}
                    disabled={updateProfileMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={updateProfileMutation.isPending || !hasChanges}
        >
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
  );
});

export { ProfileForm };
