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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateCategory } from "../hooks/use-create-category";
import { useUpdateCategory } from "../hooks/use-update-category";
import { useUploadCategoryImage } from "../hooks/use-upload-category-image";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { CategoryImageUploader } from "./category-image-uploader";
import { useCategories } from "../hooks/use-categories";

// Define the form schema with Zod
const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Tên danh mục không được để trống")
    .max(100, "Tên danh mục không được vượt quá 100 ký tự"),
  description: z
    .string()
    .max(500, "Mô tả không được vượt quá 500 ký tự")
    .optional()
    .nullable(),
  image_url: z.string().optional().nullable(),
  is_featured: z.boolean().default(false),
  display_order: z.coerce.number().int().default(0),
  parent_category_id: z.coerce.number().nullable().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  category?: any;
}

export function CategoryDialog({
  open,
  onOpenChange,
  mode,
  category,
}: CategoryDialogProps) {
  const toast = useSonnerToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [oldImageUrl, setOldImageUrl] = useState<string | null>(null);

  // Fetch all categories for parent selection
  const { data: categoriesData } = useCategories(
    {},
    { page: 1, pageSize: 100 },
    { column: "name", direction: "asc" }
  );

  // Initialize the form with default values
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      image_url: null,
      is_featured: false,
      display_order: 0,
      parent_category_id: null,
    },
  });

  // Set form values when editing an existing category
  useEffect(() => {
    if (mode === "edit" && category) {
      form.reset({
        name: category.name,
        description: category.description,
        image_url: category.image_url,
        is_featured: category.is_featured,
        display_order: category.display_order,
        parent_category_id: category.parent_category_id,
      });
      setOldImageUrl(category.image_url);
    } else {
      form.reset({
        name: "",
        description: "",
        image_url: null,
        is_featured: false,
        display_order: 0,
        parent_category_id: null,
      });
      setImageFile(null);
      setOldImageUrl(null);
    }
  }, [mode, category, form, open]);

  // Mutations for creating and updating categories
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const uploadImageMutation = useUploadCategoryImage();

  // Handle form submission
  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setIsProcessing(true);

      if (mode === "create") {
        // Step 1: Create new category without image_url first
        const categoryData = {
          name: values.name,
          description: values.description,
          is_featured: values.is_featured,
          display_order: values.display_order,
          parent_category_id: values.parent_category_id || null,
          image_url: null, // We'll update this after upload
        };

        // Create category
        const result = await createCategoryMutation.mutateAsync(categoryData);
        const newCategoryId =
          Array.isArray(result) && result.length > 0 ? result[0].id : null;

        // Step 2: If we have an image file and category was created successfully, upload the image
        if (imageFile && newCategoryId) {
          try {
            // Create file path
            const fileExt = imageFile.name.split(".").pop();
            const filePath = `categories/${newCategoryId}/image.${fileExt}`;

            // Upload file
            const uploadResult = await uploadImageMutation.mutateAsync({
              file: imageFile,
              path: filePath,
              fileOptions: {
                contentType: imageFile.type,
                upsert: true,
              },
            });

            // Step 3: Update the category with the image URL
            await updateCategoryMutation.mutateAsync({
              id: newCategoryId,
              image_url: uploadResult.publicUrl,
            });
          } catch (error) {
            console.error("Error uploading image:", error);
            // Category is created but image upload failed
            toast.error(
              `Danh mục đã được tạo nhưng tải lên ảnh thất bại: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          }
        }

        // Show success message
        toast.success("Danh mục đã được tạo thành công");

        // Close the dialog
        onOpenChange(false);

        // Reset the form
        form.reset();
        setImageFile(null);
      } else if (mode === "edit" && category) {
        // Update existing category
        await updateCategoryMutation.mutateAsync({
          id: category.id,
          name: values.name,
          description: values.description,
          image_url: values.image_url,
          is_featured: values.is_featured,
          display_order: values.display_order,
          parent_category_id: values.parent_category_id || null,
        });

        // Show success message
        toast.success("Danh mục đã được cập nhật thành công");

        // Close the dialog
        onOpenChange(false);
      }
    } catch (error) {
      // Show error message
      toast.error(
        `Lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} danh mục: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle image upload
  const handleImageChange = (file: File | null, url: string | null) => {
    setImageFile(file);
    form.setValue("image_url", url);
  };

  // Filter out the current category from parent options to prevent circular references
  const parentOptions =
    categoriesData?.data.filter((c) => c.id !== category?.id) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm danh mục mới" : "Chỉnh sửa danh mục"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Thêm một danh mục mới vào hệ thống."
              : "Chỉnh sửa thông tin danh mục."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên danh mục</FormLabel>

                      <FormControl>
                        <Input placeholder="Nhập tên danh mục" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tên danh mục phải là duy nhất trong hệ thống.
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
                          placeholder="Nhập mô tả về danh mục (tùy chọn)"
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Mô tả ngắn gọn về danh mục.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parent_category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục cha</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục cha (nếu có)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            Không có danh mục cha
                          </SelectItem>
                          {parentOptions.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Chọn danh mục cha nếu đây là danh mục con. Để trống nếu
                        là danh mục gốc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh danh mục</FormLabel>
                      <FormControl>
                        <CategoryImageUploader
                          initialImageUrl={field.value || ""}
                          categoryId={
                            mode === "edit" ? category?.id : undefined
                          }
                          onChange={handleImageChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Tải lên ảnh đại diện cho danh mục. Hỗ trợ định dạng PNG,
                        JPG, GIF, WEBP.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="display_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thứ tự hiển thị</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        Số nhỏ hơn sẽ hiển thị trước. Mặc định là 0.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Danh mục nổi bật
                        </FormLabel>
                        <FormDescription>
                          Danh mục nổi bật sẽ được hiển thị ở vị trí đặc biệt
                          trên trang chủ.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                  ? "Tạo danh mục"
                  : "Cập nhật danh mục"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
