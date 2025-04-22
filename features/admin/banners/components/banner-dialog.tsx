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
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  CalendarIcon,
  RefreshCw,
  Link2Icon,
  ImageIcon,
  ListOrderedIcon,
  TextIcon,
  CalendarDaysIcon,
  ToggleLeftIcon,
  BookmarkIcon,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCreateBanner, useUpdateBanner } from "../hooks/use-banner-hooks";
import { useUploadBannerImage } from "../hooks/use-upload-banner-image";
import { useDeleteBannerImage } from "../hooks/use-delete-banner-image";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { BannerImageUploader } from "./banner-image-uploader";
import { extractPathFromImageUrl } from "../services";
import { useBanners } from "../hooks/use-banners";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Define the form schema with Zod
const bannerFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "Tiêu đề không được để trống")
      .max(100, "Tiêu đề không được vượt quá 100 ký tự"),
    subtitle: z
      .string()
      .max(200, "Tiêu đề phụ không được vượt quá 200 ký tự")
      .optional()
      .nullable(),
    image_url: z.string().min(1, "Hình ảnh banner là bắt buộc"),
    link_url: z.string().url("URL không hợp lệ").optional().nullable(),
    is_active: z.boolean().default(true),
    display_order: z.coerce
      .number()
      .int()
      .min(0, "Thứ tự hiển thị phải là số nguyên dương"),
    start_date: z.date().optional().nullable(),
    end_date: z.date().optional().nullable(),
  })
  .refine(
    (data) => {
      // If both dates are provided, ensure end_date is after start_date
      if (data.start_date && data.end_date) {
        return data.end_date > data.start_date;
      }
      return true;
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["end_date"],
    }
  );

type BannerFormValues = z.infer<typeof bannerFormSchema>;

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  banner?: any;
}

