"use client"

import { useState } from "react"
import { Check, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { OrderEmailNotification } from "./order-email-notification"
import { OrderInventoryUpdate } from "./order-inventory-update"

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: string
  customerEmail: string
}

const orderStatusSchema = z.object({
  status: z.string().min(1, "Trạng thái đơn hàng là bắt buộc"),
  trackingNumber: z.string().optional(),
  sendEmail: z.boolean().default(true),
})

type OrderStatusFormValues = z.infer<typeof orderStatusSchema>

export function OrderStatusUpdate({ orderId, currentStatus, customerEmail }: OrderStatusUpdateProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  // Mẫu dữ liệu sản phẩm trong đơn hàng
  const orderItems = [
    {
      id: "ITEM-001",
      productName: "Dior Sauvage EDP",
      variantName: "100ml",
      quantity: 1,
      currentStock: 10,
    },
    {
      id: "ITEM-002",
      productName: "Chanel Bleu de Chanel EDP",
      variantName: "50ml",
      quantity: 1,
      currentStock: 8,
    },
  ]

  const form = useForm<OrderStatusFormValues>({
    resolver: zodResolver(orderStatusSchema),
    defaultValues: {
      status: currentStatus,
      trackingNumber: "",
      sendEmail: true,
    },
  })

  const watchStatus = form.watch("status")
  const showTrackingNumber = watchStatus === "Shipped"
  const showInventoryUpdate = watchStatus === "Shipped" && currentStatus !== "Shipped"

  const onSubmit = async (data: OrderStatusFormValues) => {
    setIsUpdating(true)

    // Giả lập cập nhật trạng thái
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsUpdating(false)

    toast({
      title: "Cập nhật trạng thái thành công",
      description: `Đơn hàng #${orderId} đã được cập nhật sang trạng thái ${data.status}`,
      duration: 3000,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cập nhật trạng thái đơn hàng</CardTitle>
        <CardDescription>Cập nhật trạng thái đơn hàng và thông báo cho khách hàng</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái đơn hàng</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái đơn hàng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Chờ xử lý</SelectItem>
                      <SelectItem value="Processing">Đang xử lý</SelectItem>
                      <SelectItem value="Shipped">Đã giao cho vận chuyển</SelectItem>
                      <SelectItem value="Delivered">Đã giao hàng</SelectItem>
                      <SelectItem value="Cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showTrackingNumber && (
              <FormField
                control={form.control}
                name="trackingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã vận đơn</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập mã vận đơn" {...field} />
                    </FormControl>
                    <FormDescription>Mã vận đơn sẽ được gửi cho khách hàng để theo dõi đơn hàng</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                    <FormDescription>Gửi email thông báo cập nhật trạng thái đơn hàng đến khách hàng</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {showInventoryUpdate && (
              <div className="rounded-md border p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Cập nhật tồn kho</p>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Khi chuyển trạng thái sang "Đã giao cho vận chuyển", hệ thống sẽ tự động cập nhật tồn kho cho các sản
                  phẩm trong đơn hàng.
                </p>
                <OrderInventoryUpdate orderId={orderId} items={orderItems} />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <OrderEmailNotification orderId={orderId} customerEmail={customerEmail} orderStatus={watchStatus} />
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

