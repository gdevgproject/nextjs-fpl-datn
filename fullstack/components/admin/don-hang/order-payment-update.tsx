"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { OrderRefundForm } from "./order-refund-form"

interface OrderPaymentUpdateProps {
  orderId: string
  currentPaymentStatus: string
  paymentMethod: string
  totalAmount: number
}

const paymentStatusSchema = z.object({
  status: z.string().min(1, "Trạng thái thanh toán là bắt buộc"),
  sendEmail: z.boolean().default(true),
})

type PaymentStatusFormValues = z.infer<typeof paymentStatusSchema>

export function OrderPaymentUpdate({
  orderId,
  currentPaymentStatus,
  paymentMethod,
  totalAmount,
}: OrderPaymentUpdateProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const form = useForm<PaymentStatusFormValues>({
    resolver: zodResolver(paymentStatusSchema),
    defaultValues: {
      status: currentPaymentStatus,
      sendEmail: true,
    },
  })

  const watchStatus = form.watch("status")
  const showRefundOption = watchStatus === "Refunded" && currentPaymentStatus !== "Refunded"

  const onSubmit = async (data: PaymentStatusFormValues) => {
    setIsUpdating(true)

    // Giả lập cập nhật trạng thái thanh toán
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsUpdating(false)

    toast({
      title: "Cập nhật trạng thái thanh toán thành công",
      description: `Trạng thái thanh toán của đơn hàng #${orderId} đã được cập nhật sang ${data.status}`,
      duration: 3000,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cập nhật trạng thái thanh toán</CardTitle>
        <CardDescription>Cập nhật trạng thái thanh toán của đơn hàng</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái thanh toán</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái thanh toán" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Chờ thanh toán</SelectItem>
                      <SelectItem value="Paid">Đã thanh toán</SelectItem>
                      <SelectItem value="Failed">Thanh toán thất bại</SelectItem>
                      <SelectItem value="Refunded">Đã hoàn tiền</SelectItem>
                      <SelectItem value="Partially Refunded">Hoàn tiền một phần</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Phương thức thanh toán: {paymentMethod}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sendEmail"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Gửi email thông báo</FormLabel>
                    <FormDescription>Gửi email thông báo cập nhật trạng thái thanh toán đến khách hàng</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {showRefundOption && (
              <div className="rounded-md border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-3">
                  Khi chuyển trạng thái sang "Đã hoàn tiền", bạn cần xử lý hoàn tiền cho khách hàng.
                </p>
                <OrderRefundForm orderId={orderId} totalAmount={totalAmount} paymentMethod={paymentMethod} />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <span className="mr-2">Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Cập nhật trạng thái
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

