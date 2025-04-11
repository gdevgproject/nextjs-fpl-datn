"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProductVariants } from "../hooks/use-product-variants"
import { useAdjustStock } from "../hooks/use-adjust-stock"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"
import { useDebounce } from "../hooks/use-debounce"

// Define the form schema with Zod
const adjustmentFormSchema = z.object({
  variant_id: z.string().min(1, "Vui lòng chọn biến thể sản phẩm"),
  change_amount: z.string().refine(
    (val) => {
      const num = Number.parseInt(val)
      return !isNaN(num) && num !== 0
    },
    { message: "Số lượng thay đổi phải khác 0" },
  ),
  reason: z.string().min(5, "Lý do phải có ít nhất 5 ký tự").max(200, "Lý do không được vượt quá 200 ký tự"),
})

type AdjustmentFormValues = z.infer<typeof adjustmentFormSchema>

interface InventoryAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InventoryAdjustmentDialog({ open, onOpenChange }: InventoryAdjustmentDialogProps) {
  const toast = useSonnerToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [variantSearch, setVariantSearch] = useState("")
  const debouncedVariantSearch = useDebounce(variantSearch)

  // Fetch product variants for the dropdown
  const { data: variantsData } = useProductVariants({
    search: debouncedVariantSearch,
  })
  const variants = variantsData?.data || []

  // Initialize the form with default values
  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: {
      variant_id: "",
      change_amount: "",
      reason: "",
    },
  })

  // Reset form when dialog opens/closes
  const resetForm = () => {
    form.reset({
      variant_id: "",
      change_amount: "",
      reason: "",
    })
    setVariantSearch("")
  }

  // Mutation for adjusting stock
  const adjustStockMutation = useAdjustStock()

  // Handle form submission
  const onSubmit = async (values: AdjustmentFormValues) => {
    try {
      setIsProcessing(true)

      // Convert values to the format expected by the RPC
      const params = {
        p_variant_id: Number.parseInt(values.variant_id),
        p_change_amount: Number.parseInt(values.change_amount),
        p_reason: values.reason,
      }

      // Call the RPC
      await adjustStockMutation.mutateAsync(params)

      // Show success message
      toast.success("Điều chỉnh kho thành công")

      // Close the dialog and reset form
      onOpenChange(false)
      resetForm()
    } catch (error) {
      // Show error message
      toast.error(`Lỗi khi điều chỉnh kho: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Get selected variant details
  const selectedVariantId = form.watch("variant_id")
  const selectedVariant = variants.find((v: any) => v.id.toString() === selectedVariantId)

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen)
        if (!newOpen) resetForm()
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Điều chỉnh kho hàng</DialogTitle>
          <DialogDescription>
            Thêm hoặc bớt số lượng sản phẩm trong kho. Số dương để nhập kho, số âm để xuất kho.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="variant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biến thể sản phẩm</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn biến thể sản phẩm" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="mb-2 p-2">
                        <Input
                          placeholder="Tìm kiếm sản phẩm..."
                          value={variantSearch}
                          onChange={(e) => setVariantSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {variants.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">Không tìm thấy sản phẩm</div>
                      ) : (
                        variants.map((variant: any) => (
                          <SelectItem key={variant.id} value={variant.id.toString()}>
                            {variant.products?.name} - {variant.volume_ml}ml ({variant.sku})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>Chọn biến thể sản phẩm cần điều chỉnh kho</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedVariant && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p>
                  <strong>Tồn kho hiện tại:</strong> {selectedVariant.stock_quantity}
                </p>
                <p>
                  <strong>SKU:</strong> {selectedVariant.sku}
                </p>
                <p>
                  <strong>Thương hiệu:</strong> {selectedVariant.products?.brands?.name}
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="change_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng thay đổi</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Nhập số lượng (dương để nhập, âm để xuất)" {...field} />
                  </FormControl>
                  <FormDescription>Nhập số dương để nhập kho, số âm để xuất kho</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập lý do điều chỉnh kho" className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>
                    Mô tả lý do điều chỉnh kho (ví dụ: Nhập hàng mới, Kiểm kê, Hàng lỗi...)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? "Đang xử lý..." : "Xác nhận điều chỉnh"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
