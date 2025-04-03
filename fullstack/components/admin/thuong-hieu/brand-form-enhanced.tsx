"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Save, Upload, X, ExternalLink, Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { BrandSlugPreview } from "@/components/admin/thuong-hieu/brand-slug-preview"
import { BrandPreview } from "@/components/admin/thuong-hieu/brand-preview"
import { BrandProductsTable } from "@/components/admin/thuong-hieu/brand-products-table"
import type { Brand } from "@/types/san-pham"

interface BrandFormEnhancedProps {
  brandId?: string
}

const brandFormSchema = z.object({
  name: z.string().min(2, {
    message: "Tên thương hiệu phải có ít nhất 2 ký tự",
  }),
  slug: z
    .string()
    .min(2, {
      message: "Slug phải có ít nhất 2 ký tự",
    })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
    }),
  description: z.string().optional(),
  origin: z.string().optional(),
  foundedYear: z.string().optional(),
  website: z
    .string()
    .url({
      message: "Website phải là một URL hợp lệ",
    })
    .optional()
    .or(z.literal("")),
  isFeatured: z.boolean().default(false),
})

type BrandFormValues = z.infer<typeof brandFormSchema>

export function BrandFormEnhanced({ brandId }: BrandFormEnhancedProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")

  // Dữ liệu mẫu cho thương hiệu
  const sampleBrands: (Brand & {
    isFeatured: boolean
    origin: string
    foundedYear: string
    website: string
    productCount: number
  })[] = [
    {
      id: "1",
      name: "Chanel",
      slug: "chanel",
      description:
        "Thương hiệu nước hoa cao cấp từ Pháp, được thành lập bởi Coco Chanel. Chanel No. 5 là một trong những nước hoa nổi tiếng nhất thế giới, ra mắt vào năm 1921.",
      logo_url: "/placeholder.svg?height=200&width=200",
      created_at: "2023-01-01T00:00:00Z",
      isFeatured: true,
      origin: "Pháp",
      foundedYear: "1909",
      website: "https://www.chanel.com",
      productCount: 24,
    },
    {
      id: "2",
      name: "Dior",
      slug: "dior",
      description:
        "Thương hiệu nước hoa cao cấp từ Pháp, được thành lập bởi Christian Dior. Dior J'adore là một trong những nước hoa nổi tiếng nhất của hãng.",
      logo_url: "/placeholder.svg?height=200&width=200",
      created_at: "2023-01-01T00:00:00Z",
      isFeatured: true,
      origin: "Pháp",
      foundedYear: "1946",
      website: "https://www.dior.com",
      productCount: 18,
    },
  ]

  // Khởi tạo form với giá trị mặc định
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      origin: "",
      foundedYear: "",
      website: "",
      isFeatured: false,
    },
  })

  // Tự động tạo slug từ tên
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
  }

  // Theo dõi thay đổi tên để tạo slug
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" && value.name) {
        const newSlug = generateSlug(value.name)
        form.setValue("slug", newSlug, { shouldValidate: true })
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Nếu có brandId, lấy dữ liệu thương hiệu
  useEffect(() => {
    if (brandId) {
      // Giả lập việc lấy dữ liệu từ API
      const brand = sampleBrands.find((b) => b.id === brandId)
      if (brand) {
        form.reset({
          name: brand.name,
          slug: brand.slug,
          description: brand.description || "",
          origin: brand.origin || "",
          foundedYear: brand.foundedYear || "",
          website: brand.website || "",
          isFeatured: brand.isFeatured,
        })
        setLogoPreview(brand.logo_url || null)
      }
    }
  }, [brandId, form])

  const onSubmit = async (data: BrandFormValues) => {
    setIsLoading(true)

    try {
      // Giả lập việc gửi dữ liệu lên API
      console.log("Dữ liệu gửi đi:", { ...data, logo_url: logoPreview })

      // Hiển thị thông báo thành công
      toast({
        title: brandId ? "Đã cập nhật thương hiệu" : "Đã tạo thương hiệu",
        description: brandId
          ? `Thương hiệu "${data.name}" đã được cập nhật thành công.`
          : `Thương hiệu "${data.name}" đã được tạo thành công.`,
      })

      // Chuyển hướng về trang danh sách thương hiệu
      setTimeout(() => {
        router.push("/admin/thuong-hieu")
      }, 1000)
    } catch (error) {
      console.error("Lỗi khi lưu thương hiệu:", error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi lưu thương hiệu. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setLogoPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-6">
          <div className="md:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin thương hiệu</CardTitle>
                <CardDescription>Nhập thông tin chi tiết cho thương hiệu sản phẩm</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                    <TabsTrigger value="seo">SEO & URL</TabsTrigger>
                    <TabsTrigger value="products" disabled={!brandId}>
                      Sản phẩm{" "}
                      {brandId && (
                        <span className="ml-1 text-xs">
                          ({sampleBrands.find((b) => b.id === brandId)?.productCount || 0})
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên thương hiệu</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập tên thương hiệu" {...field} />
                            </FormControl>
                            <FormDescription>Tên hiển thị của thương hiệu trên website</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Xuất xứ</FormLabel>
                            <FormControl>
                              <Input placeholder="Ví dụ: Pháp, Ý, Mỹ..." {...field} />
                            </FormControl>
                            <FormDescription>Quốc gia xuất xứ của thương hiệu</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="foundedYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Năm thành lập</FormLabel>
                            <FormControl>
                              <Input placeholder="Ví dụ: 1909" {...field} />
                            </FormControl>
                            <FormDescription>Năm thành lập thương hiệu</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Input placeholder="https://www.example.com" {...field} />
                                {field.value && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="ml-2"
                                    onClick={() => window.open(field.value, "_blank")}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription>Website chính thức của thương hiệu</FormDescription>
                            <FormMessage />
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
                            <Textarea placeholder="Nhập mô tả cho thương hiệu" className="min-h-[120px]" {...field} />
                          </FormControl>
                          <FormDescription>Mô tả ngắn gọn về thương hiệu này</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel>Logo thương hiệu</FormLabel>
                      <div className="flex items-center gap-4">
                        {logoPreview ? (
                          <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                            <Image
                              src={logoPreview || "/placeholder.svg"}
                              alt="Logo preview"
                              fill
                              className="object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute right-1 top-1 h-6 w-6"
                              onClick={handleRemoveLogo}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed">
                            <span className="text-sm text-muted-foreground">Chưa có logo</span>
                          </div>
                        )}

                        <div>
                          <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("logo")?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {logoPreview ? "Thay đổi logo" : "Tải lên logo"}
                          </Button>
                        </div>
                      </div>
                      <FormDescription>Logo thương hiệu nên có kích thước vuông và nền trong suốt</FormDescription>
                    </div>

                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Thương hiệu nổi bật</FormLabel>
                            <FormDescription>Thương hiệu nổi bật sẽ được hiển thị trên trang chủ</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug URL</FormLabel>
                          <FormControl>
                            <Input placeholder="slug-thuong-hieu" {...field} />
                          </FormControl>
                          <FormDescription>Đường dẫn URL của thương hiệu trên website</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <BrandSlugPreview slug={form.watch("slug")} />

                    <div className="rounded-lg border p-4">
                      <h3 className="mb-2 font-medium">Xem trước kết quả tìm kiếm Google</h3>
                      <div className="space-y-1 rounded-lg border p-3">
                        <div className="text-base text-blue-600 hover:underline">{form.watch("name")} - MyBeauty</div>
                        <div className="text-sm text-green-700">
                          https://mybeauty.com/thuong-hieu/{form.watch("slug")}
                        </div>
                        <div className="text-sm text-gray-600">
                          {form.watch("description")?.substring(0, 160) || "Mô tả thương hiệu sẽ hiển thị ở đây..."}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="products" className="pt-4">
                    {brandId ? (
                      <BrandProductsTable brandId={brandId} />
                    ) : (
                      <div className="flex h-[200px] items-center justify-center rounded-lg border">
                        <p className="text-muted-foreground">Vui lòng lưu thương hiệu trước khi quản lý sản phẩm</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.push("/admin/thuong-hieu")}>
                  Hủy
                </Button>
                <div className="flex gap-2">
                  {brandId && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        // Hiển thị dialog xác nhận xóa
                        toast({
                          title: "Chức năng này chưa được triển khai",
                          description: "Chức năng xóa thương hiệu sẽ được triển khai sau.",
                        })
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </Button>
                  )}
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      "Đang lưu..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {brandId ? "Cập nhật" : "Lưu thương hiệu"}
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-2">
            <BrandPreview
              name={form.watch("name")}
              description={form.watch("description")}
              logo={logoPreview}
              isFeatured={form.watch("isFeatured")}
              origin={form.watch("origin")}
              foundedYear={form.watch("foundedYear")}
              productCount={brandId ? sampleBrands.find((b) => b.id === brandId)?.productCount || 0 : 0}
            />
          </div>
        </div>
      </form>
    </Form>
  )
}

