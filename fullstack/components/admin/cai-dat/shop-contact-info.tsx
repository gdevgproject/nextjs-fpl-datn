"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export function ShopContactInfo({ form }: { form: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin liên hệ</CardTitle>
        <CardDescription>Cập nhật thông tin liên hệ của cửa hàng</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email liên hệ</FormLabel>
                <FormControl>
                  <Input placeholder="contact@example.com" {...field} />
                </FormControl>
                <FormDescription>Email này sẽ được sử dụng để nhận thông báo và liên hệ từ khách hàng</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="0987654321" {...field} />
                </FormControl>
                <FormDescription>Số điện thoại liên hệ của cửa hàng</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Thông tin bổ sung</h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <FormItem>
                <FormLabel>Hotline hỗ trợ</FormLabel>
                <FormControl>
                  <Input placeholder="1900xxxx" />
                </FormControl>
                <FormDescription>Số hotline hỗ trợ khách hàng</FormDescription>
              </FormItem>

              <FormItem>
                <FormLabel>Email hỗ trợ</FormLabel>
                <FormControl>
                  <Input placeholder="support@example.com" />
                </FormControl>
                <FormDescription>Email hỗ trợ khách hàng</FormDescription>
              </FormItem>
            </div>

            <div>
              <FormItem>
                <FormLabel>Thông tin liên hệ khác</FormLabel>
                <FormControl>
                  <Textarea placeholder="Nhập thông tin liên hệ khác" className="resize-none h-[120px]" />
                </FormControl>
                <FormDescription>Thông tin liên hệ bổ sung sẽ được hiển thị trên trang liên hệ</FormDescription>
              </FormItem>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

