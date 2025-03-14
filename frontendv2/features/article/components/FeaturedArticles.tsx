"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ArticleCard from "./ArticleCard"
import { Button } from "@/components/ui/Button"
import type { Article } from "../types/articleTypes"

interface FeaturedArticlesProps {
  articles: Article[]
}

export default function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!articles || articles.length === 0) {
    return null
  }

  const mainArticle = articles[currentIndex]
  const sideArticles = articles.filter((_, index) => index !== currentIndex).slice(0, 2)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1))
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-grayscale-90">Bài Viết Nổi Bật</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            className="flex h-8 w-8 items-center justify-center rounded-full p-0"
            aria-label="Bài viết trước"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Trước</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="flex h-8 w-8 items-center justify-center rounded-full p-0"
            aria-label="Bài viết sau"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Sau</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ArticleCard article={mainArticle} variant="featured" />
        </div>
        <div className="space-y-6">
          {sideArticles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  )
}

