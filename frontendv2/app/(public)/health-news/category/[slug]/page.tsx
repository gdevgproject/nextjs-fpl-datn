import type { Metadata } from "next"
import { Suspense } from "react"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import ArticleList from "@/features/article/components/ArticleList"
import CategoryList from "@/features/article/components/CategoryList"
import PopularArticles from "@/features/article/components/PopularArticles"
import { articleService } from "@/features/article/services/articleServiceFactory"
import { generateMetadata as generateSeoMetadata } from "@/utils/seo"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  let seoData = {
    title: "Danh Mục Bài Viết - Góc Sức Khỏe",
    description: "Các bài viết theo danh mục về sức khỏe và dinh dưỡng từ Elena Pharmacy",
  }

  try {
    const categories = await articleService.getArticleCategories()
    const category = categories.find((cat) => cat.slug === params.slug)

    if (category) {
      seoData = {
        title: category.name,
        description: category.description || `Những bài viết về ${category.name} từ Elena Pharmacy`,
        keywords: [category.name, "sức khỏe", "dinh dưỡng", "bài viết y tế"],
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
  }

  return generateSeoMetadata(seoData)
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const categorySlug = params.slug

  // Fetch data on the server
  const categories = await articleService.getArticleCategories()
  const currentCategory = categories.find((cat) => cat.slug === categorySlug)
  const articles = await articleService.getArticles({ categorySlug, page: 1, limit: 12 })
  const popularArticles = await articleService.getPopularArticles(5)

  return (
    <div className="min-h-screen bg-background pb-12 pt-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <Breadcrumb
            items={[
              { label: "Trang Chủ", href: "/" },
              { label: "Góc Sức Khỏe", href: "/health-news" },
              { label: currentCategory?.name || "Danh Mục" },
            ]}
          />
        </nav>

        {/* Title Section */}
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-grayscale-90">{currentCategory?.name}</h1>
          {currentCategory?.description && <p className="text-grayscale-60">{currentCategory.description}</p>}
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Main Content */}
          <main className="md:col-span-8">
            {/* Categories */}
            <section className="mb-8" aria-labelledby="categories-heading">
              <h2 id="categories-heading" className="mb-4 text-xl font-bold text-grayscale-90">
                Danh Mục
              </h2>
              <CategoryList categories={categories} activeSlug={categorySlug} />
            </section>

            {/* Articles */}
            <section aria-labelledby="category-articles">
              <h2 id="category-articles" className="mb-4 text-xl font-bold text-grayscale-90">
                Bài Viết Trong Danh Mục {currentCategory?.name}
              </h2>
              <Suspense fallback={<LoadingSpinner />}>
                <ArticleList articles={articles.articles} />

                {articles.articles.length === 0 && (
                  <p className="py-8 text-center text-grayscale-60">Không có bài viết nào trong danh mục này.</p>
                )}
              </Suspense>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="md:col-span-4">
            {/* Popular Articles */}
            <section className="mb-8 rounded-lg bg-white p-6 shadow-sm" aria-labelledby="popular-articles">
              <h2 id="popular-articles" className="mb-4 text-xl font-bold text-grayscale-90">
                Bài Viết Phổ Biến
              </h2>
              <PopularArticles articles={popularArticles} />
            </section>

            {/* Newsletter Signup */}
            <section className="rounded-lg bg-primary-5 p-6 text-white" aria-labelledby="newsletter-signup">
              <h2 id="newsletter-signup" className="mb-2 text-xl font-bold">
                Đăng Ký Nhận Tin
              </h2>
              <p className="mb-4 text-white/80">Nhận thông tin sức khỏe mới nhất qua email</p>
              <form className="space-y-3">
                <label htmlFor="email-signup" className="sr-only">
                  Email của bạn
                </label>
                <input
                  id="email-signup"
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full rounded-lg border-none px-4 py-2 text-grayscale-90"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-white px-4 py-2 font-medium text-primary-5 hover:bg-white/90"
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

