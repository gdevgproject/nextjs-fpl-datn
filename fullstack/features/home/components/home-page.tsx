import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BannerCarousel } from "./banner-carousel";
import { FeaturedBrands } from "./featured-brands";
import { FeaturedCategories } from "./featured-categories";
import { ProductSection } from "./product-section";
import { FeaturesSection } from "./features-section";
import { GenderProducts } from "./gender-products";
import { CustomerReviews } from "./customer-reviews";

import {
  getActiveBanners,
  getFeaturedBrands,
  getFeaturedCategories,
  getNewArrivals,
  getBestSellingProducts,
  getProductsOnSale,
  getProductsByGender,
} from "../queries";

// Skeleton loaders for suspense boundaries
const BannerSkeleton = () => (
  <div className="relative overflow-hidden rounded-lg h-[300px] md:h-[400px] lg:h-[500px] bg-muted animate-pulse"></div>
);

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    ))}
  </div>
);

// Hero Banner with Suspense
async function HeroBanner() {
  const banners = await getActiveBanners();
  return <BannerCarousel banners={banners} />;
}

// Featured Brands with Suspense
async function BrandsCarousel() {
  const brands = await getFeaturedBrands();
  return <FeaturedBrands brands={brands} />;
}

// Featured Categories with Suspense
async function CategoriesGrid() {
  const categories = await getFeaturedCategories();
  return <FeaturedCategories categories={categories} />;
}

// New Arrivals with Suspense
async function NewArrivalsSection() {
  const products = await getNewArrivals();
  return (
    <ProductSection
      title="Sản phẩm mới"
      description="Khám phá những mùi hương mới nhất tại MyBeauty"
      products={products}
      viewAllLink="/san-pham?sort=newest"
    />
  );
}

// Best Sellers with Suspense
async function BestSellersSection() {
  const products = await getBestSellingProducts();
  return (
    <ProductSection
      title="Bán chạy nhất"
      description="Những sản phẩm được khách hàng tin dùng và lựa chọn nhiều nhất"
      products={products}
      viewAllLink="/san-pham?sort=best-selling"
      bgColor="muted"
    />
  );
}

// On Sale Products with Suspense
async function OnSaleSection() {
  const products = await getProductsOnSale();
  return (
    <ProductSection
      title="Đang giảm giá"
      description="Cơ hội sở hữu những sản phẩm chất lượng với giá tốt nhất"
      products={products}
      viewAllLink="/san-pham?sale=true"
      bgColor="subtle"
    />
  );
}

// Gender Products with Suspense
async function GenderProductsSection() {
  // Get products for men (gender_id = 1) and women (gender_id = 2)
  const [menProducts, womenProducts] = await Promise.all([
    getProductsByGender(1),
    getProductsByGender(2),
  ]);

  return (
    <GenderProducts menProducts={menProducts} womenProducts={womenProducts} />
  );
}

// Customer Reviews section with some sample data
// In a real app, you'd fetch these from a database
function ReviewsSection() {
  const reviews = [
    {
      id: 1,
      user: {
        id: "user1",
        name: "Nguyễn Văn A",
      },
      rating: 5,
      comment:
        "Tôi rất hài lòng với nước hoa Bleu de Chanel. Mùi hương nam tính, lịch lãm và bền mùi cực kỳ. Chất lượng sản phẩm tuyệt vời và dịch vụ giao hàng nhanh chóng. Sẽ tiếp tục ủng hộ shop.",
      product_name: "Bleu de Chanel EDP",
    },
    {
      id: 2,
      user: {
        id: "user2",
        name: "Trần Thị B",
      },
      rating: 5,
      comment:
        "Nước hoa Creed Aventus for Her có mùi hương tinh tế, quyến rũ và độc đáo. Tôi đã dùng rất nhiều loại nước hoa nhưng đây là một trong những mùi hương tôi yêu thích nhất. Sẽ quay lại mua lần nữa.",
      product_name: "Creed Aventus for Her",
    },
    {
      id: 3,
      user: {
        id: "user3",
        name: "Phạm Văn C",
      },
      rating: 4,
      comment:
        "CK One là một mùi hương unisex tuyệt vời, tươi mát và dễ sử dụng hàng ngày. Tôi rất hài lòng với sản phẩm và dịch vụ của shop. Giao hàng nhanh và đóng gói cẩn thận.",
      product_name: "CK One EDT",
    },
  ];

  return <CustomerReviews reviews={reviews} />;
}

export function HomePage() {
  return (
    <div className="space-y-4 md:space-y-0">
      {/* Hero Banner */}
      <section>
        <Suspense fallback={<BannerSkeleton />}>
          <HeroBanner />
        </Suspense>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Featured Categories */}
      <Suspense
        fallback={
          <div className="py-12 md:py-16">
            <div className="container">
              <Skeleton className="h-8 w-64 mb-10 mx-auto" />
              <ProductGridSkeleton />
            </div>
          </div>
        }
      >
        <CategoriesGrid />
      </Suspense>

      {/* New Arrivals */}
      <Suspense
        fallback={
          <div className="py-12 md:py-16">
            <div className="container">
              <Skeleton className="h-8 w-64 mb-10" />
              <ProductGridSkeleton />
            </div>
          </div>
        }
      >
        <NewArrivalsSection />
      </Suspense>

      {/* Brand Carousel */}
      <Suspense
        fallback={
          <div className="py-12 md:py-16 bg-muted/20">
            <div className="container">
              <Skeleton className="h-8 w-64 mb-10" />
              <Skeleton className="h-[140px] w-full rounded-lg" />
            </div>
          </div>
        }
      >
        <BrandsCarousel />
      </Suspense>

      {/* Best Sellers */}
      <Suspense
        fallback={
          <div className="py-12 md:py-16 bg-muted/50">
            <div className="container">
              <Skeleton className="h-8 w-64 mb-10" />
              <ProductGridSkeleton />
            </div>
          </div>
        }
      >
        <BestSellersSection />
      </Suspense>

      {/* Gender Products */}
      <Suspense
        fallback={
          <div className="py-12 md:py-16 bg-accent/10">
            <div className="container">
              <Skeleton className="h-8 w-64 mb-10 mx-auto" />
              <ProductGridSkeleton />
            </div>
          </div>
        }
      >
        <GenderProductsSection />
      </Suspense>

      {/* Sale Products */}
      <Suspense
        fallback={
          <div className="py-12 md:py-16 bg-secondary/10">
            <div className="container">
              <Skeleton className="h-8 w-64 mb-10" />
              <ProductGridSkeleton />
            </div>
          </div>
        }
      >
        <OnSaleSection />
      </Suspense>

      {/* Customer Reviews */}
      <ReviewsSection />
    </div>
  );
}
