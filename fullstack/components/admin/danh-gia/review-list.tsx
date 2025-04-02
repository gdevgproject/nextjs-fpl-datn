import { Star, Check, X, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface ReviewListProps {
  status: "all" | "pending" | "approved" | "rejected"
}

export function ReviewList({ status }: ReviewListProps) {
  // Giả lập dữ liệu đánh giá
  const reviews = [
    {
      id: "1",
      user: {
        name: "Nguyễn Văn A",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      product: {
        name: "Chanel No.5 Eau de Parfum",
        image: "/placeholder.svg?height=40&width=40",
      },
      rating: 5,
      comment: "Mùi hương rất quyến rũ và lưu hương lâu. Tôi rất hài lòng với sản phẩm này.",
      date: "2023-10-15",
      status: "approved",
      hasReply: true,
    },
    {
      id: "2",
      user: {
        name: "Trần Thị B",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      product: {
        name: "Dior Sauvage Eau de Toilette",
        image: "/placeholder.svg?height=40&width=40",
      },
      rating: 4,
      comment: "Mùi hương nam tính, mạnh mẽ. Tuy nhiên độ lưu hương chưa được lâu như mong đợi.",
      date: "2023-10-12",
      status: "pending",
      hasReply: false,
    },
    {
      id: "3",
      user: {
        name: "Lê Văn C",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      product: {
        name: "Gucci Bloom Eau de Parfum",
        image: "/placeholder.svg?height=40&width=40",
      },
      rating: 2,
      comment: "Mùi hương không như mô tả, hơi nồng và gây khó chịu.",
      date: "2023-10-10",
      status: "rejected",
      hasReply: false,
    },
    {
      id: "4",
      user: {
        name: "Phạm Thị D",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      product: {
        name: "Versace Eros Eau de Toilette",
        image: "/placeholder.svg?height=40&width=40",
      },
      rating: 5,
      comment: "Mùi hương tuyệt vời, rất phù hợp cho các buổi tiệc. Sẽ mua lại.",
      date: "2023-10-08",
      status: "approved",
      hasReply: true,
    },
    {
      id: "5",
      user: {
        name: "Hoàng Văn E",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      product: {
        name: "Tom Ford Tobacco Vanille",
        image: "/placeholder.svg?height=40&width=40",
      },
      rating: 3,
      comment: "Mùi hương khá ổn nhưng giá hơi cao so với chất lượng.",
      date: "2023-10-05",
      status: "pending",
      hasReply: false,
    },
  ].filter((review) => status === "all" || review.status === status)

  return (
    <div>
      {reviews.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Không có đánh giá nào</p>
        </div>
      ) : (
        <div className="divide-y">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 hover:bg-muted/50">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.user.avatar} alt={review.user.name} />
                  <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{review.user.name}</div>
                    <div className="flex items-center gap-2">
                      {review.status === "pending" && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500">
                          Chờ duyệt
                        </Badge>
                      )}
                      {review.status === "approved" && (
                        <Badge variant="outline" className="text-green-500 border-green-500">
                          Đã duyệt
                        </Badge>
                      )}
                      {review.status === "rejected" && (
                        <Badge variant="outline" className="text-red-500 border-red-500">
                          Từ chối
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <img
                      src={review.product.image || "/placeholder.svg"}
                      alt={review.product.name}
                      className="h-6 w-6 rounded object-cover"
                    />
                    <span className="text-muted-foreground">{review.product.name}</span>
                  </div>
                  <p className="text-sm">{review.comment}</p>
                  {review.hasReply && (
                    <div className="mt-2 rounded-md bg-muted p-2 text-sm">
                      <div className="flex items-center gap-1 font-medium">
                        <MessageSquare className="h-3 w-3" /> Phản hồi từ shop:
                      </div>
                      <p className="mt-1 text-xs">
                        Cảm ơn bạn đã đánh giá sản phẩm. Chúng tôi rất vui khi bạn hài lòng với sản phẩm của chúng tôi.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {review.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-500">
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Duyệt</span>
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Từ chối</span>
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                    <MessageSquare className="h-4 w-4" />
                    <span className="sr-only">Phản hồi</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="p-4 border-t">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

