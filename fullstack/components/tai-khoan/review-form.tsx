"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { StarRatingInput } from "@/components/tai-khoan/star-rating-input"

const reviewFormSchema = z.object({
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
    .max(500, {
      message: "Nội dung đánh giá không được vượt quá 500 ký tự",
    }),
})

type ReviewFormValues = z.infer<typeof reviewFormSchema>

interface ReviewFormProps {
  initialData: {
    id: number
    product_id: number
    product_name: string
    product_image: string
    rating: number
    comment: string
    is_approved: boolean
  }
}

export function ReviewForm({ initialData }: ReviewFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: initialData.rating,
      comment: initialData.comment,
    },
  })

  function onSubmit(data: ReviewFormValues) {
    setIsSubmitting(true)

    // Giả lập API call
    setTimeout(() => {
      console.log(data)
      toast({
        title: "Cập nhật đánh giá thành công",
        description: "Đánh giá của bạn đã được cập nhật và đang chờ duyệt",
      })
      setIsSubmitting(false)
      router.push("/tai-khoan/danh-gia")
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="h-20 w-20 relative rounded overflow-hidden">
          <Image
            src={initialData.product_image || "/placeholder.svg"}
            alt={initialData.product_name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-medium">{initialData.product_name}</h3>
          <p className="text-sm text-muted-foreground">Cập nhật đánh giá của bạn về sản phẩm này</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đánh giá</FormLabel>
                <FormControl>
                  <StarRatingInput value={field.value} onChange={field.onChange} />
                </FormControl>
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
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Tối đa 500 ký tự. Còn lại: {500 - field.value.length} ký tự</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex space-x-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý
                </>
              ) : (
                "Cập nhật đánh giá"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/tai-khoan/danh-gia")}>
              Hủy
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

