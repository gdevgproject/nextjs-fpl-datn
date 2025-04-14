"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  useProductVariants,
  useCreateProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
} from "../hooks/use-product-variants"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Trash } from "lucide-react"

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
    .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0, {
      message: "Giá phải là số không âm",
    }),
  sale_price: z
    .string()
    .refine((val) => val === "" || (!isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0), {
      message: "Giá khuyến mãi phải là số không âm",
    })
    .optional(),
  sku: z.string().max(100, "SKU không được vượt quá 100 ký tự").optional(),
  stock_quantity: z
    .string()
    .min(1, "Số lượng tồn kho không được để trống")
    .refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) >= 0, {
      message: "Số lượng tồn kho phải là số không âm",
    }),
})

type VariantFormValues = z.infer<typeof variantFormSchema>

interface ProductVariantsTabProps {
  productId: number | null | undefined
}

export function ProductVariantsTab({ productId }: ProductVariantsTabProps) {
  const toast = useSonnerToast()
  const [editingVariant, setEditingVariant] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState<any | null>(null)

  // Fetch variants for the product
  const { data: variantsData, isLoading, isError } = useProductVariants(productId || null)

  // Mutations for creating, updating, and deleting variants
  const createVariantMutation = useCreateProductVariant()
  const updateVariantMutation = useUpdateProductVariant()
  const deleteVariantMutation = useDeleteProductVariant()

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
  })

  // Set form values when editing an existing variant
  const setEditMode = (variant: any) => {
    setEditingVariant(variant)
    form.reset({
      volume_ml: variant.volume_ml.toString(),
      price: variant.price.toString(),
      sale_price: variant.sale_price?.toString() || "",
      sku: variant.sku || "",
      stock_quantity: variant.stock_quantity.toString(),
    })
  }

  // Reset form to create mode
  const resetForm = () => {
    setEditingVariant(null)
    form.reset({
      volume_ml: "",
      price: "",
      sale_price: "",
      sku: "",
      stock_quantity: "0",
    })
  }

  // Handle form submission
  const onSubmit = async (values: VariantFormValues) => {
    if (!productId) {
      toast.error("Không tìm thấy ID sản phẩm")
      return
    }

    try {
      // Convert string values to numbers
      const formattedValues = {
        product_id: productId,
        volume_ml: Number.parseInt(values.volume_ml),
        price: Number.parseFloat(values.price),
        sale_price: values.sale_price ? Number.parseFloat(values.sale_price) : null,
        sku: values.sku || null,
        stock_quantity: Number.parseInt(values.stock_quantity),
      }

      // Check if sale price is higher than regular price
      if (formattedValues.sale_price !== null && formattedValues.sale_price > formattedValues.price) {
        toast.error("Giá khuyến mãi không thể cao hơn giá gốc")
        return
      }

      if (editingVariant) {
        // Update existing variant
        await updateVariantMutation.mutateAsync({
          id: editingVariant.id,
          ...formattedValues,
        })
        toast.success("Biến thể đã được cập nhật thành công")
      } else {
        // Create new variant
        await createVariantMutation.mutateAsync(formattedValues)
        toast.success("Biến thể đã được tạo thành công")
      }

      // Reset form after successful submission
      resetForm()
    } catch (error) {
      toast.error(
        `Lỗi khi ${editingVariant ? "cập nhật" : "tạo"} biến thể: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      )
    }
  }

  // Handle delete button click
  const handleDeleteClick = (variant: any) => {
    setVariantToDelete(variant)
    setIsDeleting(true)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!variantToDelete) return

    try {
      await deleteVariantMutation.softDelete(variantToDelete.id)
      toast.success("Biến thể đã được xóa thành công")
    } catch (error) {
      toast.error(`Lỗi khi xóa biến thể: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsDeleting(false)
      setVariantToDelete(null)
    }
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
  }

  if (!productId) {
    return (
      <div className="flex justify-center items-center p-8">
        <p>Vui lòng tạo sản phẩm trước khi thêm biến thể.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Variant Form */}
        <Card>
          <CardHeader>
            <CardTitle>{editingVariant ? "Chỉnh sửa biến thể" : "Thêm biến thể mới"}</CardTitle>
            <CardDescription>
              {editingVariant
                ? "Cập nhật thông tin biến thể sản phẩm"
                : "Thêm một biến thể mới cho sản phẩm (dung tích, giá...)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="volume_ml"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dung tích (ml)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Nhập dung tích" {...field} />
                      </FormControl>
                      <FormDescription>Dung tích của biến thể (ml).</FormDescription>
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
                        <Input type="number" placeholder="Nhập giá gốc" {...field} />
                      </FormControl>
                      <FormDescription>Giá gốc của biến thể (VND).</FormDescription>
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
                        <Input type="number" placeholder="Nhập giá khuyến mãi (tùy chọn)" {...field} />
                      </FormControl>
                      <FormDescription>Giá khuyến mãi của biến thể (VND, nếu có).</FormDescription>
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
                        <Input placeholder="Nhập mã SKU (tùy chọn)" {...field} />
                      </FormControl>
                      <FormDescription>Mã SKU để quản lý kho (tùy chọn).</FormDescription>
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
                        <Input type="number" placeholder="Nhập số lượng tồn kho" {...field} />
                      </FormControl>
                      <FormDescription>Số lượng hiện có trong kho.</FormDescription>
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
                  <Button type="submit">{editingVariant ? "Cập nhật biến thể" : "Thêm biến thể"}</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Variants List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách biến thể</CardTitle>
            <CardDescription>Các biến thể hiện có của sản phẩm</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : isError ? (
              <div className="text-red-500 text-center py-4">Đã xảy ra lỗi khi tải dữ liệu biến thể.</div>
            ) : variantsData?.data?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Chưa có biến thể nào cho sản phẩm này.</p>
                <p className="text-sm mt-2">Sử dụng form bên trái để thêm biến thể mới.</p>
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
                      <TableRow key={variant.id}>
                        <TableCell className="font-medium">{variant.volume_ml} ml</TableCell>
                        <TableCell>
                          {variant.sale_price ? (
                            <div>
                              <span className="line-through text-muted-foreground">
                                {formatCurrency(variant.price)}
                              </span>
                              <span className="ml-2 text-red-500">{formatCurrency(variant.sale_price)}</span>
                            </div>
                          ) : (
                            formatCurrency(variant.price)
                          )}
                        </TableCell>
                        <TableCell>{variant.stock_quantity}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => setEditMode(variant)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => handleDeleteClick(variant)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa biến thể</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa biến thể này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
