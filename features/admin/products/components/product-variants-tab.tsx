"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useProductVariants,
  useCreateProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
} from "../hooks/use-product-variants";
import { useVariantHardDelete } from "../hooks/use-variant-hard-delete";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, Trash } from "lucide-react";

// Define the form schema with Zod
const variantFormSchema = z
  .object({
    volume_ml: z
      .string()
      .min(1, "Dung tích không được để trống")
      .refine(
        (val) => {
          // Kiểm tra giá trị là số nguyên dương
          const volume = parseInt(val, 10);
          return !isNaN(volume) && volume > 0 && Number.isInteger(volume);
        },
        {
          message: "Dung tích phải là số nguyên dương (vd: 50, 100)",
        }
      ),
    price: z
      .string()
      .min(1, "Giá không được để trống")
      .refine(
        (val) => {
          // Kiểm tra định dạng số không âm và giá phải hợp lệ
          const price = parseFloat(val);
          return !isNaN(price) && price >= 0;
        },
        {
          message: "Giá phải là số không âm",
        }
      )
      .refine(
        (val) => {
          // Đảm bảo giá không vượt quá 1 tỷ VND
          const price = parseFloat(val);
          return price <= 1000000000;
        },
        {
          message: "Giá không được vượt quá 1 tỷ VND",
        }
      ),
    sale_price: z
      .string()
      .refine(
        (val) => {
          if (val === "") return true; // Cho phép chuỗi rỗng

          // Kiểm tra định dạng số không âm
          const price = parseFloat(val);
          return !isNaN(price) && price >= 0;
        },
        {
          message: "Giá khuyến mãi phải là số không âm",
        }
      )
      .refine(
        (val) => {
          if (val === "") return true; // Cho phép chuỗi rỗng

          // Đảm bảo giá khuyến mãi không vượt quá 1 tỷ VND
          const price = parseFloat(val);
          return price <= 1000000000;
        },
        {
          message: "Giá khuyến mãi không được vượt quá 1 tỷ VND",
        }
      )
      .optional(),
    sku: z.string().max(100, "SKU không được vượt quá 100 ký tự").optional(),
    stock_quantity: z
      .string()
      .min(1, "Số lượng tồn kho không được để trống")
      .refine(
        (val) => {
          // Kiểm tra giá trị là số nguyên không âm
          const quantity = parseInt(val, 10);
          return (
            !isNaN(quantity) && quantity >= 0 && Number.isInteger(quantity)
          );
        },
        {
          message: "Số lượng tồn kho phải là số nguyên không âm",
        }
      )
      .refine(
        (val) => {
          // Giới hạn số lượng tồn kho không quá lớn
          const quantity = parseInt(val, 10);
          return quantity <= 100000;
        },
        {
          message: "Số lượng tồn kho không được vượt quá 100.000",
        }
      ),
  })
  .refine(
    (data) => {
      // Kiểm tra giá khuyến mãi (nếu có) không được lớn hơn giá gốc
      if (data.sale_price && data.sale_price.trim() !== "") {
        const regularPrice = parseFloat(data.price);
        const salePrice = parseFloat(data.sale_price);
        return salePrice <= regularPrice;
      }
      return true;
    },
    {
      message: "Giá khuyến mãi không thể cao hơn giá gốc",
      path: ["sale_price"],
    }
  );

type VariantFormValues = z.infer<typeof variantFormSchema>;

interface ProductVariantsTabProps {
  productId: number | null | undefined;
  productDeleted?: boolean;
}

