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
import { useCreateProductLabel } from "../hooks/use-create-product-label";
import { useUpdateProductLabel } from "../hooks/use-update-product-label";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { SketchPicker } from "react-color";

// Define the form schema with Zod
const productLabelFormSchema = z.object({
  name: z
    .string()
    .min(1, "Tên nhãn sản phẩm không được để trống")
    .max(50, "Tên nhãn sản phẩm không được vượt quá 50 ký tự"),
  color_code: z.string().optional().nullable(),
});

type ProductLabelFormValues = z.infer<typeof productLabelFormSchema>;

interface ProductLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  productLabel?: any;
}

export function ProductLabelDialog({
  open,
  onOpenChange,
  mode,
  productLabel,
}: ProductLabelDialogProps) {
  const toast = useSonnerToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Initialize the form with default values
  const form = useForm<ProductLabelFormValues>({
    resolver: zodResolver(productLabelFormSchema),
    defaultValues: {
      name: "",
      color_code: null,
    },
  });

  // Set form values when editing an existing product label
  useEffect(() => {
    if (mode === "edit" && productLabel) {
      form.reset({
        name: productLabel.name,
        color_code: productLabel.color_code,
      });
      setSelectedColor(productLabel.color_code || null);
    } else {
      form.reset({
        name: "",
        color_code: null,
      });
      setSelectedColor(null);
    }
  }, [mode, productLabel, form, open]);

  // Mutations for creating and updating product labels
  const createProductLabelMutation = useCreateProductLabel();
  const updateProductLabelMutation = useUpdateProductLabel();

  // Handle form submission
  const onSubmit = async (values: ProductLabelFormValues) => {
    try {
      setIsProcessing(true);

      if (mode === "create") {
        // Create new product label
        await createProductLabelMutation.mutateAsync({
          name: values.name,
          color_code: selectedColor,
        });

        // Show success message
        toast.success("Nhãn sản phẩm đã được tạo thành công");

        // Close the dialog
        onOpenChange(false);

        // Reset the form
        form.reset();
        setSelectedColor(null);
      } else if (mode === "edit" && productLabel) {
        // Update existing product label
        await updateProductLabelMutation.mutateAsync({
          id: productLabel.id,
          name: values.name,
          color_code: selectedColor,
        });

        // Show success message
        toast.success("Nhãn sản phẩm đã được cập nhật thành công");

        // Close the dialog
        onOpenChange(false);
      }
    } catch (error) {
      // Show error message
      toast.error(
        `Lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} nhãn sản phẩm: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle color change
  const handleColorChange = (color: any) => {
    setSelectedColor(color.hex);
    form.setValue("color_code", color.hex);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Thêm nhãn sản phẩm mới"
              : "Chỉnh sửa nhãn sản phẩm"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Thêm một nhãn sản phẩm mới vào hệ thống."
              : "Chỉnh sửa thông tin nhãn sản phẩm."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên nhãn sản phẩm</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên nhãn sản phẩm" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tên nhãn sản phẩm phải là duy nhất trong hệ thống.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã màu</FormLabel>
                  <FormControl>
                    <SketchPicker
                      color={selectedColor || ""}
                      onChange={handleColorChange}
                    />
                  </FormControl>
                  <FormDescription>Chọn màu cho nhãn sản phẩm.</FormDescription>
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
                  ? "Tạo nhãn sản phẩm"
                  : "Cập nhật nhãn sản phẩm"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
