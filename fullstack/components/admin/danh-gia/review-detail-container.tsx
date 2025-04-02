"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, MessageSquare, Check, X, AlertTriangle, MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewDetail } from "@/components/admin/danh-gia/review-detail"
import { ReviewReplies } from "@/components/admin/danh-gia/review-replies"
import { ReviewReplyForm } from "@/components/admin/danh-gia/review-reply-form"
import { ReviewApprovalDialog } from "@/components/admin/danh-gia/review-approval-dialog"
import { ReviewRejectionDialog } from "@/components/admin/danh-gia/review-rejection-dialog"
import { ReviewDeleteDialog } from "@/components/admin/danh-gia/review-delete-dialog"
import { ReviewHistory } from "@/components/admin/danh-gia/review-history"
import { ReviewCustomerInfo } from "@/components/admin/danh-gia/review-customer-info"
import { ReviewProductInfo } from "@/components/admin/danh-gia/review-product-info"
import { ReviewActionBar } from "@/components/admin/danh-gia/review-action-bar"
import { ReviewStatusBadge } from "@/components/admin/danh-gia/review-status-badge"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMediaQuery } from "@/hooks/use-media-query"

// Mẫu dữ liệu đánh giá chi tiết
const reviewDetailData = {
  id: "1",
  user: {
    id: "user1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    totalOrders: 5,
    totalSpent: 2500000,
    memberSince: "2023-01-15T00:00:00Z",
  },
  product: {
    id: "prod1",
    name: "Chanel Coco Mademoiselle EDP 100ml",
    image: "/placeholder.svg?height=100&width=100",
    variant: "100ml",
    price: 3200000,
    category: "Nước hoa nữ",
    brand: "Chanel",
  },
  rating: 4,
  comment:
    "Sản phẩm rất tuyệt vời, mùi hương thơm lâu và sang trọng. Tôi đã sử dụng nhiều loại nước hoa khác nhau nhưng đây là loại tôi yêu thích nhất. Đóng gói sản phẩm rất chắc chắn và đẹp mắt. Giao hàng nhanh chóng. Sẽ tiếp tục ủng hộ shop.",
  created_at: "2023-10-15T08:30:00Z",
  status: "pending",
  has_reply: true,
  has_images: true,
  images: ["/placeholder.svg?height=200&width=200", "/placeholder.svg?height=200&width=200"],
  order: {
    id: "order1",
    order_date: "2023-10-10T14:20:00Z",
    total: 3200000,
  },
  purchase_verified: true,
  history: [
    {
      action: "created",
      timestamp: "2023-10-15T08:30:00Z",
      user: "Nguyễn Văn A",
    },
    {
      action: "viewed",
      timestamp: "2023-10-16T10:15:00Z",
      user: "Admin",
    },
  ],
}

interface ReviewDetailContainerProps {
  reviewId: string
}

export function ReviewDetailContainer({ reviewId }: ReviewDetailContainerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [activeTab, setActiveTab] = useState("details")
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Giả lập lấy dữ liệu đánh giá
  const review = reviewDetailData

  const handleApprove = () => {
    setShowApprovalDialog(true)
  }

  const handleReject = () => {
    setShowRejectionDialog(true)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handleReply = () => {
    setShowReplyForm(true)
    setActiveTab("replies")
  }

  const handleCancelReply = () => {
    setShowReplyForm(false)
  }

  const handleSubmitReply = async (content: string) => {
    setIsProcessing(true)

    try {
      // Giả lập xử lý backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Phản hồi đã được gửi",
        description: "Phản hồi của bạn đã được gửi thành công.",
      })

      setShowReplyForm(false)
      // Trong thực tế, bạn sẽ cập nhật danh sách phản hồi
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link href="/admin/danh-gia">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Quay lại</span>
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold md:text-2xl">Chi tiết đánh giá #{reviewId}</h1>
              <ReviewStatusBadge status={review.status as "pending" | "approved" | "rejected"} />
            </div>
            <p className="text-sm text-muted-foreground">
              Đánh giá {review.rating} sao cho sản phẩm {review.product.name}
            </p>
          </div>
        </div>

        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Thao tác</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {review.status === "pending" && (
                <>
                  <DropdownMenuItem onClick={handleApprove} className="text-green-600">
                    <Check className="mr-2 h-4 w-4" />
                    Duyệt đánh giá
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReject} className="text-amber-600">
                    <X className="mr-2 h-4 w-4" />
                    Từ chối đánh giá
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleReply}>
                <MessageSquare className="mr-2 h-4 w-4" />
                {review.has_reply ? "Xem phản hồi" : "Phản hồi"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Xóa đánh giá
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <ReviewActionBar
            status={review.status as "pending" | "approved" | "rejected"}
            hasReply={review.has_reply}
            onApprove={handleApprove}
            onReject={handleReject}
            onReply={handleReply}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="details" className="flex-1 md:flex-none">
            Chi tiết
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex-1 md:flex-none">
            Khách hàng
          </TabsTrigger>
          <TabsTrigger value="product" className="flex-1 md:flex-none">
            Sản phẩm
          </TabsTrigger>
          <TabsTrigger value="replies" className="flex-1 md:flex-none">
            Phản hồi
            {review.has_reply && <span className="ml-1 text-xs">(1)</span>}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 md:flex-none">
            Lịch sử
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="details">
            <ReviewDetail review={review} />
          </TabsContent>

          <TabsContent value="customer">
            <ReviewCustomerInfo customer={review.user} />
          </TabsContent>

          <TabsContent value="product">
            <ReviewProductInfo product={review.product} />
          </TabsContent>

          <TabsContent value="replies">
            <div className="space-y-4">
              <ReviewReplies reviewId={reviewId} />
              {showReplyForm && (
                <ReviewReplyForm
                  reviewId={reviewId}
                  onCancel={handleCancelReply}
                  onSubmit={handleSubmitReply}
                  isSubmitting={isProcessing}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <ReviewHistory history={review.history} />
          </TabsContent>
        </div>
      </Tabs>

      <ReviewApprovalDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog} reviewId={reviewId} />

      <ReviewRejectionDialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog} reviewId={reviewId} />

      <ReviewDeleteDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} reviewId={reviewId} />
    </div>
  )
}

