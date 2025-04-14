"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useCreatePaymentMethod } from "../hooks/use-create-payment-method"
import { useUpdatePaymentMethod } from "../hooks/use-update-payment-method"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"

// Define the form schema with Zod
const paymentMethodFormSchema = z.object({
  name: z
    .string()
    .min(1, "Tên phương thức thanh toán không được để trống")
    .max(100, "Tên phương thức thanh toán không được vượt quá 100 ký tự"),
  description: z.string().max(500, "Mô tả không được vượt quá 500 ký tự").optional().nullable(),
  is_active: z.boolean().default(true),
})

type PaymentMethodFormValues = z.infer<typeof paymentMethodFormSchema>

interface PaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  paymentMethod?: any
}

export function PaymentMethodDialog({ open, onOpenChange, mode, paymentMethod }: PaymentMethodDialogProps) {
  const toast = useSonnerToast()
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize the form with default values
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  })

  // Set form values when editing an existing payment method
  useEffect(() => {
    if (mode === "edit" && paymentMethod) {
      form.reset({
        name: paymentMethod.name,
        description: paymentMethod.description,
        is_active: paymentMethod.is_active,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        is_active: true,
      })
    }
  }, [mode, paymentMethod, form, open])

  // Mutations for creating and updating payment methods
  const createPaymentMethodMutation = useCreatePaymentMethod()
  const updatePaymentMethodMutation = useUpdatePaymentMethod()

  // Handle form submission
  const onSubmit = async (values: PaymentMethodFormValues) => {
    try {
      setIsProcessing(true)

      if (mode === "create") {
        // Create new payment method
        await createPaymentMethodMutation.mutateAsync({
          name: values.name,
          description: values.description,
          is_active: values.is_active,
        })

        // Show success message
        toast.success("Phương thức thanh toán đã được tạo thành công")

        // Close the dialog
        onOpenChange(false)

        // Reset the form
        form.reset()
      } else if (mode === "edit" && paymentMethod) {
        // Update existing payment method
        await updatePaymentMethodMutation.mutateAsync({
          id: paymentMethod.id,
          name: values.name,
          description: values.description,
          is_active: values.is_active,
        })

        // Show success message
        toast.success("Phương thức thanh toán đã được cập nhật thành công")

        // Close the dialog
        onOpenChange(false)
      }
    } catch (error) {
      // Show error message
      toast.error(
        `Lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} phương thức thanh toán: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm phương thức thanh toán mới" : "Chỉnh sửa phương thức thanh toán"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Thêm một phương thức thanh toán mới vào hệ thống."
              : "Chỉnh sửa thông tin phương thức thanh toán."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên phương thức thanh toán</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên phương thức thanh toán" {...field} />
                  </FormControl>
                  <FormDescription>Tên phương thức thanh toán phải là duy nhất trong hệ thống.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả về phương thức thanh toán (tùy chọn)"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Mô tả ngắn gọn về phương thức thanh toán.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Trạng thái</FormLabel>
                    <FormDescription>Đặt phương thức thanh toán là hoạt động hoặc không hoạt động.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isProcessing} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing
                  ? "Đang xử lý..."
                  : mode === "create"
                    ? "Tạo phương thức thanh toán"
                    : "Cập nhật phương thức thanh toán"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
