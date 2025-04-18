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
import { useCreateBrand } from "../hooks/use-create-brand";
import { useUpdateBrand } from "../hooks/use-update-brand";
import { useUploadBrandLogo } from "../hooks/use-upload-logo";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { LogoUploader } from "./logo-uploader";

// Define the form schema with Zod
const brandFormSchema = z.object({
  name: z
    .string()
    .min(1, "Tên thương hiệu không được để trống")
    .max(100, "Tên thương hiệu không được vượt quá 100 ký tự"),
  description: z
    .string()
    .max(500, "Mô tả không được vượt quá 500 ký tự")
    .optional()
    .nullable(),
  logo_url: z.string().optional().nullable(),
});

type BrandFormValues = z.infer<typeof brandFormSchema>;

interface BrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  brand?: any;
}

export function BrandDialog({
  open,
  onOpenChange,
  mode,
  brand,
}: BrandDialogProps) {
  const toast = useSonnerToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [oldLogoUrl, setOldLogoUrl] = useState<string | null>(null);

  // Initialize the form with default values
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      description: "",
      logo_url: null,
    },
  });

  // Set form values when editing an existing brand
  useEffect(() => {
    if (mode === "edit" && brand) {
      form.reset({
        name: brand.name,
        description: brand.description,
        logo_url: brand.logo_url,
      });
      setOldLogoUrl(brand.logo_url);
    } else {
      form.reset({
        name: "",
        description: "",
        logo_url: null,
      });
      setLogoFile(null);
      setOldLogoUrl(null);
    }
  }, [mode, brand, form, open]);

  // Mutations for creating and updating brands
  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();
  const uploadLogoMutation = useUploadBrandLogo();

  // Handle form submission
  const onSubmit = async (values: BrandFormValues) => {
    try {
      setIsProcessing(true);

      if (mode === "create") {
        // Step 1: Create new brand without logo_url first
        const brandData = {
          name: values.name,
          description: values.description,
          logo_url: null, // We'll update this after upload
        };

        // Create brand
        const result = await createBrandMutation.mutateAsync(brandData);
        const newBrandId =
          Array.isArray(result) && result.length > 0 ? result[0].id : null;

        // Step 2: If we have a logo file and brand was created successfully, upload the logo
        if (logoFile && newBrandId) {
          try {
            // Create file path
            const fileExt = logoFile.name.split(".").pop();
            const filePath = `brands/${newBrandId}/logo.${fileExt}`;

            // Upload file
            const uploadResult = await uploadLogoMutation.mutateAsync({
              file: logoFile,
              path: filePath,
              fileOptions: {
                contentType: logoFile.type,
                upsert: true,
              },
            });

            // Step 3: Update the brand with the logo URL
            await updateBrandMutation.mutateAsync({
              id: newBrandId,
              logo_url: uploadResult.publicUrl,
            });
          } catch (error) {
            console.error("Error uploading logo:", error);
            // Brand is created but logo upload failed
            toast.error(
              `Thương hiệu đã được tạo nhưng tải lên logo thất bại: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          }
        }

        // Show success message
        toast.success("Thương hiệu đã được tạo thành công");

        // Close the dialog
        onOpenChange(false);

        // Reset the form
        form.reset();
        setLogoFile(null);
      } else if (mode === "edit" && brand) {
        // Update existing brand
        await updateBrandMutation.mutateAsync({
          id: brand.id,
          name: values.name,
          description: values.description,
          logo_url: values.logo_url,
        });

        // Show success message
        toast.success("Thương hiệu đã được cập nhật thành công");

        // Close the dialog
        onOpenChange(false);
      }
    } catch (error) {
      // Show error message
      toast.error(
        `Lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} thương hiệu: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle logo upload
  const handleLogoChange = (file: File | null, url: string | null) => {
    setLogoFile(file);
    form.setValue("logo_url", url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Thêm thương hiệu mới"
              : "Chỉnh sửa thương hiệu"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Thêm một thương hiệu mới vào hệ thống."
              : "Chỉnh sửa thông tin thương hiệu."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thương hiệu</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên thương hiệu" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tên thương hiệu phải là duy nhất trong hệ thống.
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
                      placeholder="Nhập mô tả về thương hiệu (tùy chọn)"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Mô tả ngắn gọn về thương hiệu.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <LogoUploader
                      initialImageUrl={field.value || ""}
                      brandId={mode === "edit" ? brand?.id : undefined}
                      onChange={handleLogoChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Tải lên logo của thương hiệu. Hỗ trợ định dạng PNG, JPG,
                    GIF, WEBP và SVG.
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
                  ? "Tạo thương hiệu"
                  : "Cập nhật thương hiệu"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
