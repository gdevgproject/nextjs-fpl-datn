"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

const paymentMethodSchema = z.object({
  name: z.string().min(2, {
    message: "Tên phương thức phải có ít nhất 2 ký tự",
  }),
  description: z.string().min(5, {
    message: "Mô tả phải có ít nhất 5 ký tự",
  }),
  instructions: z.string().min(5, {
    message: "Hướng dẫn phải có ít nhất 5 ký tự",
  }),
  is_active: z.boolean().default(true),
  fee: z.string().default("0"),
  fee_type: z.enum(["fixed", "percentage"]).default("fixed"),
})

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>

interface PaymentMethodFormProps {
  initialData?: any
  onSave: (data: any) => void
  isLoading: boolean
}

export function PaymentMethodForm({ initialData, onSave, isLoading }: PaymentMethodFormProps) {
  const [showFeeOptions, setShowFeeOptions] = useState<boolean>(initialData?.fee !== "0")

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      instructions: "",
      is_active: true,
      fee: "0",
      fee_type: "fixed",
    },
    mode: "onChange",
  })

  function onSubmit(data: PaymentMethodFormValues) {
    onSave({
      ...data,
      id: initialData?.id || null,
      icon: initialData?.icon || null,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên phương thức thanh toán</FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: Thanh toán khi nhận hàng (COD)" {...field} />
              </FormControl>
              <FormDescription>Tên phương thức thanh toán sẽ hiển thị cho khách hàng</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả ngắn</FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: Thanh toán bằng tiền mặt khi nhận hàng" {...field} />
              </FormControl>
              <FormDescription>Mô tả ngắn gọn về phương thức thanh toán</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hướng dẫn thanh toán</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập hướng dẫn chi tiết về cách thanh toán"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Hướng dẫn chi tiết sẽ hiển thị cho khách hàng khi họ chọn phương thức này
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Phí thanh toán</h3>
              <p className="text-sm text-muted-foreground">Áp dụng phí cho phương thức thanh toán này</p>
            </div>
            <Switch
              checked={showFeeOptions}
              onCheckedChange={(checked) => {
                setShowFeeOptions(checked)
                if (!checked) {
                  form.setValue("fee", "0")
                }
              }}
            />
          </div>

          {showFeeOptions && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fee_type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Loại phí</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="fixed" />
                          </FormControl>
                          <FormLabel className="font-normal">Cố định (VNĐ)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="percentage" />
                          </FormControl>
                          <FormLabel className="font-normal">Phần trăm (%)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <Separator />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Trạng thái</FormLabel>
                <FormDescription>Kích hoạt hoặc vô hiệu hóa phương thức thanh toán này</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
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
        </DialogFooter>
      </form>
    </Form>
  )
}

