"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useCreatePerfumeType } from "../hooks/use-create-perfume-type";
import { useUpdatePerfumeType } from "../hooks/use-update-perfume-type";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

// Define the form schema with Zod
const perfumeTypeFormSchema = z.object({
  name: z
    .string()
    .min(1, "Tên loại nước hoa không được để trống")
    .max(50, "Tên loại nước hoa không được vượt quá 50 ký tự"),
});

type PerfumeTypeFormValues = z.infer<typeof perfumeTypeFormSchema>;

interface PerfumeTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  perfumeType?: any;
}

export function PerfumeTypeDialog({
  open,
  onOpenChange,
  mode,
  perfumeType,
}: PerfumeTypeDialogProps) {
  const toast = useSonnerToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize the form with default values
  const form = useForm<PerfumeTypeFormValues>({
    resolver: zodResolver(perfumeTypeFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // Set form values when editing an existing perfume type
  useEffect(() => {
    if (mode === "edit" && perfumeType) {
      form.reset({
        name: perfumeType.name,
      });
    } else {
      form.reset({
        name: "",
      });
    }
  }, [mode, perfumeType, form, open]);

  // Mutations for creating and updating perfume types
  const createPerfumeTypeMutation = useCreatePerfumeType();
  const updatePerfumeTypeMutation = useUpdatePerfumeType();

  // Handle form submission
  const onSubmit = async (values: PerfumeTypeFormValues) => {
    try {
      setIsProcessing(true);

      if (mode === "create") {
        // Create new perfume type
        await createPerfumeTypeMutation.mutateAsync({
          name: values.name,
        });

        // Show success message
        toast.success("Loại nước hoa đã được tạo thành công");

        // Close the dialog
        onOpenChange(false);

        // Reset the form
        form.reset();
      } else if (mode === "edit" && perfumeType) {
        // Update existing perfume type
        await updatePerfumeTypeMutation.mutateAsync({
          id: perfumeType.id,
          name: values.name,
        });

        // Show success message
        toast.success("Loại nước hoa đã được cập nhật thành công");

        // Close the dialog
        onOpenChange(false);
      }
    } catch (error) {
      // Show error message
      toast.error(
        `Lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} loại nước hoa: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Thêm loại nước hoa mới"
              : "Chỉnh sửa loại nước hoa"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Thêm một loại nước hoa mới vào hệ thống."
              : "Chỉnh sửa thông tin loại nước hoa."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên loại nước hoa</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên loại nước hoa" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tên loại nước hoa phải là duy nhất trong hệ thống.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing
                  ? "Đang xử lý..."
                  : mode === "create"
                  ? "Tạo loại nước hoa"
                  : "Cập nhật loại nước hoa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
