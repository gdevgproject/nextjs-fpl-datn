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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCreateDiscount } from "../hooks/use-create-discount";
import { useUpdateDiscount } from "../hooks/use-update-discount";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Discount, DiscountFormValues, discountFormSchema } from "../types";
import { CreateDiscountInput } from "../actions";

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  discount?: Discount | null;
}

export function DiscountDialog({
  open,
  onOpenChange,
  mode,
  discount,
}: DiscountDialogProps) {
  const toast = useSonnerToast();
  const [activeTab, setActiveTab] = useState("general");

  // Form with zod validation
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      code: "",
      description: "",
      is_active: true,
      discount_type: "percentage",
      discount_percentage: null,
      max_discount_amount: null,
      min_order_value: null,
      max_uses: null,
      remaining_uses: null,
      start_date: null,
      end_date: null,
    },
  });

  // Mutations
  const createDiscountMutation = useCreateDiscount();
  const updateDiscountMutation = useUpdateDiscount();

  // Reset form when dialog is opened/closed or discount changes
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && discount) {
      form.reset({
        code: discount.code,
        description: discount.description || "",
        is_active: discount.is_active,
        discount_type:
          discount.discount_percentage !== null ? "percentage" : "fixed",
        discount_percentage: discount.discount_percentage,
        max_discount_amount: discount.max_discount_amount,
        min_order_value: discount.min_order_value,
        max_uses: discount.max_uses,
        remaining_uses: discount.remaining_uses,
        start_date: discount.start_date ? new Date(discount.start_date) : null,
        end_date: discount.end_date ? new Date(discount.end_date) : null,
      });
    } else {
      form.reset({
        code: "",
        description: "",
        is_active: true,
        discount_type: "percentage",
        discount_percentage: null,
        max_discount_amount: null,
        min_order_value: null,
        max_uses: null,
        remaining_uses: null,
        start_date: null,
        end_date: null,
      });
    }

    setActiveTab("general");
  }, [form, discount, mode, open]);

  // Watch values for conditional fields
  const discountType = form.watch("discount_type");
  const maxUses = form.watch("max_uses");

  // Handle form submission
  const onSubmit = async (values: DiscountFormValues) => {
    try {
      // Prepare common data for API submission
      const commonData: Omit<CreateDiscountInput, "id"> = {
        code: values.code,
        description: values.description || null,
        is_active: values.is_active,
        discount_percentage:
          values.discount_type === "percentage"
            ? values.discount_percentage
            : null,
        max_discount_amount: values.max_discount_amount,
        min_order_value: values.min_order_value,
        max_uses: values.max_uses,
        remaining_uses: values.remaining_uses,
        start_date: values.start_date ? values.start_date.toISOString() : null,
        end_date: values.end_date ? values.end_date.toISOString() : null,
      };

      if (mode === "create") {
        const result = await createDiscountMutation.mutateAsync(commonData);

        if (result.success) {
          toast.success("Mã giảm giá đã được tạo thành công");
          onOpenChange(false);
        } else {
          toast.error(`Lỗi khi tạo mã giảm giá: ${result.error}`);
        }
      } else if (mode === "edit" && discount) {
        const result = await updateDiscountMutation.mutateAsync({
          id: discount.id,
          ...commonData,
        });

        if (result.success) {
          toast.success("Mã giảm giá đã được cập nhật thành công");
          onOpenChange(false);
        } else {
          toast.error(`Lỗi khi cập nhật mã giảm giá: ${result.error}`);
        }
      }
    } catch (error) {
      console.error("Error submitting discount form:", error);
      toast.error(
        `Lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} mã giảm giá: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`
      );
    }
  };

  const isLoading =
    createDiscountMutation.isPending || updateDiscountMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Thêm mã giảm giá mới"
              : "Chỉnh sửa mã giảm giá"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Thêm một mã giảm giá mới vào hệ thống."
              : "Chỉnh sửa thông tin mã giảm giá."}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="general"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="overflow-x-auto">
            <TabsList className="mb-4 w-full grid grid-cols-3">
              <TabsTrigger value="general" className="flex-1">
                Thông tin chung
              </TabsTrigger>
              <TabsTrigger value="discount" className="flex-1">
                Giảm giá
              </TabsTrigger>
              <TabsTrigger value="limit" className="flex-1">
                Giới hạn
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="max-h-[60vh] pr-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <TabsContent value="general" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Mã giảm giá
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="max-w-[280px]">
                                    Mã giảm giá phải là duy nhất và chỉ chứa chữ
                                    cái in hoa, số, gạch ngang và gạch dưới.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="VD: SUMMER2025"
                              {...field}
                              disabled={mode === "edit"}
                              className="uppercase"
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                            />
                          </FormControl>
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
                            <FormLabel className="text-base">
                              Trạng thái
                            </FormLabel>
                            <FormDescription>
                              Mã giảm giá có hoạt động không?
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

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập mô tả về mã giảm giá (tùy chọn)"
                            className="resize-none min-h-[80px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Mô tả ngắn gọn về mã giảm giá, điều kiện áp dụng hoặc
                          lưu ý quan trọng.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="discount" className="space-y-4 mt-0">
                  <FormField
                    control={form.control}
                    name="discount_type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Loại giảm giá</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="percentage" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Giảm theo phần trăm
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="fixed" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Giảm số tiền cố định
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {discountType === "percentage" ? (
                      <FormField
                        control={form.control}
                        name="discount_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phần trăm giảm giá (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Nhập phần trăm giảm giá"
                                {...field}
                                value={field.value === null ? "" : field.value}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : parseFloat(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Phần trăm giảm giá (1-100%).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="max_discount_amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số tiền giảm cố định</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Nhập số tiền giảm (VNĐ)"
                                {...field}
                                value={field.value === null ? "" : field.value}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : parseFloat(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Số tiền cố định được giảm trực tiếp vào đơn hàng.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {discountType === "percentage" && (
                      <FormField
                        control={form.control}
                        name="max_discount_amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số tiền giảm tối đa</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Nhập số tiền giảm tối đa (VNĐ)"
                                {...field}
                                value={field.value === null ? "" : field.value}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : parseFloat(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Giới hạn số tiền tối đa có thể được giảm giá (tùy
                              chọn).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="min_order_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá trị đơn hàng tối thiểu</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Nhập giá trị đơn hàng tối thiểu (VNĐ)"
                              {...field}
                              value={field.value === null ? "" : field.value}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? null
                                    : parseFloat(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Giá trị đơn hàng tối thiểu để áp dụng mã (tùy chọn).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="limit" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="max_uses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số lượt sử dụng tối đa</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Nhập số lượt sử dụng tối đa"
                              {...field}
                              value={field.value === null ? "" : field.value}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? null
                                    : parseInt(e.target.value, 10)
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Để trống nếu không giới hạn số lượt sử dụng.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {maxUses !== null &&
                      maxUses !== undefined &&
                      maxUses > 0 && (
                        <FormField
                          control={form.control}
                          name="remaining_uses"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số lượt sử dụng còn lại</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Nhập số lượt sử dụng còn lại"
                                  {...field}
                                  value={
                                    field.value === null ? "" : field.value
                                  }
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? null
                                        : parseInt(e.target.value, 10)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                Số lượt sử dụng còn lại của mã giảm giá (không
                                được vượt quá tổng số lượt).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", {
                                      locale: vi,
                                    })
                                  ) : (
                                    <span>Chọn ngày</span>
                                  )}
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
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Ngày bắt đầu hiệu lực của mã giảm giá (để trống nếu
                            áp dụng ngay).
                          </FormDescription>
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
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", {
                                      locale: vi,
                                    })
                                  ) : (
                                    <span>Chọn ngày</span>
                                  )}
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
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Ngày kết thúc hiệu lực của mã giảm giá (để trống nếu
                            không giới hạn).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <DialogFooter className="sticky bottom-0 pt-2 bg-background border-t mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? "Đang xử lý..."
                      : mode === "create"
                      ? "Tạo mã giảm giá"
                      : "Cập nhật mã giảm giá"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
