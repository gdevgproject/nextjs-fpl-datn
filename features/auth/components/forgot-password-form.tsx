"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "../validators";
import { useForgotPasswordMutation } from "../hooks";
import type { z } from "zod";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { useRouter } from "next/navigation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const { toast } = useSonnerToast();
  const { mutateAsync, isLoading } = useForgotPasswordMutation();
  const form = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    const result = await mutateAsync(values.email);
    if ("error" in result) {
      toast("Gửi thất bại", { description: result.error });
    } else {
      toast("Đã gửi email", {
        description: "Vui lòng kiểm tra hộp thư để nhận link đặt lại mật khẩu.",
      });
      router.push("/kiem-tra-email");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email của bạn</FormLabel>
              <FormControl>
                <Input placeholder="example@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Đang gửi…" : "Gửi link đặt lại mật khẩu"}
        </Button>
      </form>
    </Form>
  );
}
