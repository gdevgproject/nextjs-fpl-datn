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
  const { mutateAsync, isPending } = useForgotPasswordMutation();
  const form = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    const result = await mutateAsync(values.email);
    if ("error" in result) {
      // Dịch các thông báo bảo mật mặc định sang tiếng Việt
      let msg = result.error;
      if (msg.startsWith("For security purposes")) {
        // Lấy số giây nếu có
        const match = msg.match(/(\d+)/);
        const seconds = match ? match[1] : "";
        msg = seconds
          ? `Vì lý do bảo mật, bạn chỉ có thể gửi lại sau ${seconds} giây.`
          : "Vì lý do bảo mật, vui lòng thử lại sau.";
      }
      toast("Gửi thất bại", { description: msg });
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
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Đang gửi…" : "Gửi link đặt lại mật khẩu"}
        </Button>
      </form>
    </Form>
  );
}
