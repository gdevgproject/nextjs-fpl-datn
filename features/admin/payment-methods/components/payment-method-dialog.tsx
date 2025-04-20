"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreatePaymentMethod, useUpdatePaymentMethod } from "../hooks";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { paymentMethodSchema, type PaymentMethod } from "../types";

type PaymentMethodFormValues = Omit<PaymentMethod, "id"> & { id?: number };

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  paymentMethod?: PaymentMethod;
}

export function PaymentMethodDialog({
  open,
  onOpenChange,
  mode,
  paymentMethod,
}: PaymentMethodDialogProps) {
  const toast = useSonnerToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize the form with default values and Zod resolver for validation
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  // Reset form when dialog opens or payment method changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && paymentMethod) {
        form.reset({
          name: paymentMethod.name,
          description: paymentMethod.description || "",
          is_active: paymentMethod.is_active,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          is_active: true,
        });
      }
    }
  }, [mode, paymentMethod, form, open]);

  // Use TanStack Query mutations
  const createPaymentMethodMutation = useCreatePaymentMethod();
  const updatePaymentMethodMutation = useUpdatePaymentMethod();

  // Handle form submission with optimized workflow
  const onSubmit = async (values: PaymentMethodFormValues) => {
    try {
      setIsProcessing(true);

      if (mode === "create") {
        // Create new payment method
        await createPaymentMethodMutation.mutateAsync({
          name: values.name,
          description: values.description || null,
          is_active: values.is_active,
        });

        toast.success("Thêm phương thức thanh toán thành công");
      } else if (mode === "edit" && paymentMethod) {
        // Update existing payment method
        await updatePaymentMethodMutation.mutateAsync({
          id: paymentMethod.id,
          name: values.name,
          description: values.description || null,
          is_active: values.is_active,
        });

        toast.success("Cập nhật phương thức thanh toán thành công");
      }

      // Close dialog and reset form on success
      onOpenChange(false);
    } catch (error) {
      toast.error(
        `Lỗi khi ${
          mode === "create" ? "thêm" : "cập nhật"
        } phương thức thanh toán`,
        {
          description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Early render to avoid UI flickering when loading data
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Thêm phương thức thanh toán mới"
              : "Chỉnh sửa phương thức thanh toán"}
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
                    <Input
                      placeholder="Nhập tên phương thức thanh toán"
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>
                    Tên phương thức thanh toán phải là duy nhất trong hệ thống.
                  </FormDescription>
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
                  <FormDescription>
                    Mô tả ngắn gọn về phương thức thanh toán.
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
                    <FormLabel>Trạng thái</FormLabel>
                    <FormDescription>
                      Đặt phương thức thanh toán là hoạt động hoặc không hoạt
                      động.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isProcessing}
                      aria-readonly={isProcessing}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  isProcessing ||
                  !form.formState.isDirty ||
                  createPaymentMethodMutation.isPending ||
                  updatePaymentMethodMutation.isPending
                }
              >
                {isProcessing ||
                createPaymentMethodMutation.isPending ||
                updatePaymentMethodMutation.isPending
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
  );
}
