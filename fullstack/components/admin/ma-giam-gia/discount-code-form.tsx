"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CalendarIcon, Info, Percent, RefreshCw, Save, Tag, X } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useMediaQuery } from "@/hooks/use-media-query"
import { DiscountCodePreview } from "./discount-code-preview"
import { DiscountCodeGenerator } from "./discount-code-generator"
import { DiscountCodeUsageChart } from "./discount-code-usage-chart"
import { DiscountCodeAdvancedOptions } from "./discount-code-advanced-options"

// Schema validation
const discountFormSchema = z.object({
  code: z
    .string()
    .min(3, {
      message: "Mã giảm giá phải có ít nhất 3 ký tự",
    })
    .max(20, {
      message: "Mã giảm giá không được vượt quá 20 ký tự",
    })
    .regex(/^[A-Z0-9_-]+$/, {
      message: "Mã giảm giá chỉ được chứa chữ hoa, số, gạch ngang và gạch dưới",
    }),
  description: z
    .string()
    .max(200, {
      message: "Mô tả không được vượt quá 200 ký tự",
    })
    .optional(),
  discount_percentage: z.coerce
    .number()
    .min(1, {
      message: "Phần trăm giảm giá phải lớn hơn 0",
    })
    .max(100, {
      message: "Phần trăm giảm giá không được vượt quá 100%",
    }),
  max_discount_amount: z.coerce
    .number()
    .min(0, {
      message: "Giá trị giảm tối đa không được âm",
    })
    .optional(),
  min_order_value: z.coerce.number().min(0, {
    message: "Giá trị đơn tối thiểu không được âm",
  }),
  max_uses: z.coerce.number().min(1, {
    message: "Số lượt sử dụng tối đa phải lớn hơn 0",
  }),
  start_date: z.date({
    required_error: "Vui lòng chọn ngày bắt đầu",
  }),
  end_date: z.date({
    required_error: "Vui lòng chọn ngày kết thúc",
  }),
  is_active: z.boolean().default(true),
})

type DiscountFormValues = z.infer<typeof discountFormSchema>

interface DiscountCodeFormProps {
  id?: string
}

// Mock data for edit mode
const mockDiscountData = {
  id: "1",
  code: "SUMMER2023",
  description: "Giảm giá mùa hè 2023",
  discount_percentage: 15,
  max_discount_amount: 200000,
  min_order_value: 500000,
  max_uses: 100,
  remaining_uses: 45,
  start_date: new Date("2023-06-01"),
  end_date: new Date("2023-08-31"),
  is_active: true,
  created_at: "2023-05-15T10:30:00Z",
  updated_at: "2023-05-15T10:30:00Z",
  usage_count: 55,
  total_discount_amount: 8500000,
}

