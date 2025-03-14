"use client"

import { Button } from "@/components/ui/Button"
import { cn } from "@/utils/helpers"
import { useState } from "react"
import { CommentList, type Comment } from "./shared/CommentList"

interface ProductQAProps {
  productId: string
}

export default function ProductQA({ productId }: ProductQAProps) {
  const [selectedFilter, setSelectedFilter] = useState<"newest" | "oldest" | "helpful">("newest")

  // This would come from a hook in real implementation
  const questions: Comment[] = [
    {
      id: "1",
      author: { name: "Chúc Hương" },
      content: "đây là men vi sinh hay men tiêu hóa",
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      replies: [
        {
          id: "1-reply",
          author: { name: "Mai Phương", isStaff: true },
          content:
            "Chào bạn Chúc Hương\nDạ sản phẩm là hỗn dịch uống men vi sinh ạ.\nNhà thuốc thông tin đến bạn.\nThân mến!",
          createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: "2",
      author: { name: "Thu Thảo" },
      content: "đây là men vi sinh hay men tiêu hóa",
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      replies: [
        {
          id: "2-reply",
          author: { name: "Mai Phương", isStaff: true },
          content:
            "Chào bạn Thu Thảo\nDạ sản phẩm là hỗn dịch uống men vi sinh ạ.\nNhà thuốc thông tin đến bạn.\nThân mến!",
          createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: "3",
      author: { name: "Thu Hiền" },
      content: "đây là men vi sinh hay men tiêu hóa",
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      replies: [
        {
          id: "3-reply",
          author: { name: "Mai Phương", isStaff: true },
          content:
            "Chào bạn Thu Hiền\nDạ sản phẩm là hỗn dịch uống men vi sinh ạ.\nNhà thuốc thông tin đến bạn.\nThân mến!",
          createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Title and comment count */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-grayscale-90">Hỏi đáp</h2>
          <span className="text-gray-500">({questions.length} bình luận)</span>
        </div>
        <Button className="mt-4 bg-primary-5 text-white hover:bg-primary-20">Gửi bình luận</Button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Lọc theo:</span>
        <div className="flex gap-2">
          {[
            { id: "newest", label: "Mới nhất" },
            { id: "oldest", label: "Cũ nhất" },
            { id: "helpful", label: "Hữu ích nhất" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id as typeof selectedFilter)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm transition-colors",
                selectedFilter === filter.id
                  ? "bg-primary-5 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary-5"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <CommentList comments={questions} />
    </div>
  )
}
