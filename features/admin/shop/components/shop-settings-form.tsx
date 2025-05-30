"use client";

import { useState, useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useShopSettings } from "../hooks/use-shop-settings";
import { useUpdateShopSettings } from "../hooks/use-update-shop-settings";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { ShopSettingsFormValues, shopSettingsSchema } from "../types";
import { LogoUploader } from "./logo-uploader";
import { Skeleton } from "@/components/ui/skeleton";

const defaultValues: ShopSettingsFormValues = {
  shop_name: "",
  contact_email: null,
  contact_phone: null,
  address: null,
  facebook_url: null,
  messenger_url: null,
  zalo_url: null,
  instagram_url: null,
  tiktok_url: null,
  youtube_url: null,
  refund_policy_text: null,
  shipping_policy_text: null,
  privacy_policy_text: null,
  terms_conditions_text: null,
  default_shipping_fee: 0,
  order_confirmation_sender_email: null,
};

export function ShopSettingsForm() {
  const toast = useSonnerToast();
  const [activeTab, setActiveTab] = useState("general");

  const { data: shopSettings, isLoading } = useShopSettings();
  const { mutate: updateShopSettings, isPending: isUpdating } =
    useUpdateShopSettings();

  const form = useForm<ShopSettingsFormValues>({
    resolver: zodResolver(shopSettingsSchema),
    defaultValues,
    // Mode set to onChange to validate fields as the user types
    mode: "onChange",
  });

  // Update form values when data is loaded from the API
  useEffect(() => {
    if (shopSettings) {
      form.reset(
        {
          shop_name: shopSettings.shop_name || "",
          contact_email: shopSettings.contact_email,
          contact_phone: shopSettings.contact_phone,
          address: shopSettings.address,
          facebook_url: shopSettings.facebook_url,
          messenger_url: shopSettings.messenger_url,
          zalo_url: shopSettings.zalo_url,
          instagram_url: shopSettings.instagram_url,
          tiktok_url: shopSettings.tiktok_url,
          youtube_url: shopSettings.youtube_url,
          refund_policy_text: shopSettings.refund_policy_text,
          shipping_policy_text: shopSettings.shipping_policy_text,
          privacy_policy_text: shopSettings.privacy_policy_text,
          terms_conditions_text: shopSettings.terms_conditions_text,
          default_shipping_fee: shopSettings.default_shipping_fee || 0,
          order_confirmation_sender_email:
            shopSettings.order_confirmation_sender_email,
        },
        { keepDirty: false }
      );
    }
  }, [shopSettings, form]);

  // Handle form submission
  function onSubmit(values: ShopSettingsFormValues) {
    if (!shopSettings) return;

    updateShopSettings(
      {
        id: shopSettings.id,
        ...values,
      },
      {
        onSuccess: () => {
          toast.success("Cập nhật thông tin cửa hàng thành công", {
            description: "Các thay đổi đã được lưu thành công.",
          });
        },
        onError: (error) => {
          toast.error("Lỗi khi cập nhật thông tin cửa hàng", {
            description:
              error.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
          });
        },
      }
    );
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">Thông tin chung</TabsTrigger>
            <TabsTrigger value="social">Mạng xã hội</TabsTrigger>
            <TabsTrigger value="policies">Chính sách</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cửa hàng</CardTitle>
                <CardDescription>
                  Cập nhật thông tin cơ bản của cửa hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="shop_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên cửa hàng</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên cửa hàng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="font-medium">Logo cửa hàng</div>
                  {shopSettings && (
                    <LogoUploader
                      shopId={shopSettings.id}
                      existingLogoUrl={shopSettings.shop_logo_url}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email liên hệ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@mybeauty.com"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại liên hệ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0123456789"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Địa chỉ cửa hàng"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="default_shipping_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phí vận chuyển mặc định (VNĐ)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1000" {...field} />
                      </FormControl>
                      <FormDescription>
                        Phí vận chuyển mặc định áp dụng cho tất cả đơn hàng
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order_confirmation_sender_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email gửi xác nhận đơn hàng</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="orders@mybeauty.com"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Email này sẽ được sử dụng để gửi xác nhận đơn hàng cho
                        khách hàng
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Mạng xã hội</CardTitle>
                <CardDescription>
                  Cập nhật liên kết đến các trang mạng xã hội của cửa hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="facebook_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://facebook.com/mybeauty"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="messenger_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Messenger</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://m.me/mybeauty"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zalo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zalo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://zalo.me/mybeauty"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagram_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://instagram.com/mybeauty"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tiktok_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TikTok</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://tiktok.com/@mybeauty"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="youtube_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://youtube.com/c/mybeauty"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle>Chính sách cửa hàng</CardTitle>
                <CardDescription>
                  Cập nhật các chính sách của cửa hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="refund_policy_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chính sách hoàn tiền</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập chính sách hoàn tiền của cửa hàng"
                          className="min-h-[150px] resize-y"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shipping_policy_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chính sách vận chuyển</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập chính sách vận chuyển của cửa hàng"
                          className="min-h-[150px] resize-y"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="privacy_policy_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chính sách bảo mật</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập chính sách bảo mật của cửa hàng"
                          className="min-h-[150px] resize-y"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms_conditions_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điều khoản và điều kiện</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập điều khoản và điều kiện của cửa hàng"
                          className="min-h-[150px] resize-y"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isUpdating || !form.formState.isDirty}
          >
            {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