export function DiscountCodeForm({ id }: DiscountCodeFormProps) {
  const router = useRouter()
  const isEditMode = !!id
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [activeTab, setActiveTab] = useState("basic")
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(!isMobile)

  // Initialize form with default values or existing data
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: isEditMode
      ? {
          code: mockDiscountData.code,
          description: mockDiscountData.description,
          discount_percentage: mockDiscountData.discount_percentage,
          max_discount_amount: mockDiscountData.max_discount_amount,
          min_order_value: mockDiscountData.min_order_value,
          max_uses: mockDiscountData.max_uses,
          start_date: mockDiscountData.start_date,
          end_date: mockDiscountData.end_date,
          is_active: mockDiscountData.is_active,
        }
      : {
          code: "",
          description: "",
          discount_percentage: 10,
          max_discount_amount: undefined,
          min_order_value: 100000,
          max_uses: 100,
          start_date: new Date(),
          end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          is_active: true,
        },
  })

  // Update preview visibility when screen size changes
  useEffect(() => {
    setShowPreview(!isMobile)
  }, [isMobile])

  // Handle form submission
  function onSubmit(data: DiscountFormValues) {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", data)
      setIsSubmitting(false)
      router.push("/admin/ma-giam-gia")
    }, 1000)
  }

  // Generate a random discount code
  const generateDiscountCode = () => {
    setIsGeneratingCode(true)

    // Simulate API call
    setTimeout(() => {
      const randomCode = `SALE${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`
      form.setValue("code", randomCode)
      setIsGeneratingCode(false)
    }, 500)
  }

  // Calculate example discount
  const calculateExampleDiscount = () => {
    const percentage = form.getValues("discount_percentage") || 0
    const maxAmount = form.getValues("max_discount_amount") || Number.POSITIVE_INFINITY
    const exampleOrderValue = 1000000 // 1,000,000 VND

    const calculatedDiscount = exampleOrderValue * (percentage / 100)
    return Math.min(calculatedDiscount, maxAmount)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                {isEditMode && <TabsTrigger value="usage">Lịch sử sử dụng</TabsTrigger>}
                {showAdvancedOptions && <TabsTrigger value="advanced">Tùy chọn nâng cao</TabsTrigger>}
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-4 items-start">
                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>
                                Mã giảm giá <span className="text-red-500">*</span>
                              </FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input
                                    placeholder="Nhập mã giảm giá (VD: SUMMER2023)"
                                    {...field}
                                    className="uppercase"
                                  />
                                </FormControl>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={generateDiscountCode}
                                        disabled={isGeneratingCode}
                                      >
                                        {isGeneratingCode ? (
                                          <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <RefreshCw className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Tạo mã ngẫu nhiên</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <FormDescription>Mã giảm giá sẽ được hiển thị cho khách hàng</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          className="mt-8 md:mt-0"
                          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        >
                          {showAdvancedOptions ? "Ẩn tùy chọn nâng cao" : "Hiện tùy chọn nâng cao"}
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Nhập mô tả mã giảm giá"
                                {...field}
                                value={field.value || ""}
                                rows={3}
                              />
                            </FormControl>
                            <FormDescription>Mô tả ngắn gọn về mã giảm giá</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="discount_percentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Phần trăm giảm giá (%) <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="Nhập phần trăm giảm giá"
                                    {...field}
                                  />
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Percent className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormDescription>Phần trăm giảm giá áp dụng cho đơn hàng</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="max_discount_amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Giảm tối đa (VNĐ)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="Nhập số tiền giảm tối đa"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>Để trống nếu không giới hạn số tiền giảm</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="min_order_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Giá trị đơn tối thiểu (VNĐ) <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input type="number" min="0" placeholder="Nhập giá trị đơn tối thiểu" {...field} />
                              </FormControl>
                              <FormDescription>Giá trị đơn hàng tối thiểu để áp dụng mã giảm giá</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="max_uses"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Số lượt sử dụng tối đa <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input type="number" min="1" placeholder="Nhập số lượt sử dụng tối đa" {...field} />
                              </FormControl>
                              <FormDescription>Tổng số lần mã giảm giá có thể được sử dụng</FormDescription>
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
                              <FormLabel>
                                Ngày bắt đầu <span className="text-red-500">*</span>
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant="outline" className="w-full pl-3 text-left font-normal">
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
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>Ngày bắt đầu áp dụng mã giảm giá</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="end_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>
                                Ngày kết thúc <span className="text-red-500">*</span>
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant="outline" className="w-full pl-3 text-left font-normal">
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
                                    disabled={(date) => {
                                      const startDate = form.getValues("start_date")
                                      return startDate ? date < startDate : false
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>Ngày kết thúc áp dụng mã giảm giá</FormDescription>
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
                              <FormLabel className="text-base">Kích hoạt mã giảm giá</FormLabel>
                              <FormDescription>Mã giảm giá sẽ chỉ có hiệu lực khi được kích hoạt</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {form.formState.isDirty && (
                  <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Bạn có thay đổi chưa lưu. Hãy nhấn nút Lưu để cập nhật thông tin.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {isEditMode && (
                <TabsContent value="usage" className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Đã sử dụng</h3>
                            <p className="text-2xl font-bold">
                              {mockDiscountData.usage_count} / {mockDiscountData.max_uses}
                            </p>
                          </div>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Tổng giảm giá</h3>
                            <p className="text-2xl font-bold">
                              {new Intl.NumberFormat("vi-VN").format(mockDiscountData.total_discount_amount)} đ
                            </p>
                          </div>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Trạng thái</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant={mockDiscountData.is_active ? "success" : "secondary"}>
                                {mockDiscountData.is_active ? "Đang hoạt động" : "Không hoạt động"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-medium mb-4">Lịch sử sử dụng</h3>
                          <DiscountCodeUsageChart />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {showAdvancedOptions && (
                <TabsContent value="advanced" className="space-y-6">
                  <DiscountCodeAdvancedOptions />
                </TabsContent>
              )}
            </Tabs>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/ma-giam-gia")}>
                <X className="mr-2 h-4 w-4" />
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? "Cập nhật" : "Tạo mã giảm giá"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {showPreview && (
        <div className="w-full lg:w-80 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Xem trước</h3>
                {isMobile && (
                  <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <DiscountCodePreview
                code={form.watch("code") || "SUMMER2023"}
                discountPercentage={form.watch("discount_percentage") || 10}
                maxDiscountAmount={form.watch("max_discount_amount")}
                minOrderValue={form.watch("min_order_value") || 100000}
                startDate={form.watch("start_date") || new Date()}
                endDate={form.watch("end_date") || new Date(new Date().setMonth(new Date().getMonth() + 1))}
                isActive={form.watch("is_active")}
              />

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Ví dụ giảm giá</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex justify-between text-sm">
                      <span>Đơn hàng 1,000,000đ</span>
                      <span>-{new Intl.NumberFormat("vi-VN").format(calculateExampleDiscount())}đ</span>
                    </div>
                  </div>
                </div>

                {!isMobile && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tạo mã nhanh</h4>
                    <DiscountCodeGenerator onSelectCode={(code) => form.setValue("code", code)} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isMobile && !showPreview && (
        <Button variant="outline" className="w-full" onClick={() => setShowPreview(true)}>
          <Tag className="mr-2 h-4 w-4" />
          Xem trước mã giảm giá
        </Button>
      )}
    </div>
  )
}

