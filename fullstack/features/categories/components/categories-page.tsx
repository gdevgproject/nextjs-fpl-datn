import { Suspense } from "react"
import { getAllCategories, buildCategoryTree, getCategoryProductCounts } from "../queries"
import { CategoryCard } from "./category-card"
import { CategoryCardSkeleton } from "./category-card-skeleton"

export async function CategoriesPage() {
  // Lấy tất cả danh mục
  const categories = await getAllCategories()

  // Lấy số lượng sản phẩm trong mỗi danh mục
  const productCounts = await getCategoryProductCounts()

  // Xây dựng cấu trúc cây danh mục
  const categoryTree = buildCategoryTree(categories)

  // Danh sách danh mục nổi bật
  const featuredCategories = categories.filter((category) => category.is_featured)

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Danh mục sản phẩm</h1>
        <p className="text-muted-foreground">Khám phá các danh mục sản phẩm đa dạng của chúng tôi</p>
      </div>

      {/* Danh mục nổi bật */}
      {featuredCategories.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Danh mục nổi bật</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Suspense fallback={<CategoryCardSkeletons count={4} />}>
              {featuredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} productCount={productCounts[category.id] || 0} />
              ))}
            </Suspense>
          </div>
        </div>
      )}

      {/* Tất cả danh mục */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Tất cả danh mục</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <Suspense fallback={<CategoryCardSkeletons count={8} />}>
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} productCount={productCounts[category.id] || 0} />
            ))}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function CategoryCardSkeletons({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </>
  )
}

