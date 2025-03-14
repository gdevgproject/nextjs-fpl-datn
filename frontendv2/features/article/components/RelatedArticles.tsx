"use client"

import type { Article } from "../types/articleTypes"
import Link from "next/link"
import Image from "next/image"
import { FileText } from "lucide-react"

interface RelatedArticlesProps {
  articles: Article[]
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-grayscale-60">Không có bài viết liên quan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary-5">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-lg font-bold text-grayscale-90">Các bài viết liên quan</h2>
      </div>

      {/* Article Cards */}
      <div className="space-y-4">
        {articles.map((article) => (
          <article
            key={article.id}
            className="overflow-hidden rounded-lg border border-grayscale-20 bg-white hover:shadow-md"
          >
            <Link href={`/health-news/article/${article.slug}`} className="flex gap-4">
              {/* Article Image */}
              <div className="relative h-[120px] w-[200px] flex-shrink-0">
                <Image
                  src={article.thumbnailUrl || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Article Content */}
              <div className="flex flex-col justify-center py-3 pr-4">
                <span className="mb-2 inline-block rounded-md bg-primary-5/10 px-3 py-1 text-sm text-primary-40">
                  {article.categories[0]?.name || "Truyền Thông"}
                </span>
                <h3 className="line-clamp-2 text-base font-medium text-grayscale-90 group-hover:text-primary-40">
                  {article.title}
                </h3>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}

