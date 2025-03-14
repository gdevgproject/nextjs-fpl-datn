"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ArticleCard from "./ArticleCard"
import { Button } from "@/components/ui/Button"
import type { Article } from "../types/articleTypes"

interface ArticleListProps {
  articles: Article[]
  totalPages?: number
  currentPage?: number
  onPageChange?: (page: number) => void
}

export default function ArticleList({ articles, totalPages = 1, currentPage = 1, onPageChange }: ArticleListProps) {
  const [page, setPage] = useState(currentPage)

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return

    setPage(newPage)
    if (onPageChange) {
      onPageChange(newPage)
    }
  }

  if (articles.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-grayscale-60">Không có bài viết nào.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Phân trang">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center p-0"
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Trang trước</span>
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className="flex h-8 w-8 items-center justify-center p-0"
              aria-current={pageNum === page ? "page" : undefined}
            >
              {pageNum}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="flex h-8 w-8 items-center justify-center p-0"
            aria-label="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Trang sau</span>
          </Button>
        </nav>
      )}
    </div>
  )
}

