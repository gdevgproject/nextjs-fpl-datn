"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, ProductFormData } from "../schemas";
import { useProductLookups } from "../queries";
import {
  useCreateProduct,
  useUpdateProduct,
  useUploadProductImage,
} from "../queries";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { useGetProductById } from "../queries";
import { ProductWithRelations } from "../types";
import { formatCurrency } from "@/lib/utils";

interface ProductFormProps {
  initialData?: ProductWithRelations;
}

export function ProductForm({ initialData }: ProductFormProps = {}) {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id ? Number(params.id) : undefined;

  // Define whether we're in edit mode
  const isEditMode = !!productId;

  // States for image uploads
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch lookup data for dropdowns
  const { data: lookups, isLoading: isLoadingLookups } = useProductLookups();

  // Fetch product data if in edit mode
  const { data: productData, isLoading: isLoadingProduct } = useGetProductById(
    productId,
    { enabled: isEditMode }
  );

  // Mutations for creating and updating products
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const uploadImage = useUploadProductImage();

  // Initialize form with product schema validation
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      product_code: "",
      short_description: "",
      long_description: "",
      brand_id: null,
      gender_id: null,
      perfume_type_id: null,
      concentration_id: null,
      origin_country: "",
      release_year: null,
      style: "",
      sillage: "",
      longevity: "",
      categories: [],
      labels: [],
      variants: [
        {
          volume_ml: 0,
          price: 0,
          sale_price: null,
          sku: "",
          stock_quantity: 0,
        },
      ],
    },
  });

  // Setup field arrays for variants
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    name: "variants",
    control: form.control,
  });

  // Populate form when product data is loaded in edit mode
  useEffect(() => {
    if (isEditMode && productData) {
      form.reset({
        name: productData.name,
        product_code: productData.product_code,
        short_description: productData.short_description || "",
        long_description: productData.long_description || "",
        brand_id: productData.brand_id,
        gender_id: productData.gender_id,
        perfume_type_id: productData.perfume_type_id,
        concentration_id: productData.concentration_id,
        origin_country: productData.origin_country || "",
        release_year: productData.release_year,
        style: productData.style || "",
        sillage: productData.sillage || "",
        longevity: productData.longevity || "",
        categories: productData.categories?.map((cat) => cat.id) || [],
        labels:
          productData.labels?.map((label) => ({
            label_id: label.id,
            valid_until: label.product_label_assignments?.valid_until || null,
          })) || [],
        variants:
          productData.variants?.map((variant) => ({
            id: variant.id,
            volume_ml: variant.volume_ml,
            price: variant.price,
            sale_price: variant.sale_price,
            sku: variant.sku,
            stock_quantity: variant.stock_quantity,
          })) || [],
      });
    }
  }, [productData, isEditMode, form]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedImages((prev) => [...prev, ...newFiles]);

      // Generate preview URLs
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setUploadPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Remove image from upload list
  const removeImage = (index: number) => {
    setUploadedImages((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    setUploadPreviews((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index]); // Clean up the URL
      updated.splice(index, 1);
      return updated;
    });
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormData) => {
    try {
      let productId: number;

      if (isEditMode) {
        // Update existing product
        const updateResult = await updateProduct.mutateAsync({
          id: Number(params.id),
          data,
        });

        if (!updateResult.success) {
          toast.error("Cập nhật sản phẩm thất bại: " + updateResult.message);
          return;
        }

        productId = Number(params.id);
        toast.success("Đã cập nhật sản phẩm thành công");
      } else {
        // Create new product
        const createResult = await createProduct.mutateAsync(data);

        if (!createResult.success || !createResult.productId) {
          toast.error("Tạo sản phẩm thất bại: " + createResult.message);
          return;
        }

        productId = createResult.productId;
        toast.success("Đã tạo sản phẩm mới thành công");
      }

      // Upload images if any
      if (uploadedImages.length > 0) {
        setIsUploading(true);

        try {
          for (let i = 0; i < uploadedImages.length; i++) {
            const formData = new FormData();
            formData.append("file", uploadedImages[i]);
            formData.append("productId", productId.toString());
            formData.append("altText", uploadedImages[i].name);

            // Set as main image if it's the first image and there are no existing images
            if (
              i === 0 &&
              (!productData?.images || productData.images.length === 0)
            ) {
              formData.append("isMain", "true");
            }

            await uploadImage.mutateAsync(formData);
          }

          toast.success("Đã tải lên hình ảnh thành công");
        } catch (error) {
          console.error("Error uploading images:", error);
          toast.error("Lỗi khi tải lên hình ảnh");
        } finally {
          setIsUploading(false);
        }
      }

      // Navigate to product detail page
      router.push(`/admin/san-pham/${productId}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  // Loading state
  if ((isEditMode && isLoadingProduct) || isLoadingLookups) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="details">Thông tin chi tiết</TabsTrigger>
            <TabsTrigger value="variants">Biến thể & Giá</TabsTrigger>
            <TabsTrigger value="images">Hình ảnh</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên sản phẩm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã sản phẩm *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mã sản phẩm" {...field} />
                      </FormControl>
                      <FormDescription>
                        Mã sản phẩm dùng để phân biệt trong hệ thống
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả ngắn</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập mô tả ngắn gọn về sản phẩm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="long_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả chi tiết</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập mô tả chi tiết về sản phẩm"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thương hiệu</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) =>
                            field.onChange(value ? Number(value) : null)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn thương hiệu" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">
                              Không có thương hiệu
                            </SelectItem>
                            {lookups?.brands.map((brand) => (
                              <SelectItem
                                key={brand.id}
                                value={brand.id.toString()}
                              >
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giới tính</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) =>
                            field.onChange(value ? Number(value) : null)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Không xác định</SelectItem>
                            {lookups?.genders.map((gender) => (
                              <SelectItem
                                key={gender.id}
                                value={gender.id.toString()}
                              >
                                {gender.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="perfume_type_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại nước hoa</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) =>
                            field.onChange(value ? Number(value) : null)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại nước hoa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Không xác định</SelectItem>
                            {lookups?.perfumeTypes.map((type) => (
                              <SelectItem
                                key={type.id}
                                value={type.id.toString()}
                              >
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="concentration_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nồng độ</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) =>
                            field.onChange(value ? Number(value) : null)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn nồng độ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Không xác định</SelectItem>
                            {lookups?.concentrations.map((concentration) => (
                              <SelectItem
                                key={concentration.id}
                                value={concentration.id.toString()}
                              >
                                {concentration.name} (
                                {concentration.description})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danh mục</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {lookups?.categories.map((category) => (
                    <FormField
                      key={category.id}
                      control={form.control}
                      name="categories"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(category.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, category.id]);
                                } else {
                                  field.onChange(
                                    field.value?.filter(
                                      (id) => id !== category.id
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {category.name}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nhãn sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lookups?.productLabels.map((label) => {
                    const labelIndex = form
                      .watch("labels")
                      .findIndex((l) => l.label_id === label.id);
                    const isSelected = labelIndex !== -1;
                    const validUntil = isSelected
                      ? form.watch(`labels.${labelIndex}.valid_until`)
                      : null;

                    return (
                      <div key={label.id} className="border rounded-md p-4">
                        <FormField
                          control={form.control}
                          name="labels"
                          render={({ field }) => (
                            <FormItem className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      const currentLabels = [...field.value];
                                      if (checked) {
                                        currentLabels.push({
                                          label_id: label.id,
                                          valid_until: null,
                                        });
                                      } else {
                                        const index = currentLabels.findIndex(
                                          (l) => l.label_id === label.id
                                        );
                                        if (index !== -1) {
                                          currentLabels.splice(index, 1);
                                        }
                                      }
                                      field.onChange(currentLabels);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium cursor-pointer">
                                  {label.name}
                                </FormLabel>
                                <Badge
                                  style={{
                                    backgroundColor: label.color_code || "#888",
                                    color: "#fff",
                                  }}
                                >
                                  {label.name}
                                </Badge>
                              </div>

                              {isSelected && (
                                <div className="pl-6 mt-2">
                                  <FormLabel className="text-sm">
                                    Hiệu lực đến (tùy chọn)
                                  </FormLabel>
                                  <Controller
                                    control={form.control}
                                    name={`labels.${labelIndex}.valid_until`}
                                    render={({ field }) => (
                                      <DatePicker
                                        selected={
                                          field.value
                                            ? new Date(field.value)
                                            : null
                                        }
                                        onSelect={(date) =>
                                          field.onChange(
                                            date ? date.toISOString() : null
                                          )
                                        }
                                        disabled={(date) => date < new Date()}
                                        placeholder="Chọn ngày hết hạn nhãn"
                                      />
                                    )}
                                  />
                                </div>
                              )}
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Information Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="origin_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xuất xứ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập quốc gia xuất xứ"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="release_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Năm phát hành</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Năm phát hành"
                            value={field.value === null ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phong cách</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập phong cách nước hoa (vd: Hiện đại, Cổ điển...)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sillage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Độ tỏa hương (Sillage)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập độ tỏa hương (vd: Nhẹ, Vừa, Mạnh...)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longevity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Độ lưu hương (Longevity)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập độ lưu hương (vd: 2-4 giờ, 4-6 giờ...)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Biến thể sản phẩm</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendVariant({
                      volume_ml: 0,
                      price: 0,
                      sale_price: null,
                      sku: "",
                      stock_quantity: 0,
                    })
                  }
                  type="button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm biến thể
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {variantFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border rounded-md p-4 space-y-4 relative"
                    >
                      <div className="absolute top-2 right-2">
                        {variantFields.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(index)}
                            type="button"
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <span className="sr-only">Xóa biến thể</span>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.volume_ml`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dung tích (ml) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Nhập dung tích"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`variants.${index}.sku`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mã SKU *</FormLabel>
                              <FormControl>
                                <Input placeholder="Nhập mã SKU" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Giá (VND) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Nhập giá sản phẩm"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`variants.${index}.sale_price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Giá khuyến mãi (VND)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Nhập giá khuyến mãi (nếu có)"
                                  value={
                                    field.value === null ? "" : field.value
                                  }
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? Number(e.target.value)
                                        : null
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`variants.${index}.stock_quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số lượng tồn kho *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Nhập số lượng tồn kho"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hình ảnh sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditMode &&
                  productData?.images &&
                  productData.images.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium mb-2">
                        Hình ảnh hiện tại
                      </h3>
                      <div className="grid grid-cols-4 gap-4">
                        {productData.images.map((image) => (
                          <div
                            key={image.id}
                            className="relative border rounded-md p-1"
                          >
                            <img
                              src={image.image_url}
                              alt={image.alt_text || "Product image"}
                              className="w-full h-32 object-contain"
                            />
                            {image.is_main && (
                              <Badge className="absolute top-2 right-2">
                                Hình chính
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                    </div>
                  )}

                <div className="space-y-4">
                  <div>
                    <FormLabel>Tải lên hình ảnh mới</FormLabel>
                    <div className="mt-2">
                      <label
                        htmlFor="image-upload"
                        className="flex justify-center w-full h-32 px-4 transition border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary border-muted-foreground/25 focus:outline-none"
                      >
                        <span className="flex items-center space-x-2">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Kéo thả hình ảnh vào đây hoặc click để chọn
                          </span>
                        </span>
                        <input
                          id="image-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                        />
                      </label>
                    </div>
                  </div>

                  {uploadPreviews.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Hình ảnh sẽ được tải lên ({uploadPreviews.length})
                      </h3>
                      <div className="grid grid-cols-4 gap-4">
                        {uploadPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-contain border rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isUploading && (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Đang tải lên hình ảnh...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/san-pham")}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={
              createProduct.isPending || updateProduct.isPending || isUploading
            }
          >
            {createProduct.isPending || updateProduct.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : isEditMode ? (
              "Cập nhật sản phẩm"
            ) : (
              "Tạo sản phẩm"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