export function BannerDialog({
  open,
  onOpenChange,
  mode,
  banner,
}: BannerDialogProps) {
  const toast = useSonnerToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [oldImageUrl, setOldImageUrl] = useState<string | null>(null);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [suggestedOrder, setSuggestedOrder] = useState<number>(0);

  // Fetch all banners to find the next available display_order
  const { data: bannersData } = useBanners(
    undefined,
    { page: 1, pageSize: 1000 },
    { column: "display_order", direction: "desc" }
  );

  // Calculate next available display_order when dialog opens
  useEffect(() => {
    if (open && mode === "create" && bannersData?.data) {
      // Tìm số thứ tự lớn nhất hiện có
      let maxOrder = 0;
      bannersData.data.forEach((b) => {
        if (b.display_order > maxOrder) {
          maxOrder = b.display_order;
        }
      });
      // Đề xuất số thứ tự tiếp theo
      setSuggestedOrder(maxOrder + 1);
    }
  }, [open, mode, bannersData]);

  // Initialize the form with default values
  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "",
      is_active: true,
      display_order: 0,
      start_date: null,
      end_date: null,
    },
  });

  // Set form values when editing an existing banner or when suggestedOrder changes
  useEffect(() => {
    if (mode === "edit" && banner) {
      form.reset({
        title: banner.title,
        subtitle: banner.subtitle,
        image_url: banner.image_url,
        link_url: banner.link_url,
        is_active: banner.is_active,
        display_order: banner.display_order,
        start_date: banner.start_date ? new Date(banner.start_date) : null,
        end_date: banner.end_date ? new Date(banner.end_date) : null,
      });
      setOldImageUrl(banner.image_url);
      setIsImageChanged(false);
    } else if (mode === "create") {
      form.reset({
        title: "",
        subtitle: "",
        image_url: "",
        link_url: "",
        is_active: true,
        display_order: suggestedOrder, // Sử dụng số thứ tự đề xuất
        start_date: null,
        end_date: null,
      });
      setImageFile(null);
      setOldImageUrl(null);
      setIsImageChanged(false);
    }
  }, [mode, banner, form, open, suggestedOrder]);

  // Mutations for creating and updating banners
  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();
  const uploadImageMutation = useUploadBannerImage();
  const deleteImageMutation = useDeleteBannerImage();

  // Function to get the next available display order
  const handleGenerateNextOrder = () => {
    form.setValue("display_order", suggestedOrder);
  };

  // Handle form submission
  const onSubmit = async (values: BannerFormValues) => {
    try {
      setIsProcessing(true);

      if (mode === "create") {
        // Step 1: Upload image if provided
        let imageUrl = values.image_url;
        if (imageFile) {
          try {
            // Create file path with UUID
            const fileExt = imageFile.name.split(".").pop();
            const { publicUrl } = await uploadImageMutation.mutateAsync({
              file: imageFile,
              fileOptions: {
                contentType: imageFile.type,
                upsert: true,
              },
              createPathOptions: {
                fileExtension: fileExt,
              },
            });
            imageUrl = publicUrl;
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(
              `Lỗi khi tải lên hình ảnh: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
            setIsProcessing(false);
            return;
          }
        }

        // Step 2: Create banner with image URL
        const result = await createBannerMutation.mutateAsync({
          title: values.title,
          subtitle: values.subtitle,
          image_url: imageUrl,
          link_url: values.link_url,
          is_active: values.is_active,
          display_order: values.display_order,
          start_date: values.start_date,
          end_date: values.end_date,
        });

        // Kiểm tra kết quả từ mutation
        if (!result.success) {
          toast.error(result.error || "Lỗi khi tạo banner");
          setIsProcessing(false);
          return;
        }

        toast.success("Banner đã được tạo thành công");
        onOpenChange(false);
        form.reset();
        setImageFile(null);
      } else if (mode === "edit" && banner) {
        // Step 1: Upload new image if provided
        let imageUrl = values.image_url;
        if (isImageChanged && imageFile) {
          try {
            // Create file path with banner ID
            const fileExt = imageFile.name.split(".").pop();
            const filePath = `${banner.id}/image.${fileExt}`;

            // Delete old image if exists and is different
            if (oldImageUrl && oldImageUrl !== values.image_url) {
              try {
                await deleteImageMutation.deleteFromUrl(oldImageUrl);
              } catch (error) {
                console.error("Error deleting old banner image:", error);
                // Continue with update even if image deletion fails
              }
            }

            const { publicUrl } = await uploadImageMutation.mutateAsync({
              file: imageFile,
              path: filePath,
              fileOptions: {
                contentType: imageFile.type,
                upsert: true,
              },
            });
            imageUrl = publicUrl;
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(
              `Lỗi khi tải lên hình ảnh: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
            setIsProcessing(false);
            return;
          }
        }

        // Step 2: Update banner
        const result = await updateBannerMutation.mutateAsync({
          id: banner.id,
          title: values.title,
          subtitle: values.subtitle,
          image_url: imageUrl,
          link_url: values.link_url,
          is_active: values.is_active,
          display_order: values.display_order,
          start_date: values.start_date,
          end_date: values.end_date,
        });

        // Kiểm tra kết quả từ mutation
        if (!result.success) {
          toast.error(result.error || "Lỗi khi cập nhật banner");
          setIsProcessing(false);
          return;
        }

        toast.success("Banner đã được cập nhật thành công");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error(
        `Lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} banner: ${
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
    setIsImageChanged(true);
    if (url) {
      form.setValue("image_url", url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-4 pt-5 pb-2">
          <div className="flex items-center">
            <div className="mr-2">
              {mode === "create" ? (
                <BookmarkIcon className="h-5 w-5 text-primary" />
              ) : (
                <TextIcon className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl">
                {mode === "create" ? "Thêm banner mới" : "Chỉnh sửa banner"}
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                {mode === "create"
                  ? "Thêm một banner mới vào hệ thống"
                  : "Chỉnh sửa thông tin banner"}
              </DialogDescription>
            </div>
          </div>
          {mode === "edit" && banner && (
            <Badge
              variant={banner.is_active ? "default" : "outline"}
              className="ml-auto"
            >
              {banner.is_active ? "Đang hiển thị" : "Không hiển thị"}
            </Badge>
          )}
        </DialogHeader>

        <Separator />

        <div className="px-4 py-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Column 1: Form fields */}
                <div className="lg:col-span-7 space-y-3">
                  <Card className="border-muted/40">
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-center gap-1 mb-1 text-sm font-medium">
                        <TextIcon className="h-4 w-4 text-muted-foreground" />
                        <span>Thông tin cơ bản</span>
                      </div>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Tiêu đề
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập tiêu đề banner"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subtitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Tiêu đề phụ
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Nhập tiêu đề phụ (tùy chọn)"
                                className="resize-none h-16"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="link_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              <div className="flex items-center gap-1.5">
                                <Link2Icon className="h-3.5 w-3.5" />
                                <span>Liên kết</span>
                              </div>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/page"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Liên kết khi người dùng nhấp vào banner
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-muted/40">
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-center gap-1 mb-1 text-sm font-medium">
                        <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                        <span>Thời gian & Thứ tự</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="start_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="font-medium">
                                Bắt đầu
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-2 text-left font-normal text-xs md:text-sm",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value
                                        ? format(field.value, "dd/MM/yyyy", {
                                            locale: vi,
                                          })
                                        : "Không giới hạn"}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value || undefined}
                                    onSelect={(date) => field.onChange(date)}
                                    disabled={(date) =>
                                      date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="end_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="font-medium">
                                Kết thúc
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-2 text-left font-normal text-xs md:text-sm",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value
                                        ? format(field.value, "dd/MM/yyyy", {
                                            locale: vi,
                                          })
                                        : "Không giới hạn"}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value || undefined}
                                    onSelect={(date) => field.onChange(date)}
                                    disabled={(date) =>
                                      date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="display_order"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">
                                <div className="flex items-center gap-1.5">
                                  <ListOrderedIcon className="h-3.5 w-3.5" />
                                  <span>Thứ tự</span>
                                </div>
                              </FormLabel>
                              <div className="flex space-x-1">
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    {...field}
                                  />
                                </FormControl>
                                {mode === "create" && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleGenerateNextOrder}
                                    title="Tạo thứ tự tiếp theo"
                                    className="flex-shrink-0"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <FormDescription className="text-xs">
                                Số nhỏ hiển thị trước
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="is_active"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="font-medium">
                                <div className="flex items-center gap-1.5">
                                  <ToggleLeftIcon className="h-3.5 w-3.5" />
                                  <span>Trạng thái</span>
                                </div>
                              </FormLabel>
                              <div className="flex items-center space-x-2 rounded-lg border p-2 shadow-sm h-[38px]">
                                <FormDescription className="text-xs m-0 flex-1">
                                  Hiển thị banner
                                </FormDescription>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Column 2: Image upload */}
                <div className="lg:col-span-5">
                  <Card className="border-muted/40 h-full">
                    <CardContent className="p-3 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center gap-1 mb-3 text-sm font-medium">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          <span>Hình ảnh banner</span>
                        </div>

                        <FormField
                          control={form.control}
                          name="image_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <BannerImageUploader
                                  initialImageUrl={field.value}
                                  bannerId={
                                    mode === "edit" ? banner?.id : undefined
                                  }
                                  onChange={handleImageChange}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-center mt-2">
                                Hỗ trợ JPG, PNG, GIF, WEBP (tối đa 5MB)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <DialogFooter className="mt-4 sm:justify-between gap-3 px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isProcessing}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing && (
                    <div className="mr-2">
                      <div className="h-4 w-4 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                    </div>
                  )}
                  {mode === "create" ? "Tạo banner" : "Cập nhật banner"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
