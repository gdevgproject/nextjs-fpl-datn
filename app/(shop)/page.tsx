import { createServerComponentClient } from "@/lib/supabase/server";
import HeroBanner from "@/features/shop/home/components/hero-banner";
import FeaturedCategoriesSection from "@/features/shop/home/components/featured-categories-section";
import NewArrivalsSection from "@/features/shop/home/components/new-arrivals-section";
import BestSellersSection from "@/features/shop/home/components/best-sellers-section";
import OnSaleSection from "@/features/shop/home/components/on-sale-section";
import BrandsSection from "@/features/shop/home/components/brands-section";
import type { ProductData } from "@/features/shop/home/hooks/use-new-arrivals";
import type { Brand } from "@/features/shop/home/hooks/use-brands";

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

async function getOnSaleProducts(): Promise<ProductData[]> {
  const supabase = await createServerComponentClient();
  const { data, error } = await supabase.rpc(
    "get_homepage_on_sale_products_with_stock",
    { p_limit: 8 }
  );
  if (error) return [];
  const items = (data as any[]).map((item) => ({
    id: item.product_id,
    name: item.product_name,
    slug: item.product_slug,
    brand: { name: item.brand_name },
    images: [{ image_url: item.main_image_url, is_main: true }],
    price: item.chosen_price,
    sale_price: item.chosen_sale_price,
    variants: [
      {
        id: item.chosen_variant_id,
        volume_ml: item.chosen_volume_ml,
        price: item.chosen_price,
        sale_price: item.chosen_sale_price,
        stock_quantity: item.is_chosen_variant_in_stock ? 1 : 0,
      },
    ],
  }));
  return items;
}

async function getNewArrivalsProducts(): Promise<ProductData[]> {
  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, slug,
      brands(id, name),
      product_variants(id, price, sale_price, stock_quantity, volume_ml),
      product_images(image_url, is_main)
    `
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) return [];
  return (data || []).map((p: any) => {
    const sorted = p.product_variants.sort(
      (a: any, b: any) => (a.sale_price || a.price) - (b.sale_price || b.price)
    );
    const first = sorted[0] || {};

    // Handle null brands properly
    const brand = p.brands
      ? { id: p.brands.id, name: p.brands.name }
      : { id: null, name: "Unknown" };

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: brand,
      images: p.product_images,
      price: first.price,
      sale_price: first.sale_price,
      variants: p.product_variants,
    };
  });
}

async function getBestSellersProducts(): Promise<ProductData[]> {
  const supabase = await createServerComponentClient();
  const { data, error } = await supabase.rpc("get_best_selling_products", {
    p_limit: 8,
  });
  if (error) return [];
  return (data as any[]).map((item) => ({
    id: item.product_id,
    name: item.product_name,
    slug: item.product_slug,
    brand: { id: item.brand_id, name: item.brand_name },
    images: [{ image_url: item.image_url, is_main: true }],
    price: item.price,
    sale_price: item.sale_price,
    variants: [
      {
        id: item.variant_id,
        price: item.price,
        sale_price: item.sale_price,
        stock_quantity: item.stock_quantity,
      },
    ],
  }));
}

async function getBrandsData(): Promise<Brand[]> {
  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from("brands")
    .select("id, name, logo_url, description, created_at, updated_at")
    .order("name", { ascending: true });
  if (error) return [];
  return data || [];
}

async function getFeaturedCategoryProducts(
  categoryId: number
): Promise<ProductData[]> {
  if (!categoryId) return [];
  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      `
      id, price, sale_price, stock_quantity, volume_ml,
      products!inner(id, name, slug, deleted_at, brands(id,name), product_images(image_url,is_main), product_categories!inner(category_id))
    `
    )
    .eq("products.product_categories.category_id", categoryId)
    .is("products.deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) return [];
  const productsMap = new Map<number, ProductData>();
  (data as any[]).forEach((v) => {
    const pr = v.products;
    const existing = productsMap.get(pr.id);
    const variant = {
      id: v.id,
      volume_ml: v.volume_ml,
      price: v.price,
      sale_price: v.sale_price,
      stock_quantity: v.stock_quantity,
    };
    if (existing) {
      existing.variants?.push(variant);
    } else {
      // Handle null brands properly
      const brand = pr.brands
        ? { id: pr.brands.id, name: pr.brands.name }
        : { id: null, name: "Unknown" };

      productsMap.set(pr.id, {
        id: pr.id,
        name: pr.name,
        slug: pr.slug,
<<<<<<< HEAD
        brand: brand,
=======
        brand: pr.brands ? { id: pr.brands.id, name: pr.brands.name } : null,
>>>>>>> 967dd70 (feat: thanh toan thanh cong)
        images: pr.product_images,
        price: v.price,
        sale_price: v.sale_price,
        variants: [variant],
      });
    }
  });
  return Array.from(productsMap.values());
}

export default async function HomePage() {
  const [
    banners,
    featuredCategories,
    brands,
    onSale,
    newArrivals,
    bestSellers,
  ] = await Promise.all([
    getBanners(),
    getFeaturedCategories(),
    getBrandsData(),
    getOnSaleProducts(),
    getNewArrivalsProducts(),
    getBestSellersProducts(),
  ]);
  const initialCategoryProducts =
    featuredCategories.length > 0
      ? await getFeaturedCategoryProducts(featuredCategories[0].id)
      : [];
  return (
    <div className="flex flex-col pb-16">
      <HeroBanner banners={banners} />
      <div className="container px-4 md:px-6 mx-auto space-y-16 md:space-y-24 mt-10 md:mt-16">
        <BrandsSection initialData={brands} />
        <OnSaleSection initialData={onSale} />
        <FeaturedCategoriesSection
          categories={featuredCategories}
          initialProducts={initialCategoryProducts}
        />
        <NewArrivalsSection initialData={newArrivals} />
        <BestSellersSection initialData={bestSellers} />
      </div>
    </div>
  );
}
