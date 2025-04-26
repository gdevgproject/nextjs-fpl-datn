"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { useCreateProduct } from "../hooks/use-create-product";
import { useUpdateProduct } from "../hooks/use-update-product";
import { useBrands } from "../../brands/hooks/use-brands";
import { useGenders } from "../../genders/hooks/use-genders";
import { usePerfumeTypes } from "../../perfume-types/hooks/use-perfume-types";
import { useConcentrations } from "../../concentrations/hooks/use-concentrations";
import { ProductVariantsTab } from "./product-variants-tab";
import { ProductImagesTab } from "./product-images-tab";
import { ProductCategoriesTab } from "./product-categories-tab";
import { ProductIngredientsTab } from "./product-ingredients-tab";
import { ProductScentsTab } from "./product-scents-tab";

// Define the form schema with Zod
const productFormSchema = z.object({
  name: z
    .string()
    .min(1, "Tên sản phẩm không được để trống")
    .max(255, "Tên sản phẩm không được vượt quá 255 ký tự"),
  product_code: z
    .string()
    .max(100, "Mã sản phẩm không được vượt quá 100 ký tự")
    .optional()
    .nullable(),
  short_description: z
    .string()
    .max(500, "Mô tả ngắn không được vượt quá 500 ký tự")
    .optional()
    .nullable(),
  long_description: z
    .string()
    .max(5000, "Mô tả chi tiết không được vượt quá 5000 ký tự")
    .optional()
    .nullable(),
  brand_id: z.string().optional().nullable(),
  gender_id: z.string().optional().nullable(),
  perfume_type_id: z.string().optional().nullable(),
  concentration_id: z.string().optional().nullable(),
  origin_country: z
    .string()
    .max(100, "Xuất xứ không được vượt quá 100 ký tự")
    .optional()
    .nullable(),
  release_year: z
    .string()
    .refine(
      (val) =>
        !val ||
        (Number.parseInt(val) >= 1800 &&
          Number.parseInt(val) <= new Date().getFullYear()),
      {
        message: `Năm phát hành phải từ 1800 đến ${new Date().getFullYear()}`,
      }
    )
    .optional()
    .nullable(),
  style: z
    .string()
    .max(100, "Phong cách không được vượt quá 100 ký tự")
    .optional()
    .nullable(),
  sillage: z
    .string()
    .max(100, "Độ tỏa hương không được vượt quá 100 ký tự")
    .optional()
    .nullable(),
  longevity: z
    .string()
    .max(100, "Độ lưu hương không được vượt quá 100 ký tự")
    .optional()
    .nullable(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  product?: any;
}

export function ProductDialog({
  open,
  onOpenChange,
  mode,
  product,
}: ProductDialogProps) {
  const toast = useSonnerToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [tabsVisited, setTabsVisited] = useState<Record<string, boolean>>({
    basic: true,
    variants: false,
    images: false,
    categories: false,
    scents: false,
    ingredients: false,
  });

  // Mutations for creating and updating products
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  // Fetch attribute data
  const { data: brandsData } = useBrands();
  const { data: gendersData } = useGenders();
  const { data: perfumeTypesData } = usePerfumeTypes();
  const { data: concentrationsData } = useConcentrations();

  // Initialize the form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      product_code: null,
      short_description: null,
      long_description: null,
      brand_id: null,
      gender_id: null,
      perfume_type_id: null,
      concentration_id: null,
      origin_country: null,
      release_year: null,
      style: null,
      sillage: null,
      longevity: null,
    },
  });

  // Set form values when editing an existing product
  useEffect(() => {
    if (mode === "edit" && product) {
      form.reset({
        name: product.name,
        product_code: product.product_code,
        short_description: product.short_description,
        long_description: product.long_description,
        brand_id: product.brand_id?.toString() || null,
        gender_id: product.gender_id?.toString() || null,
        perfume_type_id: product.perfume_type_id?.toString() || null,
        concentration_id: product.concentration_id?.toString() || null,
        origin_country: product.origin_country,
        release_year: product.release_year?.toString() || null,
        style: product.style,
        sillage: product.sillage,
        longevity: product.longevity,
      });
      setCreatedProductId(product.id);

      // Đánh dấu tất cả các tab đã được truy cập trong chế độ chỉnh sửa
      setTabsVisited({
        basic: true,
        variants: true,
        images: true,
        categories: true,
        scents: true,
        ingredients: true,
      });
    } else {
      form.reset({
        name: "",
        product_code: null,
        short_description: null,
        long_description: null,
        brand_id: null,
        gender_id: null,
        perfume_type_id: null,
        concentration_id: null,
        origin_country: null,
        release_year: null,
        style: null,
        sillage: null,
        longevity: null,
      });
      setCreatedProductId(null);
      setTabsVisited({
        basic: true,
        variants: false,
        images: false,
        categories: false,
        scents: false,
        ingredients: false,
      });
    }
    setActiveTab("basic");
  }, [mode, product, form, open]);

  // Handle form submission
  const onSubmit = async (values: ProductFormValues) => {
    try {
      setIsProcessing(true);
      console.log("Form submission values:", values); // Debug log

      // Convert string IDs to numbers or null
      const formattedValues = {
        ...values,
        // Ensure these fields are properly passed along
        style: values.style || null,
        sillage: values.sillage || null,
        longevity: values.longevity || null,
        long_description: values.long_description || null,
        // Convert numeric fields
        brand_id: values.brand_id ? Number.parseInt(values.brand_id) : null,
        gender_id: values.gender_id ? Number.parseInt(values.gender_id) : null,
        perfume_type_id: values.perfume_type_id
          ? Number.parseInt(values.perfume_type_id)
          : null,
        concentration_id: values.concentration_id
          ? Number.parseInt(values.concentration_id)
          : null,
        release_year: values.release_year
          ? Number.parseInt(values.release_year)
          : null,
      };

      if (mode === "create") {
        // Create new product
        const result = await createProductMutation.mutateAsync(formattedValues);
        const newProductId =
          Array.isArray(result) && result.length > 0 ? result[0].id : null;

        if (newProductId) {
          setCreatedProductId(newProductId);
          toast.success("Tạo sản phẩm thành công", {
            description: "Hãy tiếp tục thêm biến thể sản phẩm",
          });
          setActiveTab("variants"); // Move to variants tab after creation
          // Đánh dấu tab variants đã được truy cập
          setTabsVisited((prev) => ({
            ...prev,
            variants: true,
          }));
        }
      } else if (mode === "edit" && product) {
        // Update existing product - Properly format data for the hook
        await updateProductMutation.mutateAsync({
          id: product.id,
          formData: formattedValues, // Properly passing formData as a separate property
        });
        toast.success("Cập nhật thành công", {
          description: "Thông tin sản phẩm đã được cập nhật",
        });
      }
    } catch (error) {
      toast.error(
        `${mode === "create" ? "Tạo" : "Cập nhật"} sản phẩm thất bại`,
        {
          description:
            error instanceof Error ? error.message : "Lỗi không xác định",
        }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (isProcessing) return; // Prevent closing while processing
    onOpenChange(false);
  };

  // Xử lý chuyển tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Đánh dấu tab đã được truy cập
    setTabsVisited((prev) => ({
      ...prev,
      [value]: true,
    }));
  };

  // Kiểm tra xem tab có thể truy cập (khi đã tạo sản phẩm) hay không
  const isTabAccessible = (tabName: string) => {
    if (tabName === "basic") return true;
    return !!createdProductId;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Thêm một sản phẩm mới vào hệ thống. Sau khi tạo sản phẩm, bạn có thể thêm biến thể, hình ảnh và các thông tin khác."
              : "Chỉnh sửa thông tin sản phẩm."}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="basic" className="relative">
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                  1
                </span>
                <span>Thông tin cơ bản</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="variants"
              disabled={!isTabAccessible("variants")}
              className={`relative ${
                tabsVisited.variants
                  ? "after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-green-500 after:rounded-full"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-primary/70 text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                  2
                </span>
                <span>Biến thể</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="images"
              disabled={!isTabAccessible("images")}
              className={`relative ${
                tabsVisited.images
                  ? "after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-green-500 after:rounded-full"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-primary/70 text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                  3
                </span>
                <span>Hình ảnh</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              disabled={!isTabAccessible("categories")}
              className={`relative ${
                tabsVisited.categories
                  ? "after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-green-500 after:rounded-full"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-primary/70 text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                  4
                </span>
                <span>Danh mục</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="scents"
              disabled={!isTabAccessible("scents")}
              className={`relative ${
                tabsVisited.scents
                  ? "after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-green-500 after:rounded-full"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-primary/70 text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                  5
                </span>
                <span>Nhóm hương</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="ingredients"
              disabled={!isTabAccessible("ingredients")}
              className={`relative ${
                tabsVisited.ingredients
                  ? "after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-green-500 after:rounded-full"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-primary/70 text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                  6
                </span>
                <span>Thành phần</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="basic"
            className="space-y-4 mt-4 border rounded-lg p-4"
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-medium">
                          Tên sản phẩm <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên sản phẩm" {...field} />
                        </FormControl>
                        <FormDescription>
                          Tên đầy đủ của sản phẩm.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="product_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Mã sản phẩm
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập mã sản phẩm (tùy chọn)"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Mã sản phẩm nội bộ (nếu có).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Thương hiệu
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn thương hiệu" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="none">
                              Không có thương hiệu
                            </SelectItem>
                            {brandsData?.data?.map((brand: any) => (
                              <SelectItem
                                key={brand.id}
                                value={brand.id.toString()}
                              >
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Thương hiệu của sản phẩm.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Giới tính</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Không xác định</SelectItem>
                            {gendersData?.data?.map((gender: any) => (
                              <SelectItem
                                key={gender.id}
                                value={gender.id.toString()}
                              >
                                {gender.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Giới tính phù hợp với sản phẩm.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="perfume_type_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Loại nước hoa
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại nước hoa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Không xác định</SelectItem>
                            {perfumeTypesData?.data?.map((type: any) => (
                              <SelectItem
                                key={type.id}
                                value={type.id.toString()}
                              >
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Loại nước hoa (Designer, Niche...).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="concentration_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Nồng độ</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn nồng độ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Không xác định</SelectItem>
                            {concentrationsData?.data?.map(
                              (concentration: any) => (
                                <SelectItem
                                  key={concentration.id}
                                  value={concentration.id.toString()}
                                >
                                  {concentration.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Nồng độ của nước hoa (EDP, EDT...).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="origin_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Xuất xứ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập xuất xứ (tùy chọn)"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Quốc gia xuất xứ của sản phẩm.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="release_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Năm phát hành
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Nhập năm phát hành (tùy chọn)"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Năm phát hành sản phẩm.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Phong cách
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập phong cách (tùy chọn)"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Phong cách của sản phẩm (Sang trọng, Quyến rũ...).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sillage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Độ tỏa hương
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập độ tỏa hương (tùy chọn)"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Độ tỏa hương của sản phẩm (Gần, Vừa, Xa...).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longevity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Độ lưu hương
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập độ lưu hương (tùy chọn)"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Độ lưu hương của sản phẩm (Kém, Tốt, Rất tốt...).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Mô tả ngắn</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập mô tả ngắn về sản phẩm (tùy chọn)"
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Mô tả ngắn gọn về sản phẩm (hiển thị ở trang danh sách).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="long_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        Mô tả chi tiết
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập mô tả chi tiết về sản phẩm (tùy chọn)"
                          className="resize-none"
                          rows={6}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Mô tả chi tiết về sản phẩm (hiển thị ở trang chi tiết).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="min-w-[120px]"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : mode === "create" ? (
                      "Tạo sản phẩm"
                    ) : (
                      "Cập nhật sản phẩm"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent
            value="variants"
            className="space-y-4 mt-4 border rounded-lg p-4"
          >
            <ProductVariantsTab 
              productId={createdProductId || product?.id}
              productDeleted={!!product?.deleted_at} 
            />
          </TabsContent>

          <TabsContent
            value="images"
            className="space-y-4 mt-4 border rounded-lg p-4"
          >
            <ProductImagesTab productId={createdProductId || product?.id} />
          </TabsContent>

          <TabsContent
            value="categories"
            className="space-y-4 mt-4 border rounded-lg p-4"
          >
            <ProductCategoriesTab productId={createdProductId || product?.id} />
          </TabsContent>

          <TabsContent
            value="scents"
            className="space-y-4 mt-4 border rounded-lg p-4"
          >
            <ProductScentsTab productId={createdProductId || product?.id} />
          </TabsContent>

          <TabsContent
            value="ingredients"
            className="space-y-4 mt-4 border rounded-lg p-4"
          >
            <ProductIngredientsTab
              productId={createdProductId || product?.id}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
