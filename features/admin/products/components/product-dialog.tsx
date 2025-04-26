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
    .max(255, "Tên sản phẩm không được vượt quá 255 ký tự")
    .trim(),
  product_code: z
    .string()
    .max(100, "Mã sản phẩm không được vượt quá 100 ký tự")
    .trim()
    .optional()
    .nullable(),
  short_description: z
    .string()
    .max(500, "Mô tả ngắn không được vượt quá 500 ký tự")
    .trim()
    .optional()
    .nullable(),
  long_description: z
    .string()
    .max(5000, "Mô tả chi tiết không được vượt quá 5000 ký tự")
    .trim()
    .optional()
    .nullable(),
  brand_id: z.string().optional().nullable(),
  gender_id: z.string().optional().nullable(),
  perfume_type_id: z.string().optional().nullable(),
  concentration_id: z.string().optional().nullable(),
  origin_country: z
    .string()
    .max(100, "Xuất xứ không được vượt quá 100 ký tự")
    .trim()
    .optional()
    .nullable(),
  release_year: z
    .string()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "Năm phát hành phải là số nguyên dương",
    })
    .refine(
      (val) =>
        !val ||
        (parseInt(val) >= 1800 && parseInt(val) <= new Date().getFullYear()),
      {
        message: `Năm phát hành phải từ 1800 đến ${new Date().getFullYear()}`,
      }
    )
    .optional()
    .nullable(),
  style: z
    .string()
    .max(100, "Phong cách không được vượt quá 100 ký tự")
    .trim()
    .optional()
    .nullable(),
  sillage: z
    .string()
    .max(100, "Độ tỏa hương không được vượt quá 100 ký tự")
    .trim()
    .optional()
    .nullable(),
  longevity: z
    .string()
    .max(100, "Độ lưu hương không được vượt quá 100 ký tự")
    .trim()
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
      <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[92vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="px-0 sm:px-2">
          <DialogTitle className="text-xl sm:text-2xl">
            {mode === "create" ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
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
          <div className="overflow-x-auto pb-2">
            <TabsList className="mb-4 inline-flex min-w-max w-full sm:w-auto">
              <TabsTrigger value="basic" className="relative">
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                    1
                  </span>
                  <span className="sm:inline hidden">Thông tin cơ bản</span>
                  <span className="sm:hidden inline">Cơ bản</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="variants"
                disabled={!isTabAccessible("variants")}
              >
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-primary/70 text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Biến thể</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="images" disabled={!isTabAccessible("images")}>
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
              >
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-primary/70 text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                    4
                  </span>
                  <span className="sm:inline hidden">Danh mục</span>
                  <span className="sm:hidden inline">D.mục</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="scents" disabled={!isTabAccessible("scents")}>
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-primary/70 text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                    5
                  </span>
                  <span className="sm:inline hidden">Nhóm hương</span>
                  <span className="sm:hidden inline">Hương</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="ingredients"
                disabled={!isTabAccessible("ingredients")}
              >
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-primary/70 text-primary-foreground w-5 h-5 flex items-center justify-center text-xs">
                    6
                  </span>
                  <span className="sm:inline hidden">Thành phần</span>
                  <span className="sm:hidden inline">T.phần</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="basic"
            className="space-y-4 mt-2 border rounded-lg p-3 sm:p-4"
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                        <FormDescription className="text-xs sm:text-sm">
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
                          <div className="relative">
                            <Input
                              placeholder="Nhập xuất xứ (tùy chọn)"
                              {...field}
                              value={field.value || ""}
                              className="w-full pr-20"
                            />
                            <div className="absolute inset-y-0 right-0">
                              <Select
                                onValueChange={(value) => {
                                  if (value !== "custom") {
                                    field.onChange(value);
                                  }
                                }}
                                value="custom"
                              >
                                <SelectTrigger className="h-10 w-[110px] border-0 bg-transparent hover:bg-muted/30 focus:ring-0">
                                  <SelectValue placeholder="Gợi ý" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                  <SelectItem value="custom">
                                    Tùy chọn
                                  </SelectItem>
                                  <SelectItem value="Pháp">Pháp</SelectItem>
                                  <SelectItem value="Việt Nam">
                                    Việt Nam
                                  </SelectItem>
                                  <SelectItem value="Ý">Ý</SelectItem>
                                  <SelectItem value="Anh">Anh</SelectItem>
                                  <SelectItem value="Mỹ">Mỹ</SelectItem>
                                  <SelectItem value="Đức">Đức</SelectItem>
                                  <SelectItem value="Tây Ban Nha">
                                    Tây Ban Nha
                                  </SelectItem>
                                  <SelectItem value="Nhật Bản">
                                    Nhật Bản
                                  </SelectItem>
                                  <SelectItem value="Các Tiểu vương quốc Ả Rập">
                                    UAE
                                  </SelectItem>
                                  <SelectItem value="Thụy Sĩ">
                                    Thụy Sĩ
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
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
                          <div className="relative">
                            <Input
                              type="number"
                              min={1800}
                              max={new Date().getFullYear()}
                              placeholder={`1800-${new Date().getFullYear()}`}
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                // Chỉ cho phép nhập giá trị hợp lệ
                                const value = e.target.value;
                                const numValue = Number(value);

                                if (
                                  value === "" ||
                                  (numValue >= 0 &&
                                    Number.isInteger(numValue) &&
                                    value.length <= 4)
                                ) {
                                  field.onChange(value);
                                }
                              }}
                              className="pr-24"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  const currentYear = new Date().getFullYear();
                                  field.onChange(currentYear.toString());
                                }}
                                title="Đặt năm hiện tại"
                              >
                                <span className="text-xs font-medium">
                                  {new Date().getFullYear()}
                                </span>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => field.onChange("")}
                                title="Xóa giá trị"
                                disabled={!field.value}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M5.83 5.146a.5.5 0 0 0 0 .708L7.975 8l-2.147 2.146a.5.5 0 0 0 .707.708l2.147-2.147 2.146 2.147a.5.5 0 0 0 .707-.708L9.39 8l2.146-2.146a.5.5 0 0 0-.707-.708L8.683 7.293 6.536 5.146a.5.5 0 0 0-.707 0z" />
                                  <path d="M13.683 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9.5a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zM4.183 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.5a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Năm phát hành sản phẩm (từ 1800 đến hiện tại).
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
                          <div className="relative">
                            <Input
                              placeholder="Nhập phong cách (tùy chọn)"
                              {...field}
                              value={field.value || ""}
                              className="w-full pr-20"
                            />
                            <div className="absolute inset-y-0 right-0">
                              <Select
                                onValueChange={(value) => {
                                  if (value !== "custom") {
                                    field.onChange(value);
                                  }
                                }}
                                value="custom"
                              >
                                <SelectTrigger className="h-10 w-[110px] border-0 bg-transparent hover:bg-muted/30 focus:ring-0">
                                  <SelectValue placeholder="Gợi ý" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                  <SelectItem value="custom">
                                    Tùy chọn
                                  </SelectItem>
                                  <SelectItem value="Sang trọng">
                                    Sang trọng
                                  </SelectItem>
                                  <SelectItem value="Thanh lịch">
                                    Thanh lịch
                                  </SelectItem>
                                  <SelectItem value="Quyến rũ">
                                    Quyến rũ
                                  </SelectItem>
                                  <SelectItem value="Tươi mát">
                                    Tươi mát
                                  </SelectItem>
                                  <SelectItem value="Trẻ trung">
                                    Trẻ trung
                                  </SelectItem>
                                  <SelectItem value="Tinh tế">
                                    Tinh tế
                                  </SelectItem>
                                  <SelectItem value="Cá tính">
                                    Cá tính
                                  </SelectItem>
                                  <SelectItem value="Mạnh mẽ">
                                    Mạnh mẽ
                                  </SelectItem>
                                  <SelectItem value="Hiện đại">
                                    Hiện đại
                                  </SelectItem>
                                  <SelectItem value="Cổ điển">
                                    Cổ điển
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
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
                          <div className="relative">
                            <Input
                              placeholder="Nhập độ tỏa hương (tùy chọn)"
                              {...field}
                              value={field.value || ""}
                              className="w-full pr-20"
                            />
                            <div className="absolute inset-y-0 right-0">
                              <Select
                                onValueChange={(value) => {
                                  if (value !== "custom") {
                                    field.onChange(value);
                                  }
                                }}
                                value="custom"
                              >
                                <SelectTrigger className="h-10 w-[110px] border-0 bg-transparent hover:bg-muted/30 focus:ring-0">
                                  <SelectValue placeholder="Gợi ý" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                  <SelectItem value="custom">
                                    Tùy chọn
                                  </SelectItem>
                                  <SelectItem value="Rất nhẹ">
                                    Rất nhẹ
                                  </SelectItem>
                                  <SelectItem value="Nhẹ">Nhẹ</SelectItem>
                                  <SelectItem value="Vừa phải">
                                    Vừa phải
                                  </SelectItem>
                                  <SelectItem value="Mạnh">Mạnh</SelectItem>
                                  <SelectItem value="Rất mạnh">
                                    Rất mạnh
                                  </SelectItem>
                                  <SelectItem value="Lan tỏa xa">
                                    Lan tỏa xa
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Độ tỏa hương là khả năng lan tỏa mùi hương xung quanh
                          người sử dụng.
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
                          <div className="relative">
                            <Input
                              placeholder="Nhập độ lưu hương (tùy chọn)"
                              {...field}
                              value={field.value || ""}
                              className="w-full pr-20"
                            />
                            <div className="absolute inset-y-0 right-0">
                              <Select
                                onValueChange={(value) => {
                                  if (value !== "custom") {
                                    field.onChange(value);
                                  }
                                }}
                                value="custom"
                              >
                                <SelectTrigger className="h-10 w-[110px] border-0 bg-transparent hover:bg-muted/30 focus:ring-0">
                                  <SelectValue placeholder="Gợi ý" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                  <SelectItem value="custom">
                                    Tùy chọn
                                  </SelectItem>
                                  <SelectItem value="Rất ngắn (1-2 giờ)">
                                    Rất ngắn
                                  </SelectItem>
                                  <SelectItem value="Ngắn (2-4 giờ)">
                                    Ngắn
                                  </SelectItem>
                                  <SelectItem value="Vừa phải (4-6 giờ)">
                                    Vừa phải
                                  </SelectItem>
                                  <SelectItem value="Tốt (6-8 giờ)">
                                    Tốt
                                  </SelectItem>
                                  <SelectItem value="Rất tốt (8-12 giờ)">
                                    Rất tốt
                                  </SelectItem>
                                  <SelectItem value="Xuất sắc (12+ giờ)">
                                    Xuất sắc
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Độ lưu hương là thời gian mùi hương có thể được cảm
                          nhận trên da sau khi sử dụng.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => {
                    const maxChars = 500;
                    const charsLeft = maxChars - (field.value?.length || 0);
                    const isAlmostFull = charsLeft <= 50;

                    return (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Mô tả ngắn
                          <span
                            className={`ml-2 text-xs ${
                              isAlmostFull
                                ? "text-red-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            (còn {charsLeft} ký tự)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              placeholder="Nhập mô tả ngắn về sản phẩm (tùy chọn)"
                              className="resize-none pr-16"
                              rows={3}
                              maxLength={maxChars}
                              {...field}
                              value={field.value || ""}
                            />
                            <div className="absolute bottom-2 right-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={`h-6 px-1.5 text-xs ${
                                  !field.value ? "opacity-50" : ""
                                }`}
                                onClick={() => field.onChange("")}
                                disabled={!field.value}
                                title="Xóa mô tả ngắn"
                              >
                                Xóa
                              </Button>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Mô tả ngắn gọn về sản phẩm (hiển thị ở trang danh sách
                          sản phẩm và kết quả tìm kiếm).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="long_description"
                  render={({ field }) => {
                    const maxChars = 5000;
                    const charsLeft = maxChars - (field.value?.length || 0);
                    const isAlmostFull = charsLeft <= 250;
                    return (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Mô tả chi tiết
                          <span
                            className={`ml-2 text-xs ${
                              isAlmostFull
                                ? "text-red-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            (còn {charsLeft} ký tự)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              placeholder="Nhập mô tả chi tiết về sản phẩm (tùy chọn)"
                              className="resize-none pr-16"
                              rows={6}
                              maxLength={maxChars}
                              {...field}
                              value={field.value || ""}
                            />
                            <div className="absolute bottom-2 right-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={`h-6 px-1.5 text-xs ${
                                  !field.value ? "opacity-50" : ""
                                }`}
                                onClick={() => field.onChange("")}
                                disabled={!field.value}
                                title="Xóa mô tả chi tiết"
                              >
                                Xóa
                              </Button>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Mô tả chi tiết về sản phẩm, bao gồm thông tin về mùi
                          hương, cảm nhận và lịch sử của sản phẩm. Hiển thị ở
                          trang chi tiết sản phẩm.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
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
            className="space-y-4 mt-2 border rounded-lg p-3 sm:p-4"
          >
            <ProductVariantsTab
              productId={createdProductId || product?.id}
              productDeleted={!!product?.deleted_at}
            />
          </TabsContent>

          <TabsContent
            value="images"
            className="space-y-4 mt-2 border rounded-lg p-3 sm:p-4"
          >
            <ProductImagesTab productId={createdProductId || product?.id} />
          </TabsContent>

          <TabsContent
            value="categories"
            className="space-y-4 mt-2 border rounded-lg p-3 sm:p-4"
          >
            <ProductCategoriesTab productId={createdProductId || product?.id} />
          </TabsContent>

          <TabsContent
            value="scents"
            className="space-y-4 mt-2 border rounded-lg p-3 sm:p-4"
          >
            <ProductScentsTab productId={createdProductId || product?.id} />
          </TabsContent>

          <TabsContent
            value="ingredients"
            className="space-y-4 mt-2 border rounded-lg p-3 sm:p-4"
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
