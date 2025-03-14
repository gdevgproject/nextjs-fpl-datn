"use client"

import { Button } from "@/components/ui/Button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/Input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { CheckoutFormData } from "../types/checkoutTypes"

const formSchema = z.object({
  deliveryMethod: z.enum(["delivery", "pickup"]),
  customerInfo: z.object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
    email: z.string().email("Email không hợp lệ").optional(),
  }),
  shippingAddress: z.object({
    fullName: z.string().min(2, "Họ tên người nhận phải có ít nhất 2 ký tự"),
    phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
    province: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
    district: z.string().min(1, "Vui lòng chọn quận/huyện"),
    ward: z.string().min(1, "Vui lòng chọn phường/xã"),
    address: z.string().min(5, "Vui lòng nhập địa chỉ cụ thể"),
    note: z.string().optional(),
  }),
  needInvoice: z.boolean(),
  paymentMethod: z.enum(["cod", "qr", "bank", "card", "zalopay", "momo", "vnpay"]),
})

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void
  isLoading?: boolean
}

export function CheckoutForm({ onSubmit, isLoading }: CheckoutFormProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery")

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryMethod: "delivery",
      customerInfo: {
        fullName: "",
        phone: "",
        email: "",
      },
      shippingAddress: {
        fullName: "",
        phone: "",
        province: "",
        district: "",
        ward: "",
        address: "",
        note: "",
      },
      needInvoice: false,
      paymentMethod: "cod",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Phương thức giao hàng */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Chọn hình thức nhận hàng</h2>
          <FormField
            control={form.control}
            name="deliveryMethod"
            render={({ field }) => (
              <RadioGroup
                onValueChange={(value: "delivery" | "pickup") => {
                  field.onChange(value)
                  setDeliveryMethod(value)
                }}
                defaultValue={field.value}
                className="flex gap-4"
              >
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <label htmlFor="delivery">Giao hàng tận nơi</label>
                    </div>
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <label htmlFor="pickup">Nhận tại nhà thuốc</label>
                    </div>
                  </FormControl>
                </FormItem>
              </RadioGroup>
            )}
          />
        </div>

        {/* Thông tin người đặt */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Thông tin người đặt</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="customerInfo.fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập họ và tên" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerInfo.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập số điện thoại" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerInfo.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (không bắt buộc)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Địa chỉ nhận hàng */}
        {deliveryMethod === "delivery" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Địa chỉ nhận hàng</h2>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="shippingAddress.fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên người nhận</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập họ và tên người nhận" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingAddress.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập số điện thoại" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="shippingAddress.province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tỉnh/Thành phố</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn tỉnh/thành phố" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hanoi">Hà Nội</SelectItem>
                          <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shippingAddress.district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quận/Huyện</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn quận/huyện" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="q1">Quận 1</SelectItem>
                          <SelectItem value="q2">Quận 2</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shippingAddress.ward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phường/Xã</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn phường/xã" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="p1">Phường 1</SelectItem>
                          <SelectItem value="p2">Phường 2</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="shippingAddress.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ cụ thể</FormLabel>
                    <FormControl>
                      <Input placeholder="Số nhà, tên đường..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingAddress.note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú (không bắt buộc)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="VD: Hãy gọi cho tôi 15 phút trước khi giao hàng"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Yêu cầu xuất hóa đơn */}
        <div className="bg-white p-6 rounded-lg shadow">
          <FormField
            control={form.control}
            name="needInvoice"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel>Yêu cầu xuất hóa đơn điện tử</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Phương thức thanh toán */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-4"
              >
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod" />
                      <label htmlFor="cod" className="flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded">
                          💵
                        </span>
                        <span>Thanh toán tiền mặt khi nhận hàng</span>
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="qr" id="qr" />
                      <label htmlFor="qr" className="flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded">
                          📱
                        </span>
                        <span>Thanh toán bằng chuyển khoản (QR Code)</span>
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bank" id="bank" />
                      <label htmlFor="bank" className="flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded">
                          🏦
                        </span>
                        <span>Thanh toán qua ngân hàng</span>
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <label htmlFor="card" className="flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded">
                          💳
                        </span>
                        <span>Thanh toán bằng thẻ</span>
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="zalopay" id="zalopay" />
                      <label htmlFor="zalopay" className="flex items-center gap-2">
                        <img src="/zalopay-logo.png" alt="ZaloPay" className="w-8 h-8" />
                        <span>Thanh toán qua ZaloPay</span>
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="momo" id="momo" />
                      <label htmlFor="momo" className="flex items-center gap-2">
                        <img src="/momo-logo.png" alt="MoMo" className="w-8 h-8" />
                        <span>Thanh toán qua MoMo</span>
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vnpay" id="vnpay" />
                      <label htmlFor="vnpay" className="flex items-center gap-2">
                        <img src="/vnpay-logo.png" alt="VNPay" className="w-8 h-8" />
                        <span>Thanh toán qua VNPay</span>
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
              </RadioGroup>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : "Đặt hàng"}
        </Button>
      </form>
    </Form>
  )
}
