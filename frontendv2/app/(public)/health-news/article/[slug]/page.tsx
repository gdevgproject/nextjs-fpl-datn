import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { Button } from "@/components/ui/Button"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import ArticleContent from "@/features/article/components/ArticleContent"
import RelatedArticles from "@/features/article/components/RelatedArticles"
import TextSizeAdjuster from "@/features/article/components/TextSizeAdjuster"
import { articleService } from "@/features/article/services/articleServiceFactory"
import { formatDate } from "@/utils/format"
import { generateMetadata as generateSeoMetadata } from "@/utils/seo"
import { Check, Facebook, Quote } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  let seoData = {
    title: "Bài Viết - Góc Sức Khỏe",
    description: "Bài viết về sức khỏe và dinh dưỡng từ Elena Pharmacy",
  }

  try {
    const article = await articleService.getArticleBySlug(params.slug)
    if (article) {
      seoData = {
        title: article.title,
        description: article.excerpt,
        keywords: article.tags,
        image: article.thumbnailUrl,
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
  }

  return generateSeoMetadata(seoData)
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const articleSlug = params.slug

  // Fetch data on the server
  const article = await articleService.getArticleBySlug(articleSlug)
  const relatedArticles = await articleService.getRelatedArticles(articleSlug, 3)

  return (
    <div className="min-h-screen bg-background pb-8 sm:pb-12 pt-4 sm:pt-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb - Navigation path */}
        <nav aria-label="Breadcrumb">
          <Breadcrumb
            items={[
              { label: "Trang Chủ", href: "/" },
              { label: "Góc Sức Khỏe", href: "/health-news" },
              {
                label: article.categories[0]?.name || "Truyền Thông",
                href: `/health-news/category/${article.categories[0]?.slug || "truyen-thong"}`,
              },
            ]}
          />
        </nav>

        <main className="mx-auto max-w-3xl">
          <article itemScope itemType="http://schema.org/Article">
            {/* Row 1: Article Title */}
            <header className="mb-6 mt-6">
              <h1
                itemProp="headline"
                className="text-2xl sm:text-3xl font-bold text-grayscale-90 leading-tight"
              >
                {article.title}
              </h1>
              <meta itemProp="author" content={article.author.name} />
              <meta itemProp="datePublished" content={article.publishedAt} />
              {article.updatedAt && <meta itemProp="dateModified" content={article.updatedAt} />}
            </header>

            {/* Row 2: Meta Info and Text Size Controls */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              {/* Date and Share */}
              <div className="flex items-center gap-4">
                <time dateTime={article.publishedAt} className="text-[#6C757D]">
                  {formatDate(article.publishedAt)}
                </time>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 rounded-md bg-[#1877F2] px-4 py-2 text-white hover:bg-[#1877F2]/90"
                >
                  <Facebook className="h-4 w-4" />
                  <span>Chia sẻ</span>
                </Button>
              </div>

              {/* Text Size Controls */}
              <TextSizeAdjuster targetSelector=".article-content" />
            </div>

            {/* Row 3: Article Excerpt */}
            <blockquote className="mb-8 rounded-lg bg-[#F8F9FA] p-6">
              <div className="flex">
                <Quote className="h-10 w-10 flex-shrink-0 text-primary-20 opacity-40" />
                <p itemProp="description" className="ml-4 text-[#6C757D]">
                  {article.excerpt}
                </p>
              </div>
            </blockquote>

            {/* Row 4: Article Content and Images */}
            <div className="mb-6 sm:mb-8">
              {/* Featured Image */}
              <figure className="mb-4 sm:mb-6 overflow-hidden rounded-lg">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={article.thumbnailUrl || "/placeholder.svg"}
                    alt={article.title}
                    fill
                    priority
                    className="object-cover"
                    itemProp="image"
                  />
                </div>
                <figcaption className="mt-1 sm:mt-2 text-center text-xs sm:text-sm text-grayscale-60">
                  Elena mở rộng chi nhánh hoạt động
                </figcaption>
              </figure>

              {/* Article Content */}
              <ArticleContent content={article.content} />
            </div>

            {/* Author Info */}
            <footer className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-grayscale-20 bg-white p-6">
              <div className="flex items-center gap-4">
                <Image
                  src={article.author.avatarUrl || "/placeholder.svg"}
                  alt={article.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-medium text-grayscale-90">{article.author.name}</h3>
                  <p className="text-sm text-grayscale-60">
                    {article.author.role || "Biên tập viên"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-sm">
                  <Check className="h-4 w-4 text-success-5" />
                  <span className="text-success-5">Đã kiểm duyệt nội dung</span>
                </div>
                <p className="text-sm text-grayscale-60">
                  {article.author.experience ||
                    "Hơn 5 năm kinh nghiệm trong lĩnh vực quản lý nội dung số."}
                </p>
              </div>
            </footer>

            {/* Row 6: Tags */}
            {article.tags.length > 0 && (
              <section className="mb-6 sm:mb-8" aria-label="Chủ đề bài viết">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-grayscale-70">Chủ đề:</span>
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/health-news?tag=${tag}`}
                      className="rounded-full bg-grayscale-10 px-2 sm:px-3 py-1 text-xs sm:text-sm text-grayscale-70 hover:bg-grayscale-20"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Row 7: Related Articles Section */}
          <section className="mt-8 sm:mt-12" aria-labelledby="related-articles-heading">
            <h2 id="related-articles-heading" className="sr-only">
              Bài viết liên quan
            </h2>
            <Suspense fallback={<LoadingSpinner />}>
              <RelatedArticles articles={relatedArticles} />
            </Suspense>
          </section>
        </main>
      </div>
    </div>
  )
}
