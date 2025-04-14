"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { submitProductReview } from "../actions"

const reviewSchema = z.object({
  rating: z.number().min(1, "Vui lòng chọn số sao").max(5),
  comment: z.string().min(10, "Đánh giá phải có ít nhất 10 ký tự").max(1000, "Đánh giá không được quá 1000 ký tự"),
})

interface ProductReviewFormProps {
  productId: number
  onCancel: () => void
  onSuccess: () => void
}

export function ProductReviewForm({ productId, onCancel, onSuccess }: ProductReviewFormProps) {
  const { toast } = useToast()
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  })

  const rating = form.watch("rating")

  const handleStarClick = (value: number) => {
    form.setValue("rating", value)
  }

  const handleStarHover = (value: number) => {
    setHoveredStar(value)
  }

  const handleStarLeave = () => {
    setHoveredStar(0)
  }

  const onSubmit = async (data: z.infer<typeof reviewSchema>) => {
    try {
      setIsSubmitting(true)
      const result = await submitProductReview({
        productId,
        rating: data.rating,
        comment: data.comment,
      })

      if (result.error) {
        toast({
          title: "Đánh giá thất bại",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Đánh giá thành công",
        description: "Cảm ơn bạn đã đánh giá sản phẩm. Đánh giá của bạn đang chờ duyệt.",
      })

      onSuccess()
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Đánh giá thất bại",
        description: "Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-medium">Viết đánh giá của bạn</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đánh giá</FormLabel>
                <FormControl>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`h-8 w-8 cursor-pointer ${
                          (hoveredStar || field.value) >= value
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => handleStarClick(value)}
                        onMouseEnter={() => handleStarHover(value)}
                        onMouseLeave={handleStarLeave}
                      />
                    ))}
                    <input
                      type="hidden"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
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
                <FormLabel>Nhận xét</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                    className="min-h-32 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

