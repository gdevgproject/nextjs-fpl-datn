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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/shared/lib/utils"
import { useCreateBanner } from "../hooks/use-create-banner"
import { useUpdateBanner } from "../hooks/use-update-banner"
import { useUploadBannerImage } from "../hooks/use-upload-banner-image"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"
import { BannerImageUploader } from "./banner-image-uploader"

// Define the form schema with Zod
const bannerFormSchema = z
  .object({
    title: z.string().min(1, "Tiêu đề không được để trống").max(100, "Tiêu đề không được vượt quá 100 ký tự"),
    subtitle: z.string().max(200, "Tiêu đề phụ không được vượt quá 200 ký tự").optional().nullable(),
    image_url: z.string().min(1, "Hình ảnh banner là bắt buộc"),
    link_url: z.string().url("URL không hợp lệ").optional().nullable(),
    is_active: z.boolean().default(true),
    display_order: z.coerce.number().int().min(0, "Thứ tự hiển thị phải là số nguyên dương"),
    start_date: z.date().optional().nullable(),
    end_date: z.date().optional().nullable(),
  })
  .refine(
    (data) => {
      // If both dates are provided, ensure end_date is after start_date
      if (data.start_date && data.end_date) {
        return data.end_date > data.start_date
      }
      return true
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["end_date"],
    },
  )

type BannerFormValues = z.infer<typeof bannerFormSchema>

interface BannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  banner?: any
}

export function BannerDialog({ open, onOpenChange, mode, banner }: BannerDialogProps) {
  const toast = useSonnerToast()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [oldImageUrl, setOldImageUrl] = useState<string | null>(null)

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
  })

  // Set form values when editing an existing banner
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
      })
      setOldImageUrl(banner.image_url)
    } else {
      form.reset({
        title: "",
        subtitle: "",
        image_url: "",
        link_url: "",
        is_active: true,
        display_order: 0,
        start_date: null,
        end_date: null,
      })
      setImageFile(null)
      setOldImageUrl(null)
    }
  }, [mode, banner, form, open])

  // Mutations for creating and updating banners
  const createBannerMutation = useCreateBanner()
  const updateBannerMutation = useUpdateBanner()
  const uploadImageMutation = useUploadBannerImage()

  // Handle form submission
  const onSubmit = async (values: BannerFormValues) => {
    try {
      setIsProcessing(true)

      if (mode === "create") {
        // Step 1: Upload image if provided
        let imageUrl = values.image_url
        if (imageFile) {
          try {
            // Create file path with UUID
            const fileExt = imageFile.name.split(".").pop()
            const { publicUrl } = await uploadImageMutation.mutateAsync({
              file: imageFile,
              fileOptions: {
                contentType: imageFile.type,
                upsert: true,
              },
              createPathOptions: {
                fileExtension: fileExt,
              },
            })
            imageUrl = publicUrl
          } catch (error) {
            console.error("Error uploading image:", error)
            toast.error(`Lỗi khi tải lên hình ảnh: ${error instanceof Error ? error.message : "Unknown error"}`)
            setIsProcessing(false)
            return
          }
        }

        // Step 2: Create banner with image URL
        await createBannerMutation.mutateAsync({
          title: values.title,
          subtitle: values.subtitle,
          image_url: imageUrl,
          link_url: values.link_url,
          is_active: values.is_active,
          display_order: values.display_order,
          start_date: values.start_date,
          end_date: values.end_date,
        })

        toast.success("Banner đã được tạo thành công")
        onOpenChange(false)
        form.reset()
        setImageFile(null)
      } else if (mode === "edit" && banner) {
        // Step 1: Upload new image if provided
        let imageUrl = values.image_url
        if (imageFile) {
          try {
            // Create file path with banner ID
            const fileExt = imageFile.name.split(".").pop()
            const filePath = `${banner.id}/image.${fileExt}`

            const { publicUrl } = await uploadImageMutation.mutateAsync({
              file: imageFile,
              path: filePath,
              fileOptions: {
                contentType: imageFile.type,
                upsert: true,
              },
            })
            imageUrl = publicUrl
          } catch (error) {
            console.error("Error uploading image:", error)
            toast.error(`Lỗi khi tải lên hình ảnh: ${error instanceof Error ? error.message : "Unknown error"}`)
            setIsProcessing(false)
            return
          }
        }

        // Step 2: Update banner
        await updateBannerMutation.mutateAsync({
          id: banner.id,
          title: values.title,
          subtitle: values.subtitle,
          image_url: imageUrl,
          link_url: values.link_url,
          is_active: values.is_active,
          display_order: values.display_order,
          start_date: values.start_date,
          end_date: values.end_date,
        })

        toast.success("Banner đã được cập nhật thành công")
        onOpenChange(false)
      }
    } catch (error) {
      toast.error(
        `Lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} banner: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle image upload
  const handleImageChange = (file: File | null, url: string | null) => {
    setImageFile(file)
    if (url) {
      form.setValue("image_url", url)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Thêm banner mới" : "Chỉnh sửa banner"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Thêm một banner mới vào hệ thống." : "Chỉnh sửa thông tin banner."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề banner" {...field} />
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
                      <FormLabel>Tiêu đề phụ</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập tiêu đề phụ (tùy chọn)"
                          className="resize-none"
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
                      <FormLabel>Liên kết</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/page" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>Liên kết khi người dùng nhấp vào banner (tùy chọn)</FormDescription>
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
                        <Input type="number" min="0" step="1" {...field} />
                      </FormControl>
                      <FormDescription>Số nhỏ hơn sẽ hiển thị trước</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Trạng thái</FormLabel>
                        <FormDescription>Banner có được hiển thị hay không</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
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
                      <FormLabel>Hình ảnh</FormLabel>
                      <FormControl>
                        <BannerImageUploader
                          initialImageUrl={field.value}
                          bannerId={mode === "edit" ? banner?.id : undefined}
                          onChange={handleImageChange}
                        />
                      </FormControl>
                      <FormDescription>Tải lên hình ảnh banner. Hỗ trợ định dạng JPG, PNG, GIF, WEBP.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "dd/MM/yyyy", { locale: vi }) : "Không giới hạn"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={(date) => field.onChange(date)}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>Ngày bắt đầu hiển thị banner</FormDescription>
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
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "dd/MM/yyyy", { locale: vi }) : "Không giới hạn"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={(date) => field.onChange(date)}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>Ngày kết thúc hiển thị banner</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? "Đang xử lý..." : mode === "create" ? "Tạo banner" : "Cập nhật banner"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