export function ProductVariantsTab({
  productId,
  productDeleted,
}: ProductVariantsTabProps) {
  const toast = useSonnerToast();
  const [editingVariant, setEditingVariant] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<any | null>(null);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [deleteMode, setDeleteMode] = useState<"soft" | "restore">("soft");
  const [restoreVariants, setRestoreVariants] = useState(false);
  const [hasActiveVariants, setHasActiveVariants] = useState(true); // Track if product has active variants

  // Hard delete state & hook
  const [showHardDeleteDialog, setShowHardDeleteDialog] = useState(false);
  const variantHardDelete = useVariantHardDelete();

  // Auto set includeDeleted based on product deleted status
  useEffect(() => {
    // Nếu sản phẩm đã bị ẩn và chúng ta đang hiển thị biến thể chưa ẩn (includeDeleted = false),
    // thì chuyển sang hiển thị biến thể đã ẩn (includeDeleted = true)
    if (productDeleted && !includeDeleted) {
      setIncludeDeleted(true);
    }
  }, [productDeleted, includeDeleted]);

  // Fetch variants for the product - both active and hidden variants
  const {
    data: variantsData,
    isLoading,
    isError,
  } = useProductVariants(productId || null, includeDeleted);

  // Also fetch active variants to check product status
  const { data: activeVariantsData } = useProductVariants(
    productId || null,
    false
  );

  // Theo dõi xem sản phẩm có biến thể hoạt động nào không
  useEffect(() => {
    // Đếm số lượng biến thể đang hoạt động (không bị ẩn)
    const activeCount = activeVariantsData?.data?.length || 0;
    setHasActiveVariants(activeCount > 0);
  }, [activeVariantsData]);

  // Toggle hiển thị chỉ biến thể đã ẩn hoặc hiển thị tất cả
  const handleToggleDeletedVariants = (checked: boolean) => {
    setIncludeDeleted(checked);
  };

  // Mutations for creating, updating, and deleting variants
  const createVariantMutation = useCreateProductVariant();
  const updateVariantMutation = useUpdateProductVariant();
  const deleteVariantMutation = useDeleteProductVariant();

  // Initialize the form with default values
  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      volume_ml: "",
      price: "",
      sale_price: "",
      sku: "",
      stock_quantity: "0",
    },
  });

  // Set form values when editing an existing variant
  const setEditMode = (variant: any) => {
    setEditingVariant(variant);
    form.reset({
      volume_ml: variant.volume_ml.toString(),
      price: variant.price.toString(),
      sale_price: variant.sale_price?.toString() || "",
      sku: variant.sku || "",
      stock_quantity: variant.stock_quantity.toString(),
    });
  };

  // Reset form to create mode
  const resetForm = () => {
    setEditingVariant(null);
    form.reset({
      volume_ml: "",
      price: "",
      sale_price: "",
      sku: "",
      stock_quantity: "0",
    });
  };

  // Handle form submission
  const onSubmit = async (values: VariantFormValues) => {
    if (!productId) {
      toast.error("Không tìm thấy ID sản phẩm");
      return;
    }

    try {
      // Đảm bảo chuyển đổi giá trị chính xác không bị sai số
      const formattedValues = {
        product_id: productId,
        // Sử dụng parseInt với radix=10 để đảm bảo không có sai số
        volume_ml: parseInt(values.volume_ml, 10),
        // Làm tròn giá đến 2 chữ số thập phân để tránh sai số
        price: Math.round(parseFloat(values.price) * 100) / 100,
        sale_price:
          values.sale_price && values.sale_price.trim() !== ""
            ? Math.round(parseFloat(values.sale_price) * 100) / 100
            : null,
        sku: values.sku || null,
        stock_quantity: parseInt(values.stock_quantity, 10),
      };

      // Check if sale price is higher than regular price
      if (
        formattedValues.sale_price !== null &&
        formattedValues.sale_price > formattedValues.price
      ) {
        toast.error("Giá khuyến mãi không thể cao hơn giá gốc");
        return;
      }

      // Kiểm tra nếu biến thể mới cần được tự động ẩn (khi sản phẩm đã bị ẩn)
      let shouldAutoHide = false;
      if (!editingVariant && productDeleted) {
        shouldAutoHide = true;
      }

      if (editingVariant) {
        // Update existing variant
        await updateVariantMutation.mutateAsync({
          id: editingVariant.id,
          ...formattedValues,
        });
        toast.success("Biến thể đã được cập nhật thành công");
      } else {
        // Create new variant
        const newVariant = await createVariantMutation.mutateAsync(
          formattedValues
        );

        // Nếu cần tự động ẩn biến thể mới khi sản phẩm đang bị ẩn
        if (shouldAutoHide && newVariant?.id) {
          try {
            await deleteVariantMutation.softDelete(newVariant.id);
            toast.success(
              "Biến thể đã được tạo và tự động ẩn do sản phẩm đang bị ẩn",
              {
                description:
                  "Khi sản phẩm được hiển thị lại, bạn có thể khôi phục các biến thể đã ẩn.",
              }
            );
          } catch (error) {
            console.error("Lỗi khi tự động ẩn biến thể:", error);
            toast.success("Biến thể đã được tạo thành công", {
              description:
                "Tuy nhiên không thể tự động ẩn do sản phẩm đang bị ẩn. Vui lòng ẩn thủ công.",
            });
          }
        } else {
          toast.success("Biến thể đã được tạo thành công");
        }
      }

      // Reset form after successful submission
      resetForm();
    } catch (error) {
      toast.error(
        `Lỗi khi ${editingVariant ? "cập nhật" : "tạo"} biến thể: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Handle delete button click
  const handleDeleteClick = (variant: any) => {
    setVariantToDelete(variant);
    setIsDeleting(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!variantToDelete) return;

    try {
      if (deleteMode === "soft") {
        await deleteVariantMutation.softDelete(variantToDelete.id);
        toast.success("Biến thể đã được ẩn thành công");
      } else {
        await deleteVariantMutation.restore(variantToDelete.id);
        toast.success("Biến thể đã được hiển thị lại thành công");
      }
    } catch (error) {
      toast.error(
        `Lỗi khi ${deleteMode === "soft" ? "ẩn" : "hiển thị lại"} biến thể: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeleting(false);
      setVariantToDelete(null);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (!productId) {
    return (
      <div className="flex justify-center items-center p-8">
        <p>Vui lòng tạo sản phẩm trước khi thêm biến thể.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cảnh báo khi không có biến thể hoạt động */}
      {!hasActiveVariants && (
        <div className="rounded-md bg-destructive/10 p-4 border border-destructive/30">
          <div className="flex">
            <svg
              className="h-5 w-5 text-destructive"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">
                Cảnh báo: Sản phẩm không có biến thể nào đang hoạt động!
              </h3>
              <div className="mt-2 text-sm text-destructive/80">
                <p>
                  Sản phẩm này hiện không có biến thể nào đang hoạt động. Khách
                  hàng sẽ không thể mua sản phẩm này và sản phẩm sẽ không hiển
                  thị trên cửa hàng.
                </p>
                <p className="mt-1">
                  Vui lòng thêm ít nhất một biến thể mới hoặc khôi phục một biến
                  thể đã ẩn để sản phẩm hoạt động trở lại.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Variant Form */}
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>
              {editingVariant ? "Chỉnh sửa biến thể" : "Thêm biến thể mới"}
            </CardTitle>
            <CardDescription>
              {editingVariant
                ? "Cập nhật thông tin biến thể sản phẩm"
                : "Thêm một biến thể mới cho sản phẩm (dung tích, giá...)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="volume_ml"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Dung tích (ml)
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <div className="md:col-span-3">
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Nhập dung tích"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                        </div>
                        <div className="md:col-span-2">
                          <select
                            className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                            onChange={(e) => {
                              if (e.target.value) {
                                field.onChange(e.target.value);
                              }
                            }}
                            value=""
                          >
                            <option value="">Dung tích phổ biến</option>
                            <option value="5">5ml</option>
                            <option value="10">10ml</option>
                            <option value="15">15ml</option>
                            <option value="30">30ml</option>
                            <option value="50">50ml</option>
                            <option value="60">60ml</option>
                            <option value="75">75ml</option>
                            <option value="100">100ml</option>
                            <option value="125">125ml</option>
                            <option value="150">150ml</option>
                            <option value="200">200ml</option>
                          </select>
                        </div>
                      </div>
                      <FormDescription className="text-xs">
                        Dung tích phải là số nguyên dương (ml). Bạn có thể nhập
                        trực tiếp hoặc chọn từ danh sách.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Giá gốc
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Nhập giá gốc"
                            {...field}
                            className="pl-10"
                            onChange={(e) => {
                              // Chỉ cho phép nhập số
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              // Giới hạn giá trị tối đa là 1 tỷ
                              const numValue = Number(value);
                              if (numValue <= 1000000000) {
                                field.onChange(value);

                                // Nếu đã có giá khuyến mãi, kiểm tra xem có hợp lệ không
                                const salePrice = form.getValues("sale_price");
                                if (salePrice && Number(salePrice) > numValue) {
                                  form.setError("sale_price", {
                                    type: "manual",
                                    message:
                                      "Giá khuyến mãi không thể cao hơn giá gốc",
                                  });
                                } else {
                                  form.clearErrors("sale_price");
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-muted-foreground font-medium">
                          ₫
                        </div>
                        {field.value && !isNaN(parseFloat(field.value)) && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-xs text-muted-foreground">
                              {new Intl.NumberFormat("vi-VN").format(
                                parseInt(field.value, 10)
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <FormDescription className="text-xs flex items-center justify-between">
                        <span>Giá gốc của biến thể (VND)</span>
                        <span className="text-muted-foreground">
                          Tối đa: 1.000.000.000đ
                        </span>
                      </FormDescription>
                      <div className="mt-1.5">
                        <div className="flex justify-between gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange("100000")}
                            className="h-6 text-xs flex-1"
                          >
                            100.000đ
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange("500000")}
                            className="h-6 text-xs flex-1"
                          >
                            500.000đ
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange("1000000")}
                            className="h-6 text-xs flex-1"
                          >
                            1.000.000đ
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange("5000000")}
                            className="h-6 text-xs flex-1"
                          >
                            5.000.000đ
                          </Button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sale_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>Giá khuyến mãi</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          (Để trống nếu không có khuyến mãi)
                        </span>
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Nhập giá khuyến mãi (tùy chọn)"
                            {...field}
                            className="pl-10"
                            onChange={(e) => {
                              // Chỉ cho phép nhập số
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );

                              // Nếu xóa hết thì set về rỗng
                              if (value === "") {
                                field.onChange("");
                                form.clearErrors("sale_price");
                                return;
                              }

                              // Giới hạn giá trị tối đa là 1 tỷ
                              const numValue = Number(value);
                              if (numValue <= 1000000000) {
                                field.onChange(value);

                                // Kiểm tra ngay lập tức giá khuyến mãi không được lớn hơn giá gốc
                                const regularPrice = form.getValues("price");
                                if (
                                  regularPrice &&
                                  numValue > Number(regularPrice)
                                ) {
                                  form.setError("sale_price", {
                                    type: "manual",
                                    message:
                                      "Giá khuyến mãi không thể cao hơn giá gốc",
                                  });
                                } else {
                                  form.clearErrors("sale_price");
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-muted-foreground font-medium">
                          ₫
                        </div>
                        {field.value &&
                          field.value.trim() !== "" &&
                          !isNaN(parseFloat(field.value)) && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-xs text-muted-foreground">
                                {new Intl.NumberFormat("vi-VN").format(
                                  parseInt(field.value, 10)
                                )}
                              </span>
                            </div>
                          )}
                      </div>
                      <FormDescription className="text-xs flex items-center justify-between">
                        <span>
                          Giá sau khi giảm. Phải thấp hơn hoặc bằng giá gốc.
                        </span>
                        <span className="flex items-center gap-1">
                          {form.getValues("price") &&
                            field.value &&
                            parseFloat(field.value) > 0 &&
                            (Number(field.value) <=
                            Number(form.getValues("price")) ? (
                              <span className="text-xs font-medium text-green-600">
                                {Math.round(
                                  ((parseFloat(form.getValues("price")) -
                                    parseFloat(field.value)) /
                                    parseFloat(form.getValues("price"))) *
                                    100
                                )}
                                % giảm
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-destructive">
                                Giá khuyến mãi không thể cao hơn giá gốc
                              </span>
                            ))}
                        </span>
                      </FormDescription>
                      <div className="mt-1.5">
                        {form.getValues("price") &&
                          parseFloat(form.getValues("price")) > 0 && (
                            <div className="flex justify-between gap-1">
                              {/* Nút đặt giảm giá 10% */}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const regularPrice = Number(
                                    form.getValues("price")
                                  );
                                  const discountedPrice = Math.floor(
                                    regularPrice * 0.9
                                  );
                                  field.onChange(discountedPrice.toString());
                                  form.clearErrors("sale_price");
                                }}
                                className="h-6 text-xs flex-1"
                                disabled={
                                  !form.getValues("price") ||
                                  form.getValues("price") === "0"
                                }
                              >
                                Giảm 10%
                              </Button>
                              {/* Nút đặt giảm giá 20% */}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const regularPrice = Number(
                                    form.getValues("price")
                                  );
                                  const discountedPrice = Math.floor(
                                    regularPrice * 0.8
                                  );
                                  field.onChange(discountedPrice.toString());
                                  form.clearErrors("sale_price");
                                }}
                                className="h-6 text-xs flex-1"
                                disabled={
                                  !form.getValues("price") ||
                                  form.getValues("price") === "0"
                                }
                              >
                                Giảm 20%
                              </Button>
                              {/* Nút đặt giảm giá 30% */}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const regularPrice = Number(
                                    form.getValues("price")
                                  );
                                  const discountedPrice = Math.floor(
                                    regularPrice * 0.7
                                  );
                                  field.onChange(discountedPrice.toString());
                                  form.clearErrors("sale_price");
                                }}
                                className="h-6 text-xs flex-1"
                                disabled={
                                  !form.getValues("price") ||
                                  form.getValues("price") === "0"
                                }
                              >
                                Giảm 30%
                              </Button>
                              {/* Nút xóa giá khuyến mãi */}
                              <Button
                                type="button"
                                variant={field.value ? "outline" : "ghost"}
                                size="sm"
                                onClick={() => {
                                  field.onChange("");
                                  form.clearErrors("sale_price");
                                }}
                                className="h-6 text-xs flex-1"
                                disabled={!field.value}
                              >
                                Bỏ KM
                              </Button>
                            </div>
                          )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>SKU</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          (Tùy chọn)
                        </span>
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="VD: ML-100-2023"
                            {...field}
                            className={field.value ? "pr-10" : ""}
                          />
                        </FormControl>
                        {field.value && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => field.onChange("")}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3 w-3"
                              >
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                              </svg>
                              <span className="sr-only">Xóa</span>
                            </Button>
                          </div>
                        )}
                      </div>
                      <FormDescription className="text-xs flex items-center justify-between">
                        <span>Mã quản lý kho hàng (Stock Keeping Unit)</span>
                        <span className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Generate a simple SKU based on product ID and volume
                              const productIdPart = productId
                                ? productId.toString().padStart(4, "0")
                                : "0000";
                              const volumePart = form
                                .getValues("volume_ml")
                                .padStart(3, "0");
                              const randomPart = Math.floor(
                                Math.random() * 1000
                              )
                                .toString()
                                .padStart(3, "0");
                              field.onChange(
                                `P${productIdPart}V${volumePart}R${randomPart}`
                              );
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            Tạo SKU tự động
                          </Button>
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Số lượng tồn kho
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="relative">
                        <div className="flex">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-r-none border-r-0"
                            onClick={() => {
                              const currentValue =
                                parseInt(field.value, 10) || 0;
                              if (currentValue > 0) {
                                field.onChange((currentValue - 1).toString());
                              }
                            }}
                            disabled={
                              editingVariant !== null ||
                              field.value === "0" ||
                              field.value === ""
                            }
                            title="Giảm số lượng"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-minus"
                            >
                              <path d="M5 12h14" />
                            </svg>
                            <span className="sr-only">Giảm</span>
                          </Button>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="Số lượng tồn kho"
                              className="rounded-none text-center"
                              value={field.value}
                              onChange={(e) => {
                                // Chỉ cho phép nhập số nguyên không âm
                                const value = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );

                                // Giới hạn số lượng tồn kho tối đa là 100.000
                                const numValue = Number(value);
                                if (numValue <= 100000) {
                                  field.onChange(value);
                                }
                              }}
                              disabled={editingVariant !== null}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-l-none border-l-0"
                            onClick={() => {
                              const currentValue =
                                parseInt(field.value, 10) || 0;
                              const newValue = currentValue + 1;
                              if (newValue <= 100000) {
                                field.onChange(newValue.toString());
                              }
                            }}
                            title="Tăng số lượng"
                            disabled={
                              editingVariant !== null ||
                              parseInt(field.value, 10) >= 100000
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-plus"
                            >
                              <path d="M5 12h14" />
                              <path d="M12 5v14" />
                            </svg>
                            <span className="sr-only">Tăng</span>
                          </Button>
                        </div>
                      </div>
                      <FormDescription className="text-xs flex items-center justify-between">
                        <span>Số lượng có sẵn để bán</span>
                        <span className="text-muted-foreground">
                          Tối đa: 100.000
                        </span>
                      </FormDescription>
                      {editingVariant !== null && (
                        <div className="text-xs text-amber-600 mt-1">
                          Chỉ có thể thay đổi tồn kho tại chức năng{" "}
                          <b>điều chỉnh kho nhanh</b> (Quick View).
                        </div>
                      )}
                      <div className="mt-1.5">
                        <div className="flex justify-between gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange("0")}
                            className="h-6 px-2 text-xs flex-1"
                            disabled={editingVariant !== null}
                          >
                            Đặt là 0
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange("10")}
                            className="h-6 px-2 text-xs flex-1"
                            disabled={editingVariant !== null}
                          >
                            Đặt là 10
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange("50")}
                            className="h-6 px-2 text-xs flex-1"
                            disabled={editingVariant !== null}
                          >
                            Đặt là 50
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange("100")}
                            className="h-6 px-2 text-xs flex-1"
                            disabled={editingVariant !== null}
                          >
                            Đặt là 100
                          </Button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-2">
                  {editingVariant && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Hủy
                    </Button>
                  )}
                  <Button type="submit">
                    {editingVariant ? "Cập nhật biến thể" : "Thêm biến thể"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Variants List */}
        <Card className="border-none shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Danh sách biến thể</CardTitle>
              <CardDescription>
                Các biến thể hiện có của sản phẩm
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showDeleted"
                checked={includeDeleted}
                onChange={(e) => handleToggleDeletedVariants(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="showDeleted" className="text-sm cursor-pointer">
                {includeDeleted
                  ? "Chỉ hiển thị biến thể đã ẩn"
                  : "Hiển thị biến thể đã ẩn"}
              </label>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : isError ? (
              <div className="text-red-500 text-center py-4">
                Đã xảy ra lỗi khi tải dữ liệu biến thể.
              </div>
            ) : variantsData?.data?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Chưa có biến thể nào cho sản phẩm này.</p>
                <p className="text-sm mt-2">
                  Sử dụng form bên trái để thêm biến thể mới.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dung tích (ml)</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Tồn kho</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variantsData?.data?.map((variant: any) => (
                      <TableRow
                        key={variant.id}
                        className={
                          variant.deleted_at
                            ? "bg-muted/40 hover:bg-muted/60"
                            : ""
                        }
                      >
                        <TableCell className="font-medium">
                          {variant.volume_ml} ml
                          {variant.deleted_at && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                              Đã ẩn
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {variant.sale_price ? (
                            <div>
                              <span className="line-through text-muted-foreground">
                                {formatCurrency(variant.price)}
                              </span>
                              <span className="ml-2 text-red-500">
                                {formatCurrency(variant.sale_price)}
                              </span>
                            </div>
                          ) : (
                            formatCurrency(variant.price)
                          )}
                        </TableCell>
                        <TableCell>{variant.stock_quantity}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {!variant.deleted_at && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditMode(variant)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className={
                                variant.deleted_at
                                  ? productDeleted
                                    ? "text-muted-foreground cursor-not-allowed"
                                    : "text-green-500"
                                  : "text-red-500"
                              }
                              onClick={() => {
                                // Nếu biến thể đang bị ẩn và sản phẩm cũng đang bị ẩn thì không cho phép khôi phục
                                if (variant.deleted_at && productDeleted) {
                                  toast.error("Không thể khôi phục biến thể", {
                                    description:
                                      "Không thể khôi phục biến thể khi sản phẩm đang bị ẩn. Vui lòng khôi phục sản phẩm trước.",
                                  });
                                  return;
                                }

                                setDeleteMode(
                                  variant.deleted_at ? "restore" : "soft"
                                );
                                setVariantToDelete(variant);
                                setIsDeleting(true);
                              }}
                              title={
                                variant.deleted_at && productDeleted
                                  ? "Không thể khôi phục khi sản phẩm đang bị ẩn"
                                  : variant.deleted_at
                                  ? "Khôi phục biến thể"
                                  : "Ẩn biến thể"
                              }
                            >
                              {variant.deleted_at ? (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                  >
                                    <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"></path>
                                    <path d="M3 7H1"></path>
                                    <path d="M23 7h-2"></path>
                                    <path d="M12 6V2"></path>
                                    <path d="m10 4 2 2 2-2"></path>
                                  </svg>
                                  <span className="sr-only">Khôi phục</span>
                                </>
                              ) : (
                                <>
                                  <Trash className="h-4 w-4" />
                                  <span className="sr-only">Xóa</span>
                                </>
                              )}
                            </Button>
                            {variant.deleted_at && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-700"
                                title="Xóa vĩnh viễn"
                                onClick={async () => {
                                  if (!productId) return;
                                  await variantHardDelete.prepareDelete(
                                    variant.id,
                                    productId
                                  );
                                  setShowHardDeleteDialog(true);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                                <span className="sr-only">Xóa vĩnh viễn</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete/Restore Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteMode === "restore"
                ? "Hiển thị lại biến thể"
                : "Ẩn biến thể"}
            </AlertDialogTitle>
            <div>
              {deleteMode === "restore" ? (
                <>
                  {productDeleted ? (
                    <AlertDialogDescription className="space-y-2">
                      <div className="rounded-md bg-destructive/10 p-4 border border-destructive/30">
                        <div className="flex">
                          <svg
                            className="h-5 w-5 text-destructive"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-destructive">
                              Không thể khôi phục biến thể
                            </h3>
                            <div className="mt-2 text-sm text-destructive/90">
                              <p>
                                Biến thể không thể khôi phục khi sản phẩm đang
                                bị ẩn. Vui lòng khôi phục sản phẩm trước, sau đó
                                mới khôi phục biến thể.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  ) : (
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn hiển thị lại biến thể này không?
                    </AlertDialogDescription>
                  )}
                </>
              ) : (
                <>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn ẩn biến thể này không? Biến thể sẽ bị
                    ẩn khỏi cửa hàng nhưng vẫn có thể hiển thị lại sau.
                  </AlertDialogDescription>
                  <div className="mt-3 rounded-md bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-200 dark:border-amber-800/30">
                    <div className="flex">
                      <svg
                        className="h-5 w-5 text-amber-500 mt-0.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      <div className="ml-3">
                        <div className="text-amber-800 dark:text-amber-200 text-sm">
                          <strong>Lưu ý:</strong> Biến thể này sẽ không xuất
                          hiện trong cửa hàng và khách hàng sẽ không thể mua
                          được.
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMode === "restore" && productDeleted}
              className={
                deleteMode === "restore"
                  ? productDeleted
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {deleteMode === "restore" ? "Hiển thị lại" : "Ẩn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Validation Dialog */}
      <AlertDialog
        open={showHardDeleteDialog}
        onOpenChange={setShowHardDeleteDialog}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {variantHardDelete.validationResult?.canDelete
                ? "Xóa vĩnh viễn biến thể"
                : "Không thể xóa vĩnh viễn biến thể"}
            </AlertDialogTitle>
            {variantHardDelete.isChecking ? (
              <div className="flex flex-col items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p>Đang kiểm tra điều kiện xóa...</p>
              </div>
            ) : variantHardDelete.validationResult ? (
              variantHardDelete.validationResult.canDelete ? (
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Biến thể này đã thỏa mãn tất cả điều kiện để xóa vĩnh viễn.
                    Sau khi xóa, biến thể sẽ không thể khôi phục lại được.
                  </p>
                  <p className="font-semibold">
                    Bạn có chắc chắn muốn xóa vĩnh viễn biến thể này?
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="rounded-md bg-destructive/10 p-4 border border-destructive/30 dark:bg-destructive/20">
                    <div className="flex">
                      <svg
                        className="h-5 w-5 text-destructive"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-destructive">
                          Không thể xóa vĩnh viễn
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-sm font-semibold">
                      Không thể xóa vĩnh viễn biến thể này vì các lý do sau:
                    </div>

                    <ul className="list-disc pl-5 space-y-1 text-sm mt-1">
                      {variantHardDelete.validationResult.blockingReasons.map(
                        (reason, index) => (
                          <li key={index} className="text-destructive">
                            {reason}
                          </li>
                        )
                      )}
                    </ul>

                    <div className="text-xs text-muted-foreground pt-2">
                      Gỡ bỏ các liên kết đến biến thể này trước khi thử xóa vĩnh
                      viễn lại.
                    </div>
                  </div>
                </div>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                Đã xảy ra lỗi khi kiểm tra điều kiện xóa vĩnh viễn.
              </p>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={
                variantHardDelete.isDeleting || variantHardDelete.isChecking
              }
            >
              Đóng
            </AlertDialogCancel>
            {variantHardDelete.validationResult?.canDelete && (
              <AlertDialogAction
                onClick={variantHardDelete.confirmDelete}
                className="bg-red-700 hover:bg-red-800"
                disabled={
                  variantHardDelete.isDeleting || variantHardDelete.isChecking
                }
              >
                {variantHardDelete.isDeleting ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Đang xóa...
                  </span>
                ) : (
                  "Xóa vĩnh viễn"
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
