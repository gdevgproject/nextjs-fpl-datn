import {
  getActiveBanners,
  getFeaturedBrands,
  getFeaturedCategories,
  getFeaturedProducts,
  getNewArrivals,
  getProductsOnSale,
  getBestSellingProducts,
} from "../home-data";
import { BannerCarousel } from "./hero-banner";
import { FeaturedCategories } from "./featured-categories-section";
import { ProductSection } from "./product-section";
import { FeaturedBrands } from "./brands-section";
import { FeaturesSection } from "./features-section";

// Main HomePage component
export async function HomePage() {
  const [
    banners,
    brands,
    saleProducts,
    newArrivals,
    bestSelling,
    categories,
    featuredProducts,
  ] = await Promise.all([
    getActiveBanners(),
    getFeaturedBrands(),
    getProductsOnSale(),
    getNewArrivals(),
    getBestSellingProducts(),
    getFeaturedCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Banner Carousel */}
      <BannerCarousel banners={banners} />

      {/* Featured Categories */}
      <FeaturedCategories categories={categories} />

      {/* Featured Brands - Moved up */}
      <FeaturedBrands brands={brands} />

      {/* Sale Products - Moved up */}
      <ProductSection
        title="Đang giảm giá"
        description="Cơ hội sở hữu những sản phẩm chất lượng với giá tốt nhất"
        products={saleProducts}
        viewAllLink="/san-pham?sale=true"
        bgColor="subtle"
      />

      {/* New Arrivals */}
      <ProductSection
        title="Sản phẩm mới"
        description="Những sản phẩm mới nhất vừa cập nhật"
        products={newArrivals}
        viewAllLink="/san-pham?sort=newest"
        bgColor="accent"
      />

      {/* Best Selling Products */}
      <ProductSection
        title="Bán chạy nhất"
        description="Những sản phẩm được khách hàng tin dùng và lựa chọn nhiều nhất"
        products={bestSelling}
        viewAllLink="/san-pham?sort=best-selling"
        bgColor="muted"
      />

      {/* Featured Products */}
      <ProductSection
        title="Sản phẩm nổi bật"
        description="Những sản phẩm được yêu thích nhất của chúng tôi"
        products={featuredProducts}
        viewAllLink="/san-pham?featured=true"
        bgColor="default"
      />

      {/* Features Section */}
      <FeaturesSection />
    </div>
  );
}
