"use client";

import { useState } from "react";
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
const variantFormSchema = z.object({
  volume_ml: z
    .string()
    .min(1, "Dung tích không được để trống")
    .refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0, {
      message: "Dung tích phải là số dương",
    }),
  price: z
    .string()
    .min(1, "Giá không được để trống")
    .refine(
      (val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0,
      {
        message: "Giá phải là số không âm",
      }
    ),
  sale_price: z
    .string()
    .refine(
      (val) =>
        val === "" ||
        (!isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0),
      {
        message: "Giá khuyến mãi phải là số không âm",
      }
    )
    .optional(),
  sku: z.string().max(100, "SKU không được vượt quá 100 ký tự").optional(),
  stock_quantity: z
    .string()
    .min(1, "Số lượng tồn kho không được để trống")
    .refine(
      (val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) >= 0,
      {
        message: "Số lượng tồn kho phải là số không âm",
      }
    ),
});

type VariantFormValues = z.infer<typeof variantFormSchema>;

interface ProductVariantsTabProps {
  productId: number | null | undefined;
}

export function ProductVariantsTab({ productId }: ProductVariantsTabProps) {
  const toast = useSonnerToast();
  const [editingVariant, setEditingVariant] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<any | null>(null);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"soft" | "restore">("soft");

  // Hard delete state & hook
  const [showHardDeleteDialog, setShowHardDeleteDialog] = useState(false);
  const variantHardDelete = useVariantHardDelete();

  // Fetch variants for the product
  const {
    data: variantsData,
    isLoading,
    isError,
  } = useProductVariants(productId || null, includeDeleted);

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
      // Convert string values to numbers
      const formattedValues = {
        product_id: productId,
        volume_ml: Number.parseInt(values.volume_ml),
        price: Number.parseFloat(values.price),
        sale_price: values.sale_price
          ? Number.parseFloat(values.sale_price)
          : null,
        sku: values.sku || null,
        stock_quantity: Number.parseInt(values.stock_quantity),
      };

      // Check if sale price is higher than regular price
      if (
        formattedValues.sale_price !== null &&
        formattedValues.sale_price > formattedValues.price
      ) {
        toast.error("Giá khuyến mãi không thể cao hơn giá gốc");
        return;
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
        await createVariantMutation.mutateAsync(formattedValues);
        toast.success("Biến thể đã được tạo thành công");
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
        toast.success("Biến thể đã được xóa thành công");
      } else {
        await deleteVariantMutation.restore(variantToDelete.id);
        toast.success("Biến thể đã được khôi phục thành công");
      }
    } catch (error) {
      toast.error(
        `Lỗi khi ${deleteMode === "soft" ? "xóa" : "khôi phục"} biến thể: ${
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
                      <FormLabel>Dung tích (ml)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Nhập dung tích"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Dung tích của biến thể (ml).
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
                      <FormLabel>Giá gốc</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Nhập giá gốc"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Giá gốc của biến thể (VND).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sale_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá khuyến mãi</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Nhập giá khuyến mãi (tùy chọn)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Giá khuyến mãi của biến thể (VND, nếu có).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập mã SKU (tùy chọn)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Mã SKU để quản lý kho (tùy chọn).
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
                      <FormLabel>Số lượng tồn kho</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Nhập số lượng tồn kho"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Số lượng hiện có trong kho.
                      </FormDescription>
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
                onChange={(e) => setIncludeDeleted(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="showDeleted" className="text-sm cursor-pointer">
                {includeDeleted
                  ? "Chỉ hiển thị biến thể đã xóa"
                  : "Hiển thị biến thể đã xóa"}
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
                        className={variant.deleted_at ? "bg-gray-50" : ""}
                      >
                        <TableCell className="font-medium">
                          {variant.volume_ml} ml
                          {variant.deleted_at && (
                            <span className="ml-2 text-xs text-red-500 font-normal">
                              (Đã xóa)
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
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                              onClick={() => {
                                setDeleteMode(
                                  variant.deleted_at ? "restore" : "soft"
                                );
                                setVariantToDelete(variant);
                                setIsDeleting(true);
                              }}
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
              {deleteMode === "restore" ? "Khôi phục biến thể" : "Xóa biến thể"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteMode === "restore"
                ? "Bạn có chắc chắn muốn khôi phục biến thể này không?"
                : "Bạn có chắc chắn muốn xóa biến thể này không? Biến thể sẽ bị đánh dấu là đã xóa nhưng vẫn có thể khôi phục lại sau."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className={
                deleteMode === "restore"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {deleteMode === "restore" ? "Khôi phục" : "Xóa"}
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
            <AlertDialogDescription className="space-y-2">
              {variantHardDelete.isChecking ? (
                <div className="flex flex-col items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                  <p>Đang kiểm tra điều kiện xóa...</p>
                </div>
              ) : variantHardDelete.validationResult ? (
                variantHardDelete.validationResult.canDelete ? (
                  <>
                    <p>
                      Biến thể này đã thỏa mãn tất cả điều kiện để xóa vĩnh
                      viễn. Sau khi xóa, biến thể sẽ không thể khôi phục lại
                      được.
                    </p>
                    <p className="font-semibold">
                      Bạn có chắc chắn muốn xóa vĩnh viễn biến thể này?
                    </p>
                  </>
                ) : (
                  <>
                    <div className="rounded-md bg-red-50 p-4 border border-red-100">
                      <div className="flex">
                        <svg
                          className="h-5 w-5 text-red-500"
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
                          <h3 className="text-sm font-medium text-red-800">
                            Không thể xóa vĩnh viễn
                          </h3>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm font-semibold">
                      Không thể xóa vĩnh viễn biến thể này vì các lý do sau:
                    </p>

                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {variantHardDelete.validationResult.blockingReasons.map(
                        (reason, index) => (
                          <li key={index} className="text-red-700">
                            {reason}
                          </li>
                        )
                      )}
                    </ul>

                    <p className="text-xs text-gray-500 pt-2">
                      Gỡ bỏ các liên kết đến biến thể này trước khi thử xóa vĩnh
                      viễn lại.
                    </p>
                  </>
                )
              ) : (
                <p>Đã xảy ra lỗi khi kiểm tra điều kiện xóa vĩnh viễn.</p>
              )}
            </AlertDialogDescription>
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
