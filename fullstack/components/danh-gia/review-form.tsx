"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { StarRatingInput } from "@/components/danh-gia/star-rating-input"

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
})

type ReviewFormValues = z.infer<typeof reviewFormSchema>

interface ReviewFormProps {
  product: {
    id: number
    name: string
    image: string
    brand: string
    price: number
    rating: number
    reviewCount: number
  }
}

export function ReviewForm({ product }: ReviewFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: "",
      rating: 0,
      comment: "",
    },
  })

  function onSubmit(data: ReviewFormValues) {
    setIsSubmitting(true)

    // Giả lập API call
    setTimeout(() => {
      console.log(data)
      toast({
        title: "Đánh giá đã được gửi",
        description: "Cảm ơn bạn đã đánh giá sản phẩm. Đánh giá của bạn đang chờ duyệt.",
      })
      setIsSubmitting(false)
      router.push(`/san-pham/${product.id}`)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="relative h-24 w-24 overflow-hidden rounded">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{product.brand}</p>
              <h3 className="font-medium">{product.name}</h3>
              <p className="mt-1 font-medium">{formatCurrency(product.price)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đánh giá của bạn</FormLabel>
                <FormControl>
                  <StarRatingInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
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
          </div>
        </form>
      </Form>
    </div>
  )
}

