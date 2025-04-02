"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRatingDisplay } from "@/components/admin/danh-gia/star-rating-display"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ReviewDetailProps {
  review: any // Trong thực tế, bạn sẽ có type cụ thể
}

export function ReviewDetail({ review }: ReviewDetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin đánh giá</CardTitle>
        <CardDescription>
          Đánh giá được tạo vào {format(new Date(review.created_at), "HH:mm 'ngày' dd/MM/yyyy", { locale: vi })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user.avatar} alt={review.user.name} />
              <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">
                <Link href={`/admin/nguoi-dung/${review.user.id}`} className="hover:underline">
                  {review.user.name}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">{review.user.email}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <StarRatingDisplay rating={review.rating} size="lg" />
            {review.purchase_verified && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="mt-1 bg-green-50 text-green-600 border-green-200">
                      Đã xác nhận mua hàng
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Khách hàng đã mua sản phẩm này qua đơn hàng #{review.order.id}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex items-center gap-3 sm:w-1/2">
            <div className="relative h-20 w-20 overflow-hidden rounded-md">
              <Image
                src={review.product.image || "/placeholder.svg"}
                alt={review.product.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium">
                <Link href={`/admin/san-pham/${review.product.id}`} className="hover:underline">
                  {review.product.name}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">Phiên bản: {review.product.variant}</p>
              <p className="text-sm text-muted-foreground">
                <Link href={`/admin/don-hang/${review.order.id}`} className="hover:underline">
                  Đơn hàng #{review.order.id}
                </Link>
              </p>
            </div>
          </div>
          <div className="sm:w-1/2">
            <h3 className="mb-2 font-medium">Nội dung đánh giá:</h3>
            <div className="max-h-40 overflow-y-auto rounded-md border p-3 text-sm text-muted-foreground">
              <ScrollArea className="h-full w-full">{review.comment}</ScrollArea>
            </div>
          </div>
        </div>

        {review.has_images && review.images && review.images.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="mb-2 font-medium">Hình ảnh đính kèm:</h3>
              <div className="flex flex-wrap gap-2">
                {review.images.map((image: string, index: number) => (
                  <div key={index} className="relative h-24 w-24 overflow-hidden rounded-md border">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Hình ảnh đánh giá ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

