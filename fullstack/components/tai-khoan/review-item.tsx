"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/tai-khoan/star-rating"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Pencil, Trash2, MessageCircle, Loader2 } from "lucide-react"

interface ReviewItemProps {
  review: {
    id: number
    product_id: number
    product_name: string
    product_image: string
    rating: number
    comment: string
    created_at: string
    is_approved: boolean
    replies?: {
      id: number
      staff_name: string
      reply_text: string
      created_at: string
    }[]
  }
}

export function ReviewItem({ review }: ReviewItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  const handleDelete = () => {
    setIsDeleting(true)

    // Giả lập API call
    setTimeout(() => {
      toast({
        title: "Xóa đánh giá thành công",
        description: "Đánh giá của bạn đã được xóa",
      })
      setIsDeleting(false)
    }, 1000)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 relative rounded overflow-hidden flex-shrink-0">
            <Image
              src={review.product_image || "/placeholder.svg"}
              alt={review.product_name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <Link href={`/san-pham/${review.product_id}`} className="font-medium hover:underline">
                {review.product_name}
              </Link>
              <div className="flex items-center gap-2">
                <Badge variant={review.is_approved ? "default" : "secondary"}>
                  {review.is_approved ? "Đã duyệt" : "Chờ duyệt"}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
              </div>
            </div>
            <StarRating rating={review.rating} />
            <p className="text-sm">{review.comment}</p>

            {review.replies && review.replies.length > 0 && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center text-xs h-7 px-2"
                >
                  <MessageCircle className="mr-1 h-3.5 w-3.5" />
                  {showReplies ? "Ẩn phản hồi" : `Xem phản hồi (${review.replies.length})`}
                </Button>

                {showReplies && (
                  <div className="mt-2 pl-4 border-l-2 space-y-2">
                    {review.replies.map((reply) => (
                      <div key={reply.id} className="bg-muted/50 rounded-md p-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{reply.staff_name}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</span>
                        </div>
                        <p className="mt-1 text-sm">{reply.reply_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 p-4 pt-0">
        {!review.is_approved && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/tai-khoan/danh-gia/${review.id}/chinh-sua`}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Link>
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa đánh giá</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý
                  </>
                ) : (
                  "Xác nhận"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}

