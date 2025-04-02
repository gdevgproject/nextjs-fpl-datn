"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Loader2, Smartphone, Tablet, Monitor, Info } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"

import { BannerImageUpload } from "./banner-image-upload"
import { BannerPreview } from "./banner-preview"
import { BannerDevicePreview } from "./banner-device-preview"
import { BannerScheduleInfo } from "./banner-schedule-info"
import { BannerSaveStatus } from "./banner-save-status"
import { BannerFormSkeleton } from "./banner-form-skeleton"

// Định nghĩa schema validation cho form
const formSchema = z
  .object({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    subtitle: z.string().optional(),
    image_url: z.string().min(1, "Hình ảnh không được để trống"),
    link_url: z.string().min(1, "URL liên kết không được để trống"),
    is_active: z.boolean().default(true),
    start_date: z.date({
      required_error: "Vui lòng chọn ngày bắt đầu",
    }),
    end_date: z
      .date({
        required_error: "Vui lòng chọn ngày kết thúc",
      })
      .refine((date) => date > new Date(), {
        message: "Ngày kết thúc phải sau ngày hiện tại",
      }),
    display_order: z.number().int().positive().default(1),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["end_date"],
  })

type FormValues = z.infer<typeof formSchema>

interface BannerFormProps {
  id?: string
}

export function BannerForm({ id }: BannerFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!id
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [formChanged, setFormChanged] = useState(false)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  // Khởi tạo form với giá trị mặc định hoặc dữ liệu banner hiện có nếu đang chỉnh sửa
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "",
      is_active: true,
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      display_order: 1,
    },
    mode: "onChange",
  })

  // Giả lập việc tải dữ liệu banner nếu đang chỉnh sửa
  useEffect(() => {
    if (isEditing) {
      // Giả lập API call để lấy dữ liệu banner
      setTimeout(() => {
        // Mock data cho banner đang chỉnh sửa
        const mockBanner = {
          id: "1",
          title: "Khuyến mãi mùa hè",
          subtitle: "Giảm giá đến 50% cho tất cả sản phẩm",
          image_url: "/placeholder.svg?height=400&width=1200",
          link_url: "/khuyen-mai-mua-he",
          is_active: true,
          start_date: new Date("2023-06-01T00:00:00Z"),
          end_date: new Date("2023-08-31T23:59:59Z"),
          display_order: 1,
        }

        form.reset({
          ...mockBanner,
          start_date: new Date(mockBanner.start_date),
          end_date: new Date(mockBanner.end_date),
        })
        setImagePreview(mockBanner.image_url)
        setIsLoading(false)
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }, [form, isEditing])

  // Theo dõi thay đổi form để hiển thị trạng thái lưu
  useEffect(() => {
    const subscription = form.watch(() => {
      setFormChanged(true)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Tự động lưu form sau mỗi 30 giây nếu có thay đổi
  useEffect(() => {
    if (!autoSaveEnabled || !formChanged) return

    const timer = setTimeout(() => {
      if (form.formState.isValid) {
        handleAutoSave()
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [form.formState, formChanged, autoSaveEnabled])

  // Xử lý tự động lưu
  const handleAutoSave = async () => {
    if (!form.formState.isValid) return

    try {
      // Giả lập API call để lưu dữ liệu
      await new Promise((resolve) => setTimeout(resolve, 500))
      setLastSaved(new Date())
      setFormChanged(false)

      toast({
        title: "Đã lưu tự động",
        description: "Banner đã được lưu tự động",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu tự động. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  // Xử lý submit form
  const onSubmit = async (values: FormValues) => {
    setIsSaving(true)
    try {
      // Giả lập API call để lưu dữ liệu
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log(values)

      toast({
        title: isEditing ? "Cập nhật thành công" : "Tạo mới thành công",
        description: isEditing ? "Banner đã được cập nhật thành công" : "Banner mới đã được tạo thành công",
      })

      // Chuyển hướng về trang danh sách banner
      router.push("/admin/banner")
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi lưu banner. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Xử lý upload hình ảnh
  const handleImageUpload = (url: string) => {
    form.setValue("image_url", url, { shouldValidate: true, shouldDirty: true })
    setImagePreview(url)
    setFormChanged(true)
  }

  // Hiển thị skeleton loading khi đang tải dữ liệu
  if (isLoading) {
    return <BannerFormSkeleton />
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{isEditing ? "Chỉnh sửa banner" : "Thêm banner mới"}</h2>
        <BannerSaveStatus
          lastSaved={lastSaved}
          autoSaveEnabled={autoSaveEnabled}
          onToggleAutoSave={() => setAutoSaveEnabled(!autoSaveEnabled)}
          formChanged={formChanged}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <Input placeholder="Nhập tiêu đề phụ (không bắt buộc)" {...field} />
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
                          <FormLabel>URL liên kết</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập URL liên kết khi click vào banner" {...field} />
                          </FormControl>
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
                            <Input
                              type="number"
                              min="1"
                              placeholder="Nhập thứ tự hiển thị"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>Số nhỏ hơn sẽ hiển thị trước</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Ngày bắt đầu</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className="w-full pl-3 text-left font-normal">
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: vi })
                                  ) : (
                                    <span>Chọn ngày</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
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
                          <FormLabel>Ngày kết thúc</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className="w-full pl-3 text-left font-normal">
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: vi })
                                  ) : (
                                    <span>Chọn ngày</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < form.getValues("start_date")}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center">
                            <FormLabel className="text-base mr-2">Trạng thái</FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Banner sẽ tự động hiển thị trong khoảng thời gian đã chọn nếu được kích hoạt</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormDescription>Bật để kích hoạt banner, tắt để vô hiệu hóa</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <BannerScheduleInfo
                    startDate={form.watch("start_date")}
                    endDate={form.watch("end_date")}
                    isActive={form.watch("is_active")}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hình ảnh banner</FormLabel>
                        <FormControl>
                          <BannerImageUpload value={field.value} onChange={handleImageUpload} />
                        </FormControl>
                        <FormDescription>Kích thước khuyến nghị: 1200x400 pixels (tỷ lệ 3:1)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Xem trước banner</h3>
                    <div className="flex items-center space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={previewDevice === "desktop" ? "default" : "outline"}
                              size="icon"
                              onClick={() => setPreviewDevice("desktop")}
                            >
                              <Monitor className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem trên máy tính</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={previewDevice === "tablet" ? "default" : "outline"}
                              size="icon"
                              onClick={() => setPreviewDevice("tablet")}
                            >
                              <Tablet className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem trên máy tính bảng</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={previewDevice === "mobile" ? "default" : "outline"}
                              size="icon"
                              onClick={() => setPreviewDevice("mobile")}
                            >
                              <Smartphone className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem trên điện thoại</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <Tabs defaultValue="banner" className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="banner">Banner</TabsTrigger>
                      <TabsTrigger value="context">Trong ngữ cảnh</TabsTrigger>
                    </TabsList>
                    <TabsContent value="banner" className="mt-4">
                      <BannerPreview
                        title={form.watch("title")}
                        subtitle={form.watch("subtitle")}
                        imageUrl={imagePreview}
                      />
                    </TabsContent>
                    <TabsContent value="context" className="mt-4">
                      <BannerDevicePreview
                        title={form.watch("title")}
                        subtitle={form.watch("subtitle")}
                        imageUrl={imagePreview}
                        device={previewDevice}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/banner")} disabled={isSaving}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving || !form.formState.isValid}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

