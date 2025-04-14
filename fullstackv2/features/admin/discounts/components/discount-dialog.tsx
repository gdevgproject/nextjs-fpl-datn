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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/shared/lib/utils"
import { useCreateDiscount } from "../hooks/use-create-discount"
import { useUpdateDiscount } from "../hooks/use-update-discount"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"

// Define the form schema with Zod
const discountFormSchema = z
  .object({
    code: z
      .string()
      .min(1, "Mã giảm giá không được để trống")
      .max(50, "Mã giảm giá không được vượt quá 50 ký tự")
      .refine((value) => /^[A-Z0-9_-]+$/.test(value), {
        message: "Mã giảm giá chỉ được chứa chữ cái in hoa, số, gạch ngang và gạch dưới",
      }),
    description: z.string().max(500, "Mô tả không được vượt quá 500 ký tự").optional().nullable(),
    is_active: z.boolean().default(true),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_percentage: z
      .number()
      .min(0.01, "Phần trăm giảm giá phải lớn hơn 0")
      .max(100, "Phần trăm giảm giá không được vượt quá 100%")
      .optional()
      .nullable(),
    max_discount_amount: z.number().min(0, "Số tiền giảm tối đa không được âm").optional().nullable(),
    min_order_value: z.number().min(0, "Giá trị đơn hàng tối thiểu không được âm").optional().nullable(),
    max_uses: z.number().int().min(0, "Số lượt sử dụng tối đa không được âm").optional().nullable(),
    remaining_uses: z.number().int().min(0, "Số lượt sử dụng còn lại không được âm").optional().nullable(),
    start_date: z.date().optional().nullable(),
    end_date: z.date().optional().nullable(),
  })
  .refine(
    (data) => {
      // If discount_type is percentage, discount_percentage is required
      if (data.discount_type === "percentage" && !data.discount_percentage) {
        return false
      }
      // If discount_type is fixed, max_discount_amount is required
      if (data.discount_type === "fixed" && !data.max_discount_amount) {
        return false
      }
      return true
    },
    {
      message: "Vui lòng nhập giá trị giảm giá",
      path: ["discount_percentage"],
    },
  )
  .refine(
    (data) => {
      // If start_date and end_date are both provided, end_date must be after start_date
      if (data.start_date && data.end_date && data.end_date < data.start_date) {
        return false
      }
      return true
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["end_date"],
    },
  )
  .refine(
    (data) => {
      // If max_uses is provided, remaining_uses must be provided and not greater than max_uses
      if (data.max_uses !== null && data.max_uses !== undefined) {
        if (data.remaining_uses === null || data.remaining_uses === undefined) {
          return false
        }
        if (data.remaining_uses > data.max_uses) {
          return false
        }
      }
      return true
    },
    {
      message: "Số lượt sử dụng còn lại không được lớn hơn tổng số lượt sử dụng",
      path: ["remaining_uses"],
    },
  )

type DiscountFormValues = z.infer<typeof discountFormSchema>

interface DiscountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  discount?: any
}

