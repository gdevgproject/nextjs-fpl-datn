import { createServerComponentClient } from "@/lib/supabase/server";
import HeroBanner from "@/features/shop/home/components/hero-banner";
import FeaturedCategoriesSection from "@/features/shop/home/components/featured-categories-section";
import NewArrivalsSection from "@/features/shop/home/components/new-arrivals-section";
import BestSellersSection from "@/features/shop/home/components/best-sellers-section";
import OnSaleSection from "@/features/shop/home/components/on-sale-section";
import BrandsSection from "@/features/shop/home/components/brands-section";

export const revalidate = 3600; // Revalidate every hour

async function getBanners() {
  const supabase = await createServerComponentClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order("display_order", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error fetching banners:", error);
    return [];
  }

  return data || [];
}

async function getFeaturedCategories() {
  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, name, slug, image_url, description, is_featured, display_order"
    )
    .eq("is_featured", true)
    .order("display_order");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

export default async function HomePage() {
  const [banners, featuredCategories] = await Promise.all([
    getBanners(),
    getFeaturedCategories(),
  ]);

  return (
    <div className="flex flex-col pb-16">
      {/* Hero Banner Section */}
      <HeroBanner banners={banners} />

      <div className="container px-4 md:px-6 mx-auto space-y-16 md:space-y-24 mt-10 md:mt-16">
        {/* Brands Section - Client Component with useClientFetch */}
        <BrandsSection />

        {/* Featured Categories Section */}
        <FeaturedCategoriesSection categories={featuredCategories} />

        {/* New Arrivals Section - Client Component with useClientFetch */}
        <NewArrivalsSection />

        {/* Best Sellers Section - Client Component with useClientRpcQuery */}
        <BestSellersSection />

        {/* On Sale Section - Client Component with useClientFetch */}
        <OnSaleSection />
      </div>
    </div>
  );
}
