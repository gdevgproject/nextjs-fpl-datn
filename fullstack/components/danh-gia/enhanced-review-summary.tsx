"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, ThumbsUp, ThumbsDown, BarChart3 } from "lucide-react"
import { EnhancedStarRating } from "@/components/danh-gia/enhanced-star-rating"
import { useMediaQuery } from "@/hooks/use-media-query"

interface EnhancedReviewSummaryProps {
  averageRating: number
  totalReviews: number
  ratingCounts: {
    rating: number
    count: number
  }[]
  recommendPercentage: number
}

export function EnhancedReviewSummary({
  averageRating,
  totalReviews,
  ratingCounts,
  recommendPercentage,
}: EnhancedReviewSummaryProps) {
  const [activeTab, setActiveTab] = useState("stats")
  const isMobile = useMediaQuery("(max-width: 640px)")

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">
            <BarChart3 className="mr-2 h-4 w-4" />
            Thống kê
          </TabsTrigger>
          <TabsTrigger value="recommend">
            <ThumbsUp className="mr-2 h-4 w-4" />
            Đề xuất
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="my-2">
                <EnhancedStarRating
                  value={Math.round(averageRating)}
                  onChange={() => {}}
                  size={isMobile ? "sm" : "md"}
                  readOnly
                />
              </div>
              <div className="text-sm text-muted-foreground">{totalReviews} đánh giá</div>
            </div>

            <div className="flex-1 space-y-2 w-full md:max-w-xs">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingCounts.find((r) => r.rating === rating)?.count || 0
                const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0

                return (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex items-center w-12">
                      <span>{rating}</span>
                      <Star className="h-4 w-4 ml-1 fill-amber-500 text-amber-500" />
                    </div>
                    <Progress value={percent} className="h-2 flex-1" />
                    <div className="w-12 text-right text-sm text-muted-foreground">{count}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recommend" className="mt-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative h-32 w-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl font-bold">{recommendPercentage}%</div>
              </div>
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={`${(2 * Math.PI * 45 * recommendPercentage) / 100} ${(2 * Math.PI * 45 * (100 - recommendPercentage)) / 100}`}
                  strokeDashoffset={(2 * Math.PI * 45 * 25) / 100}
                  className="text-primary"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Đề xuất sản phẩm</p>
              <p className="text-sm text-muted-foreground">{recommendPercentage}% người dùng đề xuất sản phẩm này</p>
            </div>
            <div className="flex justify-center gap-8">
              <div className="flex items-center">
                <ThumbsUp className="mr-2 h-5 w-5 text-green-500" />
                <span>{Math.round((totalReviews * recommendPercentage) / 100)}</span>
              </div>
              <div className="flex items-center">
                <ThumbsDown className="mr-2 h-5 w-5 text-red-500" />
                <span>{totalReviews - Math.round((totalReviews * recommendPercentage) / 100)}</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

