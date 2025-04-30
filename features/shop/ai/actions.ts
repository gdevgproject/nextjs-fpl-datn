"use server";

import {
  createServerComponentClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";
import type {
  ProductSearchParams,
  ProductSearchResult,
  AIProduct,
} from "./types";
import { revalidatePath } from "next/cache";

/**
 * Search for products based on a query string
 */
export async function searchProducts({
  query,
  limit = 5,
}: ProductSearchParams): Promise<ProductSearchResult> {
  const supabase = await createServerComponentClient();

  // Create a search query that looks for matches in product name, description, or brand name
  const {
    data: products,
    error,
    count,
  } = await supabase
    .from("products")
    .select(
      `
      id, 
      name, 
      slug, 
      short_description,
      brands!inner(name),
      product_variants!inner(price, sale_price, volume_ml),
      product_images!inner(image_url)
    `,
      { count: "exact" }
    )
    .or(
      `name.ilike.%${query}%, short_description.ilike.%${query}%, brands.name.ilike.%${query}%`
    )
    .is("deleted_at", null)
    .eq("product_images.is_main", true)
    .order("name")
    .limit(limit);

  if (error) {
    console.error("Error searching products:", error);
    throw new Error("Failed to search products");
  }

  // Transform the data to match the ProductRecommendation interface
  const recommendations =
    products?.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image_url: product.product_images[0]?.image_url || "",
      price: product.product_variants[0]?.price || 0,
      sale_price: product.product_variants[0]?.sale_price || null,
      brand_name: product.brands?.name || "",
    })) || [];

  return {
    products: recommendations,
    totalCount: count || 0,
  };
}

/**
 * Get detailed product information for AI context
 */
export async function getProductsForAIContext(
  limit = 20
): Promise<AIProduct[]> {
  const supabase = await createServiceRoleClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
      id, 
      name, 
      slug, 
      short_description,
      product_code,
      origin_country,
      release_year,
      style,
      sillage,
      longevity,
      brands(name, logo_url),
      genders(name),
      perfume_types(name),
      concentrations(name),
      product_variants(id, price, sale_price, volume_ml, stock_quantity, deleted_at),
      product_ingredients(
        ingredients(name),
        scent_type
      ),
      scents:product_ingredients(
        scent_type,
        ingredients(name)
      ),
      product_categories(
        categories(name)
      ),
      product_images(
        image_url, is_main
      )
    `
    )
    .is("deleted_at", null)
    .limit(limit);

  if (error) {
    console.error("Error fetching products for AI context:", error);
    throw new Error("Failed to fetch products for AI context");
  }

  return (
    products?.map((product: any) => {
      // Group scents by type (top, middle, base)
      const scentsByType: Record<string, string[]> = {};
      product.scents?.forEach((scent: any) => {
        const type = scent.scent_type;
        if (!scentsByType[type]) {
          scentsByType[type] = [];
        }
        scentsByType[type].push(scent.ingredients.name);
      });

      const scentsFormatted = Object.entries(scentsByType)
        .map(([type, notes]) => `${type} notes: ${notes.join(", ")}`)
        .join("; ");

      // Notes (kim tự tháp hương)
      const notes = Object.entries(scentsByType)
        .map(([type, notes]) => `${type}: ${notes.join(", ")}`)
        .join("; ");

      // Main image
      const mainImage =
        product.product_images?.find((img: any) => img.is_main === true) ||
        product.product_images?.[0];

      // Categories
      const categoryNames =
        product.product_categories
          ?.map((pc: any) => pc.categories?.name)
          .filter(Boolean) || [];

      // All valid variants
      const variants = (product.product_variants || [])
        .filter((v: any) => v.deleted_at === null || v.deleted_at === undefined)
        .map((v: any) => ({
          id: v.id,
          volume_ml: v.volume_ml,
          price: Number(v.price),
          sale_price: v.sale_price !== null ? Number(v.sale_price) : null,
          stock_quantity: v.stock_quantity,
        }));

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        short_description: product.short_description,
        description: product.short_description, // alias for compatibility
        brand_name: product.brands?.name || null,
        brand_logo_url: product.brands?.logo_url || null,
        gender_name: product.genders?.name || null,
        type: product.perfume_types?.name || null,
        concentration_name: product.concentrations?.name || null,
        price: product.product_variants?.[0]?.price || 0,
        sale_price: product.product_variants?.[0]?.sale_price || null,
        volume_ml: product.product_variants?.[0]?.volume_ml || 0,
        scents: [scentsFormatted],
        notes: notes,
        ingredients:
          product.product_ingredients?.map((pi: any) => pi.ingredients.name) ||
          [],
        release_year: product.release_year || null,
        origin_country: product.origin_country || null,
        style: product.style || null,
        sillage: product.sillage || null,
        longevity: product.longevity || null,
        product_code: product.product_code || null,
        category_names: categoryNames,
        main_image_url: mainImage?.image_url || null,
        image_url: mainImage?.image_url || null,
        variants: variants,
      };
    }) || []
  );
}

/**
 * Log chat interaction for analytics
 */
export async function logChatInteraction(
  userId: string | null,
  query: string,
  response: string
): Promise<void> {
  const supabase = await createServiceRoleClient();

  const { error } = await supabase.from("admin_activity_log").insert({
    admin_user_id: userId,
    activity_type: "ai_chat",
    description: "AI Chat Interaction",
    entity_type: "ai_chat",
    details: {
      query,
      response,
    },
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error("Error logging chat interaction:", error);
  }

  // Revalidate the path to ensure fresh data
  revalidatePath("/admin/settings/logs");
}
