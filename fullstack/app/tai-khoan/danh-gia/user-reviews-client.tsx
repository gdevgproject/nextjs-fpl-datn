"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedUserReviewList } from "@/components/tai-khoan/enhanced-user-review-list"
import { UserReviewsEmpty } from "@/components/tai-khoan/user-reviews-empty"
import { UserReviewsFilter } from "@/components/tai-khoan/user-reviews-filter"

export function UserReviewsClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [filteredReviews, setFilteredReviews] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Simulate fetching reviews
    const fetchReviews = async () => {
      setIsLoading(true)

      // Simulate API call delay
      setTimeout(() => {
        // Mock data
        const mockReviews = [
          {
            id: 1,
            product_id: 101,
            product_name: "Dior Sauvage Eau de Parfum",
            product_image: "/placeholder.svg?height=100&width=100",
            rating: 5,
            title: "Sản phẩm tuyệt vời",
            comment: "Mùi hương rất nam tính và lưu hương lâu. Tôi rất hài lòng với sản phẩm này.",
            created_at: "2023-05-15T08:30:00Z",
            is_approved: true,
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
            product_id: 102,
            product_name: "Chanel Coco Mademoiselle",
            product_image: "/placeholder.svg?height=100&width=100",
            rating: 4,
            title: "Sản phẩm tốt",
            comment: "Mùi hương rất dễ chịu, nhưng độ lưu hương chưa được lâu như mong đợi.",
            created_at: "2023-04-20T14:15:00Z",
            is_approved: true,
            replies: [],
          },
          {
            id: 3,
            product_id: 103,
            product_name: "Tom Ford Tobacco Vanille",
            product_image: "/placeholder.svg?height=100&width=100",
            rating: 5,
            title: "Rất đáng tiền",
            comment: "Đây là chai nước hoa thứ 3 tôi mua và vẫn rất hài lòng. Mùi hương nam tính, lịch lãm.",
            created_at: "2023-03-10T10:45:00Z",
            is_approved: true,
            replies: [],
          },
          {
            id: 4,
            product_id: 104,
            product_name: "Versace Eros",
            product_image: "/placeholder.svg?height=100&width=100",
            rating: 3,
            title: "Bình thường",
            comment: "Sản phẩm ổn nhưng không đặc biệt. Mùi hương khá phổ biến.",
            created_at: "2023-02-28T16:20:00Z",
            is_approved: false,
            replies: [],
          },
        ]

        setReviews(mockReviews)
        setFilteredReviews(mockReviews)
        setIsLoading(false)
      }, 1000)
    }

    fetchReviews()
  }, [])

  // Filter and sort reviews
  useEffect(() => {
    let filtered = [...reviews]

    // Filter by tab
    if (activeTab === "approved") {
      filtered = filtered.filter((review) => review.is_approved)
    } else if (activeTab === "pending") {
      filtered = filtered.filter((review) => !review.is_approved)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (review) =>
          review.product_name.toLowerCase().includes(query) ||
          review.title.toLowerCase().includes(query) ||
          review.comment.toLowerCase().includes(query),
      )
    }

    // Sort reviews
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "highest":
          return b.rating - a.rating
        case "lowest":
          return a.rating - b.rating
        default:
          return 0
      }
    })

    setFilteredReviews(filtered)
  }, [reviews, activeTab, sortBy, searchQuery])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleDelete = (reviewId: number) => {
    // Simulate deleting a review
    setReviews(reviews.filter((review) => review.id !== reviewId))
  }

  if (isLoading) {
    return null // Handled by Suspense
  }

  if (reviews.length === 0) {
    return <UserReviewsEmpty />
  }

  return (
    <div className="space-y-6">
      <UserReviewsFilter
        onSearch={handleSearch}
        onSortChange={handleSortChange}
        sortBy={sortBy}
        searchQuery={searchQuery}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tất cả ({reviews.length})</TabsTrigger>
          <TabsTrigger value="approved">Đã duyệt ({reviews.filter((r) => r.is_approved).length})</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt ({reviews.filter((r) => !r.is_approved).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <EnhancedUserReviewList reviews={filteredReviews} onDelete={handleDelete} />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <EnhancedUserReviewList reviews={filteredReviews} onDelete={handleDelete} />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <EnhancedUserReviewList reviews={filteredReviews} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

