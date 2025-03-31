import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { EnhancedProductReviewsSection } from "@/components/danh-gia/enhanced-product-reviews-section"

interface ProductReviewsPageProps {
  params: {
    slug: string
  }
}

export const metadata: Metadata = {
  title: "Đánh giá sản phẩm | MyBeauty",
  description: "Xem đánh giá của khách hàng về sản phẩm",
}

export default function ProductReviewsPage({ params }: ProductReviewsPageProps) {
  const { slug } = params

  // Dữ liệu mẫu cho sản phẩm
  const product = {
    id: 101,
    name: "Dior Sauvage Eau de Parfum",
    slug: "dior-sauvage-eau-de-parfum",
    brand: "Dior",
    price: 2850000,
    image: "/placeholder.svg?height=200&width=200",
    averageRating: 4.7,
    totalReviews: 124,
    ratingCounts: [
      { rating: 5, count: 89 },
      { rating: 4, count: 25 },
      { rating: 3, count: 7 },
      { rating: 2, count: 2 },
      { rating: 1, count: 1 },
    ],
  }

  // Kiểm tra xem sản phẩm có tồn tại không
  if (slug !== product.slug) {
    notFound()
  }

  // Dữ liệu mẫu cho đánh giá
  const reviews = [
    {
      id: 1,
      user: "Nguyễn Văn A",
      date: "2023-05-15T08:30:00Z",
      rating: 5,
      title: "Sản phẩm tuyệt vời",
      comment: "Mùi hương rất nam tính và lưu hương lâu. Tôi rất hài lòng với sản phẩm này.",
      verified: true,
      helpful: 12,
      avatar: "/placeholder.svg?height=40&width=40",
      recommend: true,
      images: ["/placeholder.svg?height=100&width=100"],
      replies: [
        {
          id: 101,
          staff_name: "MyBeauty Shop",
          reply_text:
            "Cảm ơn bạn đã đánh giá sản phẩm của chúng tôi. Chúng tôi rất vui khi sản phẩm đã đáp ứng được nhu cầu của bạn. Hẹn gặp lại bạn trong những đơn hàng tiếp theo!",
          created_at: "2023-05-16T10:30:00Z",
        },
      ],
    },
    {
      id: 2,
      user: "Trần Thị B",
      date: "2023-04-20T14:15:00Z",
      rating: 4,
      title: "Sản phẩm tốt",
      comment: "Mùi hương rất dễ chịu, nhưng độ lưu hương chưa được lâu như mong đợi.",
      verified: true,
      helpful: 8,
      avatar: "/placeholder.svg?height=40&width=40",
      recommend: true,
      images: [],
    },
    {
      id: 3,
      user: "Lê Văn C",
      date: "2023-03-10T10:45:00Z",
      rating: 5,
      title: "Rất đáng tiền",
      comment: "Đây là chai nước hoa thứ 3 tôi mua và vẫn rất hài lòng. Mùi hương nam tính, lịch lãm.",
      verified: true,
      helpful: 15,
      avatar: "/placeholder.svg?height=40&width=40",
      recommend: true,
      images: ["/placeholder.svg?height=100&width=100", "/placeholder.svg?height=100&width=100"],
    },
    {
      id: 4,
      user: "Phạm Thị D",
      date: "2023-02-28T16:20:00Z",
      rating: 3,
      title: "Bình thường",
      comment: "Sản phẩm ổn nhưng không đặc biệt. Mùi hương khá phổ biến.",
      verified: true,
      helpful: 3,
      avatar: "/placeholder.svg?height=40&width=40",
      recommend: false,
      images: [],
    },
    {
      id: 5,
      user: "Hoàng Văn E",
      date: "2023-01-15T09:10:00Z",
      rating: 5,
      title: "Tuyệt vời",
      comment: "Mùi hương rất nam tính và lưu hương cả ngày. Đáng đồng tiền bát gạo.",
      verified: true,
      helpful: 10,
      avatar: "/placeholder.svg?height=40&width=40",
      recommend: true,
      images: [],
    },
    {
      id: 6,
      user: "Vũ Thị F",
      date: "2022-12-10T11:25:00Z",
      rating: 4,
      title: "Hài lòng",
      comment: "Mùi hương nam tính, sang trọng. Độ lưu hương tốt.",
      verified: true,
      helpful: 7,
      avatar: "/placeholder.svg?height=40&width=40",
      recommend: true,
      images: [],
    },
    {
      id: 7,
      user: "Đặng Văn G",
      date: "2022-11-05T15:40:00Z",
      rating: 5,
      title: "Sản phẩm chất lượng",
      comment: "Mùi hương đúng như mô tả, rất nam tính và lịch lãm.",
      verified: true,
      helpful: 9,
      avatar: "/placeholder.svg?height=40&width=40",
      recommend: true,
      images: [],
    },
    {
      id: 8,
      user: "Ngô Thị H",
      date: "2022-10-20T09:15:00Z",
      rating: 2,
      title: "Không như mong đợi",
      comment: "Mùi hương không được như mong đợi, độ lưu hương kém.",
      verified: true,
      helpful: 4,
      avatar: "/placeholder.svg?height=40&width=40",
      recommend: false,
      images: [],
    },
  ]

  // Kiểm tra xem người dùng đã mua sản phẩm chưa (giả lập)
  const userHasPurchased = true

  return (
    <div className="container py-6 md:py-10">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Trang chủ</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/san-pham">Sản phẩm</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/san-pham/${slug}`}>{product.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>Đánh giá</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <EnhancedProductReviewsSection product={product} reviews={reviews} userHasPurchased={userHasPurchased} />

      <div className="mt-8 flex justify-center">
        <Button variant="outline" asChild>
          <Link href={`/san-pham/${slug}`}>Quay lại trang sản phẩm</Link>
        </Button>
      </div>
    </div>
  )
}

