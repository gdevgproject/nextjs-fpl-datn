"use client"

import { useState } from "react"
import { Check, CreditCard, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

interface OrderRefundFormProps {
  orderId: string
  totalAmount: number
  paymentMethod: string
}

const refundFormSchema = z.object({
  refundAmount: z.string().min(1, "Số tiền hoàn trả là bắt buộc"),
  refundMethod: z.string().min(1, "Phương thức hoàn tiền là bắt buộc"),
  refundReason: z.string().min(1, "Lý do hoàn tiền là bắt buộc"),
  refundNote: z.string().optional(),
})

type RefundFormValues = z.infer<typeof refundFormSchema>

export function OrderRefundForm({ orderId, totalAmount, paymentMethod }: OrderRefundFormProps) {
  const [open, setOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const form = useForm<RefundFormValues>({
    resolver: zodResolver(refundFormSchema),
    defaultValues: {
      refundAmount: totalAmount.toString(),
      refundMethod: paymentMethod === "COD" ? "bank_transfer" : paymentMethod.toLowerCase(),
      refundReason: "customer_request",
      refundNote: "",
    },
  })

  const onSubmit = async (data: RefundFormValues) => {
    setIsProcessing(true)

    // Giả lập xử lý hoàn tiền
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsProcessing(false)
    setOpen(false)

    toast({
      title: "Hoàn tiền thành công",
      description: `Đã xử lý hoàn tiền cho đơn hàng #${orderId}`,
      duration: 3000,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CreditCard className="h-4 w-4" />
          <span>Xử lý hoàn tiền</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Xử lý hoàn tiền</DialogTitle>
          <DialogDescription>Hoàn tiền cho đơn hàng #{orderId}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="refundAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền hoàn trả</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} type="number" min="0" max={totalAmount} />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                        VND
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Tổng giá trị đơn hàng: {new Intl.NumberFormat("vi-VN").format(totalAmount)} VND
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refundMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phương thức hoàn tiền</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phương thức hoàn tiền" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Chuyển khoản ngân hàng</SelectItem>
                      <SelectItem value="momo">Ví MoMo</SelectItem>
                      <SelectItem value="zalopay">ZaloPay</SelectItem>
                      <SelectItem value="vnpay">VNPay</SelectItem>
                      <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Chọn phương thức để hoàn tiền cho khách hàng</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refundReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do hoàn tiền</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lý do hoàn tiền" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="customer_request">Khách hàng yêu cầu hủy</SelectItem>
                      <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                      <SelectItem value="shipping_issue">Vấn đề vận chuyển</SelectItem>
                      <SelectItem value="product_damaged">Sản phẩm bị hỏng</SelectItem>
                      <SelectItem value="wrong_product">Sản phẩm không đúng</SelectItem>
                      <SelectItem value="other">Lý do khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refundNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập ghi chú về việc hoàn tiền (nếu có)"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isProcessing}>
                <X className="mr-2 h-4 w-4" />
                Hủy
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <span className="mr-2">Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Xác nhận hoàn tiền
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

