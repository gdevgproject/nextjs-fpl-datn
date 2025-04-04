"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { ShopLogoUpload } from "./shop-logo-upload"
import { ShopFaviconUpload } from "./shop-favicon-upload"
import { ShopSocialLinks } from "./shop-social-links"
import { ShopContactInfo } from "./shop-contact-info"
import { ShopBusinessHours } from "./shop-business-hours"

const shopInfoSchema = z.object({
  shop_name: z.string().min(2, {
    message: "Tên cửa hàng phải có ít nhất 2 ký tự",
  }),
  contact_email: z.string().email({
    message: "Email không hợp lệ",
  }),
  contact_phone: z.string().min(10, {
    message: "Số điện thoại không hợp lệ",
  }),
  address: z.string().min(5, {
    message: "Địa chỉ phải có ít nhất 5 ký tự",
  }),
  short_description: z
    .string()
    .max(500, {
      message: "Mô tả ngắn không được vượt quá 500 ký tự",
    })
    .optional(),
})

type ShopInfoFormValues = z.infer<typeof shopInfoSchema>

// Giả lập dữ liệu ban đầu
const defaultValues: Partial<ShopInfoFormValues> = {
  shop_name: "MyBeauty",
  contact_email: "contact@mybeauty.vn",
  contact_phone: "0987654321",
  address: "123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
  short_description:
    "MyBeauty - Cửa hàng nước hoa cao cấp với các sản phẩm chính hãng từ các thương hiệu nổi tiếng trên thế giới.",
}

export function ShopInfoForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("general")
  const { toast } = useToast()

  const form = useForm<ShopInfoFormValues>({
    resolver: zodResolver(shopInfoSchema),
    defaultValues,
    mode: "onChange",
  })

  function onSubmit(data: ShopInfoFormValues) {
    setIsLoading(true)

    // Giả lập API call
    setTimeout(() => {
      console.log(data)
      setIsLoading(false)
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin cửa hàng đã được cập nhật",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="general">Thông tin chung</TabsTrigger>
            <TabsTrigger value="contact">Liên hệ</TabsTrigger>
            <TabsTrigger value="logo">Logo & Favicon</TabsTrigger>
            <TabsTrigger value="social">Mạng xã hội</TabsTrigger>
            <TabsTrigger value="hours">Giờ làm việc</TabsTrigger>
          </TabsList>

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto" onClick={form.handleSubmit(onSubmit)}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="general" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin chung</CardTitle>
                  <CardDescription>Cập nhật thông tin cơ bản của cửa hàng</CardDescription>
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
                        <FormDescription>
                          Tên cửa hàng sẽ được hiển thị trên website và các tài liệu liên quan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="short_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả ngắn</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập mô tả ngắn về cửa hàng"
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Mô tả ngắn gọn về cửa hàng, sẽ được hiển thị ở một số nơi trên website
                        </FormDescription>
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
                          <Input placeholder="Nhập địa chỉ cửa hàng" {...field} />
                        </FormControl>
                        <FormDescription>Địa chỉ chính của cửa hàng</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="mt-0">
              <ShopContactInfo form={form} />
            </TabsContent>

            <TabsContent value="logo" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Logo & Favicon</CardTitle>
                  <CardDescription>Cập nhật logo và favicon của cửa hàng</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Logo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Logo sẽ được hiển thị trên website, email và các tài liệu liên quan
                    </p>
                    <ShopLogoUpload />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium">Favicon</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Favicon là biểu tượng nhỏ hiển thị trên tab trình duyệt
                    </p>
                    <ShopFaviconUpload />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="mt-0">
              <ShopSocialLinks />
            </TabsContent>

            <TabsContent value="hours" className="mt-0">
              <ShopBusinessHours />
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  )
}

