import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Newspaper } from "lucide-react"

const categories = [
  { id: 1, label: "Dinh dưỡng", href: "/health-news/category/dinh-duong" },
  { id: 2, label: "Phòng chữa bệnh", href: "/health-news/category/phong-chua-benh" },
  { id: 3, label: "Khỏe đẹp", href: "/health-news/category/khoe-dep" },
  { id: 4, label: "Mẹ và bé", href: "/health-news/category/me-va-be" },
  { id: 5, label: "Giới tính", href: "/health-news/category/gioi-tinh" },
  { id: 6, label: "Khuyến mãi", href: "/health-news/category/khuyen-mai" },
]

const mainArticle = {
  id: 1,
  image: "/placeholder.svg?height=400&width=600",
  title:
    "Chính thức: Tiêm chủng Elela thông tin về kết quả kiểm tra của trẻ em và đánh giá an toàn tiêm chủng cho toàn dân",
  date: "27/10/2023",
  category: "Truyền Thông",
  slug: "tiem-chung-elela-ket-qua-kiem-tra",
  href: "/health-news/article/tiem-chung-elela-ket-qua-kiem-tra",
}

const relatedArticles = [
  {
    id: 2,
    image: "/placeholder.svg?height=100&width=150",
    title: "Tiêm chủng Elela thông tin về kết quả kiểm tra của trẻ em",
    date: "26/10/2023",
    category: "Truyền Thông",
    slug: "tiem-chung-elela-ket-qua-kiem-tra-tre-em",
    href: "/health-news/article/tiem-chung-elela-ket-qua-kiem-tra-tre-em",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=100&width=150",
    title: "Tiêm chủng Elela thông tin về kết quả kiểm tra của trẻ em",
    date: "25/10/2023",
    category: "Truyền Thông",
    slug: "tiem-chung-elela-ket-qua-kiem-tra-tre-em-2",
    href: "/health-news/article/tiem-chung-elela-ket-qua-kiem-tra-tre-em-2",
  },
  {
    id: 4,
    image: "/placeholder.svg?height=100&width=150",
    title: "Tiêm chủng Elela thông tin về kết quả kiểm tra của trẻ em",
    date: "24/10/2023",
    category: "Truyền Thông",
    slug: "tiem-chung-elela-ket-qua-kiem-tra-tre-em-3",
    href: "/health-news/article/tiem-chung-elela-ket-qua-kiem-tra-tre-em-3",
  },
  {
    id: 5,
    image: "/placeholder.svg?height=100&width=150",
    title: "Tiêm chủng Elela thông tin về kết quả kiểm tra của trẻ em",
    date: "23/10/2023",
    category: "Truyền Thông",
    slug: "tiem-chung-elela-ket-qua-kiem-tra-tre-em-4",
    href: "/health-news/article/tiem-chung-elela-ket-qua-kiem-tra-tre-em-4",
  },
]

export default function HealthNews() {
  return (
    <section aria-labelledby="health-news-heading">
      {/* Header */}
      <header className="mb-4 sm:mb-6 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <Newspaper className="h-5 w-5 sm:h-6 sm:w-6 text-primary-40" />
          <h2 id="health-news-heading" className="text-lg sm:text-xl font-bold text-primary-5">
            Góc Sức Khỏe
          </h2>
        </div>
        <Link href="/health-news" className="flex items-center gap-1 text-primary-40 p-0 sm:p-2 text-xs sm:text-sm">
          Xem thêm
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Link>
      </header>

      {/* Categories */}
      <nav className="mb-4 sm:mb-6 flex flex-wrap gap-1.5 sm:gap-2" aria-label="Danh mục sức khỏe">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="rounded-full border border-grayscale-30 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-grayscale-70 transition-colors hover:bg-primary-5 hover:text-white"
          >
            {category.label}
          </Link>
        ))}
      </nav>

      {/* Content Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {/* Main Article */}
        <article className="md:col-span-2">
          <Link href={mainArticle.href} className="group block">
            <figure className="relative mb-2 sm:mb-3 md:mb-4 aspect-[16/9] overflow-hidden rounded-lg">
              <Image
                src={mainArticle.image || "/placeholder.svg"}
                alt={mainArticle.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </figure>
            <div className="mb-1 sm:mb-2 flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <span className="rounded bg-primary-5/10 px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 text-[10px] sm:text-xs font-medium text-primary-40">
                {mainArticle.category}
              </span>
              <time dateTime={mainArticle.date} className="text-[10px] sm:text-xs md:text-sm text-grayscale-50">
                {mainArticle.date}
              </time>
            </div>
            <h3 className="text-sm sm:text-base md:text-xl font-semibold text-grayscale-90 group-hover:text-primary-40">
              {mainArticle.title}
            </h3>
          </Link>
        </article>

        {/* Related Articles */}
        <aside className="space-y-2 sm:space-y-3 md:space-y-4">
          {relatedArticles.map((article) => (
            <article key={article.id} className="group">
              <Link href={article.href} className="flex gap-2 sm:gap-3 md:gap-4">
                <figure className="relative h-16 w-24 sm:h-20 sm:w-28 md:h-24 md:w-36 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </figure>
                <div className="flex-1">
                  <span className="mb-0.5 sm:mb-1 md:mb-2 inline-block rounded bg-primary-5/10 px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 text-[10px] sm:text-xs font-medium text-primary-40">
                    {article.category}
                  </span>
                  <h3 className="line-clamp-2 text-[10px] sm:text-xs md:text-sm font-medium text-grayscale-90 group-hover:text-primary-40">
                    {article.title}
                  </h3>
                  <time
                    dateTime={article.date}
                    className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm text-grayscale-50"
                  >
                    {article.date}
                  </time>
                </div>
              </Link>
            </article>
          ))}
        </aside>
      </div>
    </section>
  )
}

