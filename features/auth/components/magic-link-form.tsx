"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { forgotPasswordSchema } from "../validators";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
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

// Type for form values
type FormValues = z.infer<typeof forgotPasswordSchema>;

export function MagicLinkForm() {
  const router = useRouter();
  const { toast } = useSonnerToast();
  const supabase = getSupabaseBrowserClient();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: window.location.origin + "/api/auth/callback",
      },
    });
    setIsLoading(false);
    if (error) {
      toast("Gửi thất bại", { description: error.message });
    } else {
      toast("Đã gửi magic link", {
        description: "Vui lòng kiểm tra email để đăng nhập bằng Magic Link.",
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
          {isLoading ? "Đang gửi…" : "Gửi Magic Link"}
        </Button>
      </form>
    </Form>
  );
}
