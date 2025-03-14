"use client"

import { useState } from "react"

// Types
interface Author {
  name: string
  avatar?: string
}

interface Reply {
  id: string
  author: Author
  content: string
  createdAt: string
}

interface Review {
  id: string
  author: Author
  rating: number
  content: string
  createdAt: string
  verified?: boolean
  likes?: number
  replies?: Reply[]
}

// Mock data
const mockReviews: Review[] = [
  {
    id: "1",
    author: { name: "Chúc Hương" },
    rating: 5,
    content: "đây là men vi sinh hay men tiêu hóa",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        id: "r1",
        author: { name: "Mai Phương" },
        content:
          "Chào bạn Chúc Hương\nDạ sản phẩm là hỗn dịch uống men vi sinh ạ.\nNhà thuốc thông tin đến bạn.\nThân mến!",
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "2",
    author: { name: "Thu Thảo" },
    rating: 5,
    content: "đây là men vi sinh hay men tiêu hóa",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        id: "r2",
        author: { name: "Mai Phương" },
        content:
          "Chào bạn Thu Thảo\nDạ sản phẩm là hỗn dịch uống men vi sinh ạ.\nNhà thuốc thông tin đến bạn.\nThân mến!",
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
]

export function useReviews(productId: string) {
  const [reviews] = useState<Review[]>(mockReviews)

  return {
    reviews,
    isLoading: false,
  }
}

