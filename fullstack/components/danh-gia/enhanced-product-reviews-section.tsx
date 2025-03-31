"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedReviewSummary } from "@/components/danh-gia/enhanced-review-summary"
import { EnhancedReviewList } from "@/components/danh-gia/enhanced-review-list"
import { EnhancedReviewFilter } from "@/components/danh-gia/enhanced-review-filter"
import { EnhancedReviewSearch } from "@/components/danh-gia/enhanced-review-search"
import { EnhancedReviewImageGallery } from "@/components/danh-gia/enhanced-review-image-gallery"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ProductReview {
  id: number
  user: string
  date: string
  rating: number
  title: string
  comment: string
  verified: boolean
  helpful: number
  avatar: string
  recommend?: boolean
  images?: string[]
  replies?: {
    id: number
    staff_name: string
    reply_text: string
    created_at: string
  }[]
}

interface Product {
  id: number
  name: string
  slug: string
  brand: string
  price: number
  image: string
  averageRating: number
  totalReviews: number
  ratingCounts: {
    rating: number
    count: number
  }[]
}

interface EnhancedProductReviewsSectionProps {
  product: Product
  reviews: ProductReview[]
  userHasPurchased: boolean
}

export function EnhancedProductReviewsSection({
  product,
  reviews: initialReviews,
  userHasPurchased,
}: EnhancedProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews)
  const [filteredReviews, setFilteredReviews] = useState<ProductReview[]>(initialReviews)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [activeTab, setActiveTab] = useState("all")

  const isMobile = useMediaQuery("(max-width: 768px)")

  // Get all review images
  const allReviewImages = reviews
    .filter((review) => review.images && review.images.length > 0)
    .flatMap((review) => review.images || [])
    .map((image, index) => ({
      src: image,
      alt: `Review image ${index + 1}`,
      reviewId: reviews.find((r) => r.images?.includes(image))?.id,
    }))

  // Filter reviews based on selected rating and search query
  const filterReviews = () => {
    let filtered = [...reviews]

    // Filter by rating
    if (selectedRating !== null) {
      filtered = filtered.filter((review) => review.rating === selectedRating)
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (review) =>
          review.title.toLowerCase().includes(query) ||
          review.comment.toLowerCase().includes(query) ||
          review.user.toLowerCase().includes(query),
      )
    }

    // Filter by tab
    if (activeTab === "with_images") {
      filtered = filtered.filter((review) => review.images && review.images.length > 0)
    } else if (activeTab === "recommended") {
      filtered = filtered.filter((review) => review.recommend === true)
    } else if (activeTab === "not_recommended") {
      filtered = filtered.filter((review) => review.recommend === false)
    }

    // Sort reviews
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "highest":
          return b.rating - a.rating
        case "lowest":
          return a.rating - b.rating
        case "most_helpful":
          return b.helpful - a.helpful
        default:
          return 0
      }
    })

    setFilteredReviews(filtered)
  }

  // Update filters when any filter changes
  const handleRatingChange = (rating: number | null) => {
    setSelectedRating(rating)
    setActiveTab("all")
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value !== "all") {
      setSelectedRating(null)
    }
  }

  // Apply filters when any filter changes
  useState(() => {
    filterReviews()
  })

  // Handle helpful vote
  const handleHelpfulVote = (reviewId: number) => {
    setReviews(reviews.map((review) => (review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review)))
    filterReviews()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Product info card */}
        <Card className="md:w-1/3">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{product.brand}</p>
                <h3 className="font-medium">{product.name}</h3>
                <div className="mt-2">
                  {userHasPurchased ? (
                    <Button size="sm" asChild>
                      <Link href={`/san-pham/danh-gia?product_id=${product.id}`}>Viết đánh giá</Link>
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">Bạn cần mua sản phẩm để đánh giá</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review summary */}
        <Card className="md:w-2/3">
          <CardContent className="p-6">
            <EnhancedReviewSummary
              averageRating={product.averageRating}
              totalReviews={product.totalReviews}
              ratingCounts={product.ratingCounts}
              recommendPercentage={Math.round(
                (reviews.filter((review) => review.recommend).length / reviews.length) * 100,
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* Review filters and tabs */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters (desktop) */}
        {!isMobile && (
          <div className="lg:w-1/4 space-y-6">
            <EnhancedReviewFilter
              totalReviews={product.totalReviews}
              ratingCounts={product.ratingCounts}
              onFilterChange={handleRatingChange}
              selectedRating={selectedRating}
            />

            <EnhancedReviewSearch onSearch={handleSearchChange} searchQuery={searchQuery} />
          </div>
        )}

        {/* Reviews content */}
        <div className="lg:w-3/4">
          {/* Mobile filters */}
          {isMobile && (
            <div className="mb-4 space-y-4">
              <EnhancedReviewSearch onSearch={handleSearchChange} searchQuery={searchQuery} />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("mobile-filter-dialog")?.showModal()}
                >
                  Lọc theo sao
                </Button>

                <select
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="highest">Đánh giá cao nhất</option>
                  <option value="lowest">Đánh giá thấp nhất</option>
                  <option value="most_helpful">Hữu ích nhất</option>
                </select>
              </div>

              <dialog id="mobile-filter-dialog" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                  <h3 className="font-bold text-lg mb-4">Lọc đánh giá</h3>
                  <EnhancedReviewFilter
                    totalReviews={product.totalReviews}
                    ratingCounts={product.ratingCounts}
                    onFilterChange={(rating) => {
                      handleRatingChange(rating)
                      document.getElementById("mobile-filter-dialog")?.close()
                    }}
                    selectedRating={selectedRating}
                  />
                  <div className="modal-action">
                    <form method="dialog">
                      <Button>Đóng</Button>
                    </form>
                  </div>
                </div>
              </dialog>
            </div>
          )}

          {/* Review tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="with_images">Có hình ảnh</TabsTrigger>
              <TabsTrigger value="recommended">Đề xuất</TabsTrigger>
              <TabsTrigger value="not_recommended">Không đề xuất</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {allReviewImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 font-medium">Hình ảnh từ người dùng</h3>
                  <EnhancedReviewImageGallery images={allReviewImages} />
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {filteredReviews.length} đánh giá {selectedRating ? `(${selectedRating} sao)` : ""}
                </p>

                {!isMobile && (
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="highest">Đánh giá cao nhất</option>
                    <option value="lowest">Đánh giá thấp nhất</option>
                    <option value="most_helpful">Hữu ích nhất</option>
                  </select>
                )}
              </div>

              <EnhancedReviewList reviews={filteredReviews} onHelpfulVote={handleHelpfulVote} />
            </TabsContent>

            <TabsContent value="with_images" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">{filteredReviews.length} đánh giá có hình ảnh</p>

                {!isMobile && (
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="highest">Đánh giá cao nhất</option>
                    <option value="lowest">Đánh giá thấp nhất</option>
                    <option value="most_helpful">Hữu ích nhất</option>
                  </select>
                )}
              </div>

              <EnhancedReviewList reviews={filteredReviews} onHelpfulVote={handleHelpfulVote} />
            </TabsContent>

            <TabsContent value="recommended" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">{filteredReviews.length} đánh giá đề xuất sản phẩm</p>

                {!isMobile && (
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="highest">Đánh giá cao nhất</option>
                    <option value="lowest">Đánh giá thấp nhất</option>
                    <option value="most_helpful">Hữu ích nhất</option>
                  </select>
                )}
              </div>

              <EnhancedReviewList reviews={filteredReviews} onHelpfulVote={handleHelpfulVote} />
            </TabsContent>

            <TabsContent value="not_recommended" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {filteredReviews.length} đánh giá không đề xuất sản phẩm
                </p>

                {!isMobile && (
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="highest">Đánh giá cao nhất</option>
                    <option value="lowest">Đánh giá thấp nhất</option>
                    <option value="most_helpful">Hữu ích nhất</option>
                  </select>
                )}
              </div>

              <EnhancedReviewList reviews={filteredReviews} onHelpfulVote={handleHelpfulVote} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

