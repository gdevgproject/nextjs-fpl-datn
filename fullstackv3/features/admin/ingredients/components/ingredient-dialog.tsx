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
import { useCreateIngredient } from "../hooks/use-create-ingredient";
import { useUpdateIngredient } from "../hooks/use-update-ingredient";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

// Define the form schema with Zod
const ingredientFormSchema = z.object({
  name: z
    .string()
    .min(1, "Tên thành phần không được để trống")
    .max(100, "Tên thành phần không được vượt quá 100 ký tự"),
});

type IngredientFormValues = z.infer<typeof ingredientFormSchema>;

interface IngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  ingredient?: any;
}

export function IngredientDialog({
  open,
  onOpenChange,
  mode,
  ingredient,
}: IngredientDialogProps) {
  const toast = useSonnerToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize the form with default values
  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // Set form values when editing an existing ingredient
  useEffect(() => {
    if (mode === "edit" && ingredient) {
      form.reset({
        name: ingredient.name,
      });
    } else {
      form.reset({
        name: "",
      });
    }
  }, [mode, ingredient, form, open]);

  // Mutations for creating and updating ingredients
  const createIngredientMutation = useCreateIngredient();
  const updateIngredientMutation = useUpdateIngredient();

  // Handle form submission
  const onSubmit = async (values: IngredientFormValues) => {
    try {
      setIsProcessing(true);

      if (mode === "create") {
        // Create new ingredient
        await createIngredientMutation.mutateAsync({
          name: values.name,
        });

        // Show success message
        toast.success("Thành phần đã được tạo thành công");

        // Close the dialog
        onOpenChange(false);

        // Reset the form
        form.reset();
      } else if (mode === "edit" && ingredient) {
        // Update existing ingredient
        await updateIngredientMutation.mutateAsync({
          id: ingredient.id,
          name: values.name,
        });

        // Show success message
        toast.success("Thành phần đã được cập nhật thành công");

        // Close the dialog
        onOpenChange(false);
      }
    } catch (error) {
      // Show error message
      toast.error(
        `Lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} thành phần: ${
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
            {mode === "create" ? "Thêm thành phần mới" : "Chỉnh sửa thành phần"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Thêm một thành phần mới vào hệ thống."
              : "Chỉnh sửa thông tin thành phần."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thành phần</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên thành phần" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tên thành phần phải là duy nhất trong hệ thống.
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
                  ? "Tạo thành phần"
                  : "Cập nhật thành phần"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
