import type { Metadata } from "next"
import { Suspense } from "react"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import FeaturedArticles from "@/features/article/components/FeaturedArticles"
import CategoryList from "@/features/article/components/CategoryList"
import PopularArticles from "@/features/article/components/PopularArticles"
import ArticleList from "@/features/article/components/ArticleList"
import { articleService } from "@/features/article/services/articleServiceFactory"
import { generateMetadata as generateSeoMetadata } from "@/utils/seo"

export function generateMetadata(): Metadata {
  return generateSeoMetadata({
    title: "Góc Sức Khỏe",
    description: "Cập nhật thông tin sức khỏe, dinh dưỡng và lời khuyên từ chuyên gia y tế",
    keywords: ["sức khỏe", "dinh dưỡng", "bài viết y tế", "lời khuyên sức khỏe"],
  })
}

export default async function HealthNewsPage() {
  // Fetch data on the server
  const categories = await articleService.getArticleCategories()
  const featuredArticles = await articleService.getFeaturedArticles(5)
  const popularArticles = await articleService.getPopularArticles(5)
  const latestArticles = await articleService.getArticles({ page: 1, limit: 12 })

  return (
    <div className="min-h-screen bg-background pb-8 sm:pb-12 pt-4 sm:pt-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <Breadcrumb items={[{ label: "Trang Chủ", href: "/" }, { label: "Góc Sức Khỏe" }]} />
        </nav>

        {/* Title Section */}
        <header className="mb-6 sm:mb-8">
          <h1 className="mb-1 sm:mb-2 text-2xl sm:text-3xl font-bold text-grayscale-90">Góc Sức Khỏe</h1>
          <p className="text-sm sm:text-base text-grayscale-60">
            Cập nhật thông tin sức khỏe, dinh dưỡng và lời khuyên từ chuyên gia y tế
          </p>
        </header>

        {/* Featured Articles */}
        <section className="mb-6 sm:mb-10" aria-labelledby="featured-articles">
          <h2 id="featured-articles" className="sr-only">
            Bài Viết Nổi Bật
          </h2>
          <Suspense fallback={<LoadingSpinner />}>
            <FeaturedArticles articles={featuredArticles} />
          </Suspense>
        </section>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-12">
          {/* Main Content */}
          <main className="md:col-span-8">
            {/* Categories Section */}
            <section className="mb-6 sm:mb-8" aria-labelledby="categories-heading">
              <h2 id="categories-heading" className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-grayscale-90">
                Danh Mục
              </h2>
              <CategoryList categories={categories} />
            </section>

            {/* Latest Articles */}
            <section aria-labelledby="latest-articles">
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <h2 id="latest-articles" className="text-lg sm:text-xl font-bold text-grayscale-90">
                  Bài Viết Mới Nhất
                </h2>
              </div>
              <ArticleList articles={latestArticles.articles} />
            </section>
          </main>

          {/* Sidebar */}
          <aside className="md:col-span-4">
            {/* Popular Articles */}
            <section
              className="mb-6 sm:mb-8 rounded-lg bg-white p-4 sm:p-6 shadow-sm"
              aria-labelledby="popular-articles"
            >
              <h2 id="popular-articles" className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-grayscale-90">
                Bài Viết Phổ Biến
              </h2>
              <PopularArticles articles={popularArticles} />
            </section>

            {/* Newsletter Signup */}
            <section className="rounded-lg bg-primary-5 p-4 sm:p-6 text-white" aria-labelledby="newsletter-signup">
              <h2 id="newsletter-signup" className="mb-1 sm:mb-2 text-lg sm:text-xl font-bold">
                Đăng Ký Nhận Tin
              </h2>
              <p className="mb-3 sm:mb-4 text-sm text-white/80">Nhận thông tin sức khỏe mới nhất qua email</p>
              <form className="space-y-2 sm:space-y-3">
                <label htmlFor="email-signup" className="sr-only">
                  Email của bạn
                </label>
                <input
                  id="email-signup"
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full rounded-lg border-none px-3 sm:px-4 py-2 text-sm sm:text-base text-grayscale-90"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-white px-3 sm:px-4 py-2 text-sm sm:text-base font-medium text-primary-5 hover:bg-white/90"
                >
                  Đăng Ký
                </button>
              </form>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

