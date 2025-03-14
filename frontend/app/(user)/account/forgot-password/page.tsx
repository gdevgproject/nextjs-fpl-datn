"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AccountSidebar } from "@/components/account/sidebar";
import { fetchUser } from "@/lib/mockData";
import { User } from "@/lib/mockData";

const formSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUser("user2");
      setUser(userData as User);
    };
    loadUser();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Thực hiện gọi API reset password ở đây
      console.log(values);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AccountSidebar user={user} />

        <div className="lg:col-span-3">
          <Card className="max-w-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                Quên mật khẩu
              </CardTitle>
              <CardDescription className="text-base text-gray-500">
                Nhập email của bạn để nhận link đặt lại mật khẩu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="example@example.com"
                            type="email"
                            disabled={isLoading}
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-sm" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-10 mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
