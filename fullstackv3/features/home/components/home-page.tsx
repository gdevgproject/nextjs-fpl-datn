import { Suspense } from "react"
import {
  getActiveBanners,
  getFeaturedBrands,
  getFeaturedCategories,
  getFeaturedProducts,
  getNewArrivals,
  getProductsOnSale,
  getBestSellingProducts,
} from "../queries"
import { BannerCarousel } from "./banner-carousel"
import { FeaturedCategories } from "./featured-categories"
import { ProductSection } from "./product-section"
import { FeaturedBrands } from "./featured-brands"
import { FeaturesSection } from "./features-section"
import { Skeleton } from "@/components/ui/skeleton"

// Skeleton loaders for each section
function BannerSkeleton() {
  return <Skeleton className="aspect-[21/9] w-full rounded-none md:aspect-[3/1]" />
}

function CategoriesSkeleton() {
  return (
    <section className="bg-background py-12">
      <div className="container">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4">
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductsSkeleton({
  bgColor = "default",
}: {
  bgColor?: "default" | "muted" | "accent" | "subtle"
}) {
  const getBgClass = () => {
    switch (bgColor) {
      case "muted":
        return "bg-muted/60 dark:bg-muted/30"
      case "accent":
        return "bg-primary/5 dark:bg-primary/10"
      case "subtle":
        return "bg-secondary/5 dark:bg-secondary/10"
      default:
        return "bg-background"
    }
  }

  return (
    <section className={getBgClass()}>
      <div className="container py-12">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BrandsSkeleton() {
  return (
    <section className="bg-primary/5 dark:bg-primary/10 py-12">
      <div className="container">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    </section>
  )
}

// Async components for each section
async function BannerSection() {
  const banners = await getActiveBanners()
  return <BannerCarousel banners={banners} />
}

async function CategoriesSection() {
  const categories = await getFeaturedCategories()
  return <FeaturedCategories categories={categories} />
}

async function FeaturedProductsSection() {
  const products = await getFeaturedProducts()
  return (
    <ProductSection
      title="Sản phẩm nổi bật"
      description="Những sản phẩm được yêu thích nhất của chúng tôi"
      products={products}
      viewAllLink="/san-pham?featured=true"
      bgColor="default"
    />
  )
}

async function NewArrivalsSection() {
  const products = await getNewArrivals()
  return (
    <ProductSection
      title="Sản phẩm mới"
      description="Những sản phẩm mới nhất vừa cập nhật"
      products={products}
      viewAllLink="/san-pham?sort=newest"
      bgColor="accent"
    />
  )
}

async function SaleProductsSection() {
  const products = await getProductsOnSale()
  return (
    <ProductSection
      title="Đang giảm giá"
      description="Cơ hội sở hữu những sản phẩm chất lượng với giá tốt nhất"
      products={products}
      viewAllLink="/san-pham?sale=true"
      bgColor="subtle"
    />
  )
}

async function BestSellingSection() {
  const products = await getBestSellingProducts()
  return (
    <ProductSection
      title="Bán chạy nhất"
      description="Những sản phẩm được khách hàng tin dùng và lựa chọn nhiều nhất"
      products={products}
      viewAllLink="/san-pham?sort=best-selling"
      bgColor="muted"
    />
  )
}

async function BrandsSection() {
  const brands = await getFeaturedBrands()
  return <FeaturedBrands brands={brands} />
}

// Main HomePage component
export async function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Banner Carousel */}
      <Suspense fallback={<BannerSkeleton />}>
        <BannerSection />
      </Suspense>

      {/* Featured Brands - Moved up */}
      <Suspense fallback={<BrandsSkeleton />}>
        <BrandsSection />
      </Suspense>

      {/* Sale Products - Moved up */}
      <Suspense fallback={<ProductsSkeleton bgColor="subtle" />}>
        <SaleProductsSection />
      </Suspense>

      {/* New Arrivals */}
      <Suspense fallback={<ProductsSkeleton bgColor="accent" />}>
        <NewArrivalsSection />
      </Suspense>

      {/* Best Selling Products */}
      <Suspense fallback={<ProductsSkeleton bgColor="muted" />}>
        <BestSellingSection />
      </Suspense>

      {/* Featured Categories */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesSection />
      </Suspense>

      {/* Featured Products */}
      <Suspense fallback={<ProductsSkeleton />}>
        <FeaturedProductsSection />
      </Suspense>

      {/* Features Section */}
      <FeaturesSection />
    </div>
  )
}