export function DiscountDialog({ open, onOpenChange, mode, discount }: DiscountDialogProps) {
  const toast = useSonnerToast()
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize the form with default values
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      code: "",
      description: "",
      is_active: true,
      discount_type: "percentage",
      discount_percentage: null,
      max_discount_amount: null,
      min_order_value: null,
      max_uses: null,
      remaining_uses: null,
      start_date: null,
      end_date: null,
    },
  })

  // Set form values when editing an existing discount
  useEffect(() => {
    if (mode === "edit" && discount) {
      form.reset({
        code: discount.code,
        description: discount.description,
        is_active: discount.is_active,
        discount_type: discount.discount_percentage !== null ? "percentage" : "fixed",
        discount_percentage: discount.discount_percentage,
        max_discount_amount: discount.max_discount_amount,
        min_order_value: discount.min_order_value,
        max_uses: discount.max_uses,
        remaining_uses: discount.remaining_uses,
        start_date: discount.start_date ? new Date(discount.start_date) : null,
        end_date: discount.end_date ? new Date(discount.end_date) : null,
      })
    } else {
      form.reset({
        code: "",
        description: "",
        is_active: true,
        discount_type: "percentage",
        discount_percentage: null,
        max_discount_amount: null,
        min_order_value: null,
        max_uses: null,
        remaining_uses: null,
        start_date: null,
        end_date: null,
      })
    }
  }, [mode, discount, form, open])

  // Watch discount_type to conditionally show fields
  const discountType = form.watch("discount_type")
  const maxUses = form.watch("max_uses")

  // Mutations for creating and updating discounts
  const createDiscountMutation = useCreateDiscount()
  const updateDiscountMutation = useUpdateDiscount()

  // Handle form submission
  const onSubmit = async (values: DiscountFormValues) => {
    try {
      setIsProcessing(true)

      // Prepare the data for submission
      const discountData = {
        code: values.code,
        description: values.description,
        is_active: values.is_active,
        discount_percentage: values.discount_type === "percentage" ? values.discount_percentage : null,
        max_discount_amount: values.discount_type === "fixed" ? values.max_discount_amount : values.max_discount_amount,
        min_order_value: values.min_order_value,
        max_uses: values.max_uses,
        remaining_uses: values.remaining_uses,
        start_date: values.start_date,
        end_date: values.end_date,
      }

      if (mode === "create") {
        // Create new discount
        await createDiscountMutation.mutateAsync(discountData)
        toast.success("Mã giảm giá đã được tạo thành công")
      } else if (mode === "edit" && discount) {
        // Update existing discount
        await updateDiscountMutation.mutateAsync({
          id: discount.id,
          ...discountData,
        })
        toast.success("Mã giảm giá đã được cập nhật thành công")
      }

      // Close the dialog
      onOpenChange(false)
    } catch (error) {
      // Show error message
      toast.error(
        `Lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} mã giảm giá: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Thêm mã giảm giá mới" : "Chỉnh sửa mã giảm giá"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Thêm một mã giảm giá mới vào hệ thống." : "Chỉnh sửa thông tin mã giảm giá."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã giảm giá</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập mã giảm giá"
                        {...field}
                        disabled={mode === "edit"} // Không cho phép sửa mã khi đang edit
                        className="uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Mã giảm giá phải là duy nhất và chỉ chứa chữ cái in hoa, số, gạch ngang và gạch dưới.
                    </FormDescription>
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
                      <FormLabel className="text-base">Trạng thái</FormLabel>
                      <FormDescription>Mã giảm giá có hoạt động không?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả về mã giảm giá (tùy chọn)"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Mô tả ngắn gọn về mã giảm giá.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discount_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Loại giảm giá</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="percentage" />
                        </FormControl>
                        <FormLabel className="font-normal">Giảm theo phần trăm</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="fixed" />
                        </FormControl>
                        <FormLabel className="font-normal">Giảm số tiền cố định</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {discountType === "percentage" ? (
                <FormField
                  control={form.control}
                  name="discount_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phần trăm giảm giá (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Nhập phần trăm giảm giá"
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>Phần trăm giảm giá (1-100%).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="max_discount_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiền giảm cố định</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Nhập số tiền giảm"
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>Số tiền giảm cố định (VND).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {discountType === "percentage" && (
                <FormField
                  control={form.control}
                  name="max_discount_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiền giảm tối đa</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Nhập số tiền giảm tối đa"
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>Giới hạn số tiền giảm tối đa (tùy chọn).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="min_order_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá trị đơn hàng tối thiểu</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập giá trị đơn hàng tối thiểu"
                        {...field}
                        value={field.value === null ? "" : field.value}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>Giá trị đơn hàng tối thiểu để áp dụng mã (tùy chọn).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_uses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượt sử dụng tối đa</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập số lượt sử dụng tối đa"
                        {...field}
                        value={field.value === null ? "" : field.value}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? null : Number.parseInt(e.target.value, 10))
                        }
                      />
                    </FormControl>
                    <FormDescription>Để trống nếu không giới hạn số lượt sử dụng.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {maxUses !== null && maxUses !== undefined && maxUses > 0 && (
                <FormField
                  control={form.control}
                  name="remaining_uses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượt sử dụng còn lại</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Nhập số lượt sử dụng còn lại"
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? null : Number.parseInt(e.target.value, 10))
                          }
                        />
                      </FormControl>
                      <FormDescription>Số lượt sử dụng còn lại của mã giảm giá.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày bắt đầu</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={(date) => field.onChange(date)}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Ngày bắt đầu hiệu lực của mã giảm giá (tùy chọn).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày kết thúc</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={(date) => field.onChange(date)}
                          disabled={(date) => {
                            const startDate = form.getValues("start_date")
                            return startDate ? date < startDate : date < new Date(new Date().setHours(0, 0, 0, 0))
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Ngày kết thúc hiệu lực của mã giảm giá (tùy chọn).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? "Đang xử lý..." : mode === "create" ? "Tạo mã giảm giá" : "Cập nhật mã giảm giá"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
