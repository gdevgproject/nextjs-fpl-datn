"use client";

import { AccountSidebar } from "@/components/account/sidebar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fetchUser } from "@/lib/mockData";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User } from "@/lib/mockData";
import { useRouter } from "next/navigation";
import Link from "next/link";

const addressFormSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  street: z.string().min(1, "Vui lòng nhập địa chỉ"),
  city: z.string().min(1, "Vui lòng nhập thành phố"),
  state: z.string().min(1, "Vui lòng nhập tỉnh/thành"),
  country: z.string().min(1, "Vui lòng nhập quốc gia"),
  zipCode: z.string().min(1, "Vui lòng nhập mã bưu điện"),
});

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditAddressPage({ params }: PageProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      country: "Việt Nam",
      zipCode: "",
    },
  });

  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUser("user2");
      setUser(userData as User);

      // Tìm địa chỉ cần edit và set form values
      const address = userData?.addresses?.find(
        (addr) => addr.id === params.id
      );
      if (address) {
        form.reset({
          fullName: userData?.name,
          phone: userData?.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          country: address.country,
          zipCode: address.zipCode,
        });
      }

      setLoading(false);
    };
    loadUser();
  }, [params.id, form]);

  async function onSubmit(values: z.infer<typeof addressFormSchema>) {
    try {
      // Xử lý cập nhật địa chỉ ở đây
      console.log(values);
      router.push("/account/addresses");
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <AccountSidebar user={user} />
        </div>

        <div className="lg:col-span-9">
          <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 space-x-2">
              <Link href="/account/addresses" className="hover:text-gray-700">
                Sổ địa chỉ
              </Link>
              <span>/</span>
              <span className="text-gray-900">Chỉnh sửa địa chỉ</span>
            </nav>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Thông tin liên hệ */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Thông tin liên hệ
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập họ tên..." {...field} />
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
                            <Input
                              placeholder="Nhập số điện thoại..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Thông tin địa chỉ */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Thông tin địa chỉ
                  </h2>
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa chỉ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Số nhà, tên đường..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thành phố</FormLabel>
                          <FormControl>
                            <Input placeholder="Thành phố..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tỉnh/Thành phố</FormLabel>
                          <FormControl>
                            <Input placeholder="Tỉnh/Thành phố..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quốc gia</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã bưu điện</FormLabel>
                          <FormControl>
                            <Input placeholder="Mã bưu điện..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.push("/account/addresses")}
                  >
                    Hủy
                  </Button>
                  <Button type="submit">Lưu thay đổi</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
