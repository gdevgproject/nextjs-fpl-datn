"use client"

import { useState } from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle2 } from "lucide-react"
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

interface ProductReviewFormProps {
  product: {
    id: number
    name: string
    variant: string
    image: string
  }
  isReviewed?: boolean
}

export function ProductReviewForm({ product, isReviewed = false }: ProductReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(isReviewed)

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
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
        title: "Gửi đánh giá thành công",
        description: "Cảm ơn bạn đã đánh giá sản phẩm",
      })
      setIsSubmitting(false)
      setHasSubmitted(true)
    }, 1500)
  }

  if (hasSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Đánh giá sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground">Phân loại: {product.variant}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center rounded-md bg-muted p-6">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="mb-2 h-10 w-10 text-green-500" />
              <h3 className="text-lg font-medium">Đã đánh giá</h3>
              <p className="text-sm text-muted-foreground">Cảm ơn bạn đã đánh giá sản phẩm này</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Đánh giá sản phẩm</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-md">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-muted-foreground">Phân loại: {product.variant}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đánh giá của bạn</FormLabel>
                  <FormControl>
                    <StarRatingInput value={field.value} onChange={field.onChange} size="lg" />
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
                  <FormLabel>Nhận xét của bạn</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Tối đa 500 ký tự. Còn lại: {500 - field.value.length} ký tự</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 border-t px-6 py-4">
        <Button variant="outline">Bỏ qua</Button>
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
      </CardFooter>
    </Card>
  )
}

