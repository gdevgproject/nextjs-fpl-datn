"use client"

import Image from "next/image"
import Link from "next/link"
import { formatDate } from "@/utils/format"
import type { Article } from "../types/articleTypes"

interface ArticleCardProps {
  article: Article
  variant?: "default" | "featured" | "compact"
}

export default function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const { title, slug, excerpt, thumbnailUrl, author, publishedAt, readingTime, categories } = article

  if (variant === "featured") {
    return (
      <article className="group relative">
        <Link href={`/health-news/article/${slug}`} className="block">
          <figure className="relative aspect-[16/9] overflow-hidden rounded-lg">
            <Image
              src={thumbnailUrl || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </figure>
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded bg-primary-5/10 px-2 py-1 text-xs font-medium text-primary-40">
                {categories[0]?.name}
              </span>
              <time dateTime={publishedAt} className="text-sm text-grayscale-50">
                {formatDate(publishedAt)}
              </time>
              <span className="text-sm text-grayscale-50">{readingTime} phút đọc</span>
            </div>
            <h3 className="line-clamp-2 text-xl font-semibold text-grayscale-90 group-hover:text-primary-40">
              {title}
            </h3>
            <p className="mt-2 line-clamp-3 text-grayscale-60">{excerpt}</p>
            <footer className="mt-3 flex items-center gap-2">
              {author.avatarUrl && (
                <Image
                  src={author.avatarUrl || "/placeholder.svg"}
                  alt={author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="text-sm font-medium text-grayscale-70">{author.name}</span>
            </footer>
          </div>
        </Link>
      </article>
    )
  }

  if (variant === "compact") {
    return (
      <article className="group">
        <Link href={`/health-news/article/${slug}`} className="flex gap-4">
          <figure className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={thumbnailUrl || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </figure>
          <div>
            <h3 className="line-clamp-2 text-sm font-medium text-grayscale-90 group-hover:text-primary-40">{title}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-grayscale-50">
              <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
              <span>•</span>
              <span>{readingTime} phút đọc</span>
            </div>
          </div>
        </Link>
      </article>
    )
  }

  // Default variant
  return (
    <article className="group">
      <Link href={`/health-news/article/${slug}`} className="block">
        <figure className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <Image
            src={thumbnailUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </figure>
        <div className="mt-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-primary-5/10 px-2 py-1 text-xs font-medium text-primary-40">
              {categories[0]?.name}
            </span>
            <time dateTime={publishedAt} className="text-xs text-grayscale-50">
              {formatDate(publishedAt)}
            </time>
          </div>
          <h3 className="line-clamp-2 font-medium text-grayscale-90 group-hover:text-primary-40">{title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-grayscale-60">{excerpt}</p>
        </div>
      </Link>
    </article>
  )
}

