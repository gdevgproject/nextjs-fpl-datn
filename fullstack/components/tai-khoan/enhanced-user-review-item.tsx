"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EnhancedStarRating } from "@/components/danh-gia/enhanced-star-rating"
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
import { Pencil, Trash2, MessageCircle, Loader2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"

interface EnhancedUserReviewItemProps {
  review: {
    id: number
    product_id: number
    product_name: string
    product_image: string
    rating: number
    title: string
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
  onDelete: (reviewId: number) => void
}

export function EnhancedUserReviewItem({ review, onDelete }: EnhancedUserReviewItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [showFullComment, setShowFullComment] = useState(false)

  const hasLongComment = review.comment.length > 200
  const displayComment = showFullComment ? review.comment : review.comment.slice(0, 200)

  const handleDelete = () => {
    setIsDeleting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Xóa đánh giá thành công",
        description: "Đánh giá của bạn đã được xóa",
      })
      setIsDeleting(false)
      onDelete(review.id)
    }, 1000)
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="h-16 w-16 relative rounded overflow-hidden flex-shrink-0">
            <Image
              src={review.product_image || "/placeholder.svg"}
              alt={review.product_name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <Link
                href={`/san-pham/${review.product_id}`}
                className="font-medium hover:underline inline-flex items-center"
              >
                {review.product_name}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
              <div className="flex items-center gap-2">
                <Badge variant={review.is_approved ? "default" : "secondary"}>
                  {review.is_approved ? "Đã duyệt" : "Chờ duyệt"}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <EnhancedStarRating rating={review.rating} onChange={() => {}} size="sm" readOnly />
              <h4 className="font-medium">{review.title}</h4>
              <p className="text-sm text-muted-foreground">
                {displayComment}
                {hasLongComment && !showFullComment && "..."}
              </p>

              {hasLongComment && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setShowFullComment(!showFullComment)}
                >
                  {showFullComment ? "Ẩn bớt" : "Xem thêm"}
                </Button>
              )}
            </div>

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
                  {showReplies ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                </Button>

                {showReplies && (
                  <div className="mt-2 pl-4 border-l-2 space-y-2">
                    {review.replies.map((reply) => (
                      <div key={reply.id} className="bg-muted/50 rounded-md p-3 text-sm">
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
      <CardFooter className="flex justify-end gap-2 p-4 pt-0 border-t mt-4">
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

