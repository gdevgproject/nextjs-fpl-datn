"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Loader2, Camera, X, AlertCircle } from "lucide-react"
import { EnhancedStarRating } from "@/components/danh-gia/enhanced-star-rating"
import { ReviewPreview } from "@/components/danh-gia/review-preview"
import { ReviewGuidelines } from "@/components/danh-gia/review-guidelines"
import { useMediaQuery } from "@/hooks/use-media-query"

const MAX_IMAGES = 3
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

const reviewFormSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "Tiêu đề đánh giá phải có ít nhất 5 ký tự",
    })
    .max(100, {
      message: "Tiêu đề đánh giá không được vượt quá 100 ký tự",
    }),
  rating: z
    .number()
    .min(1, {
      message: "Vui lòng chọn số sao",
    })
    .max(5),
  comment: z
    .string()
    .min(10, {
      message: "Nội dung đánh giá phải có ít nhất 10 ký tự",
    })
    .max(1000, {
      message: "Nội dung đánh giá không được vượt quá 1000 ký tự",
    }),
  recommend: z.boolean().optional(),
  images: z.array(z.string()).optional(),
})

type ReviewFormValues = z.infer<typeof reviewFormSchema>

interface EnhancedReviewFormProps {
  product: {
    id: number
    name: string
    image: string
    brand: string
    price: number
    variant: string
  }
  onSubmitSuccess: () => void
}

export function EnhancedReviewForm({ product, onSubmitSuccess }: EnhancedReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("write")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageError, setImageError] = useState<string | null>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: "",
      rating: 0,
      comment: "",
      recommend: true,
      images: [],
    },
  })

  const watchedValues = form.watch()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setImageError(null)

    // Check if adding new files would exceed the limit
    if (imageFiles.length + files.length > MAX_IMAGES) {
      setImageError(`Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES} hình ảnh`)
      return
    }

    const newFiles: File[] = []
    const newUrls: string[] = []

    Array.from(files).forEach((file) => {
      // Check file size
      if (file.size > MAX_IMAGE_SIZE) {
        setImageError("Kích thước file không được vượt quá 5MB")
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setImageError("Chỉ chấp nhận file hình ảnh")
        return
      }

      newFiles.push(file)
      newUrls.push(URL.createObjectURL(file))
    })

    setImageFiles([...imageFiles, ...newFiles])
    setImageUrls([...imageUrls, ...newUrls])
    form.setValue("images", [...imageUrls, ...newUrls])
  }

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles]
    const newUrls = [...imageUrls]

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newUrls[index])

    newFiles.splice(index, 1)
    newUrls.splice(index, 1)

    setImageFiles(newFiles)
    setImageUrls(newUrls)
    form.setValue("images", newUrls)
    setImageError(null)
  }

  function onSubmit(data: ReviewFormValues) {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log(data)
      toast({
        title: "Đánh giá đã được gửi",
        description: "Cảm ơn bạn đã đánh giá sản phẩm. Đánh giá của bạn đang chờ duyệt.",
      })
      setIsSubmitting(false)
      onSubmitSuccess()
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{product.brand}</p>
              <h3 className="font-medium">{product.name}</h3>
              <p className="mt-1 text-sm">Phân loại: {product.variant}</p>
              <p className="mt-1 font-medium">{formatCurrency(product.price)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="write">Viết đánh giá</TabsTrigger>
          <TabsTrigger value="preview">Xem trước</TabsTrigger>
          <TabsTrigger value="guidelines">Hướng dẫn</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đánh giá của bạn</FormLabel>
                    <FormControl>
                      <EnhancedStarRating value={field.value} onChange={field.onChange} size={isMobile ? "md" : "lg"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recommend"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Bạn có muốn giới thiệu sản phẩm này cho người khác?</FormLabel>
                      <FormDescription>Đánh dấu nếu bạn hài lòng và muốn giới thiệu sản phẩm này</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề đánh giá</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tiêu đề đánh giá" {...field} />
                    </FormControl>
                    <FormDescription>Tóm tắt ngắn gọn trải nghiệm của bạn</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung đánh giá</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Chia sẻ chi tiết trải nghiệm của bạn về sản phẩm này..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Tối đa 1000 ký tự. Còn lại: {1000 - field.value.length} ký tự</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Hình ảnh (tùy chọn)</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative h-20 w-20 overflow-hidden rounded-md">
                      <Image
                        src={url || "/placeholder.svg"}
                        alt={`Uploaded image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {imageUrls.length < MAX_IMAGES && (
                    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 hover:border-gray-400">
                      <Camera className="h-6 w-6 text-gray-400" />
                      <span className="mt-1 text-xs text-gray-500">Thêm ảnh</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>

                {imageError && (
                  <div className="flex items-center text-sm text-destructive">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {imageError}
                  </div>
                )}

                <FormDescription>Tải lên tối đa {MAX_IMAGES} hình ảnh (mỗi ảnh tối đa 5MB)</FormDescription>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi
                    </>
                  ) : (
                    "Gửi đánh giá"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/san-pham/${product.id}`}>Hủy</Link>
                </Button>
                <Button type="button" variant="outline" onClick={() => setActiveTab("preview")} className="ml-auto">
                  Xem trước
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <ReviewPreview
            review={{
              title: watchedValues.title || "(Chưa có tiêu đề)",
              rating: watchedValues.rating,
              comment: watchedValues.comment || "(Chưa có nội dung)",
              recommend: watchedValues.recommend || false,
              images: imageUrls,
            }}
            product={product}
          />
          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("write")}>
              Quay lại chỉnh sửa
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi
                </>
              ) : (
                "Gửi đánh giá"
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="guidelines" className="mt-6">
          <ReviewGuidelines />
          <div className="mt-4">
            <Button variant="outline" onClick={() => setActiveTab("write")}>
              Quay lại viết đánh giá
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

