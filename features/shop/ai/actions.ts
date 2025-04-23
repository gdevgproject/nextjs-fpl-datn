"use server"

import { createClient } from "@/shared/supabase/server"
import { createServiceRoleClient } from "@/shared/supabase/serviceRoleClient"
import type { ProductSearchParams, ProductSearchResult, AIProduct } from "./types"
import { revalidatePath } from "next/cache"

/**
 * Search for products based on a query string
 */
export async function searchProducts({ query, limit = 5 }: ProductSearchParams): Promise<ProductSearchResult> {
  const supabase = await createClient()

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
      { count: "exact" },
    )
    .or(`name.ilike.%${query}%, short_description.ilike.%${query}%, brands.name.ilike.%${query}%`)
    .is("deleted_at", null)
    .eq("product_images.is_main", true)
    .order("name")
    .limit(limit)

  if (error) {
    console.error("Error searching products:", error)
    throw new Error("Failed to search products")
  }

  // Transform the data to match the ProductRecommendation interface
  const recommendations =
    products?.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image_url: product.product_images[0]?.image_url || "",
      price: product.product_variants[0]?.price || 0,
      sale_price: product.product_variants[0]?.sale_price || null,
      brand_name: product.brands?.name || "",
    })) || []

  return {
    products: recommendations,
    totalCount: count || 0,
  }
}

/**
 * Get detailed product information for AI context
 */
export async function getProductsForAIContext(limit = 20): Promise<AIProduct[]> {
  const supabase = await createServiceRoleClient()

  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
      id, 
      name, 
      slug, 
      short_description,
      brands(name),
      genders(name),
      concentrations(name),
      product_variants(price, sale_price, volume_ml),
      product_ingredients(
        ingredients(name)
      ),
      scents:product_ingredients(
        scent_type,
        ingredients(name)
      )
    `,
    )
    .is("deleted_at", null)
    .limit(limit)

  if (error) {
    console.error("Error fetching products for AI context:", error)
    throw new Error("Failed to fetch products for AI context")
  }

  // Transform the data to match the AIProduct interface
  return (
    products?.map((product) => {
      // Group scents by type (top, middle, base)
      const scentsByType: Record<string, string[]> = {}
      product.scents?.forEach((scent: any) => {
        const type = scent.scent_type
        if (!scentsByType[type]) {
          scentsByType[type] = []
        }
        scentsByType[type].push(scent.ingredients.name)
      })

      // Format scents as strings like "top notes: bergamot, lemon; middle notes: jasmine, rose"
      const scentsFormatted = Object.entries(scentsByType)
        .map(([type, notes]) => `${type} notes: ${notes.join(", ")}`)
        .join("; ")

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        short_description: product.short_description,
        brand_name: product.brands?.name || null,
        gender_name: product.genders?.name || null,
        concentration_name: product.concentrations?.name || null,
        price: product.product_variants?.[0]?.price || 0,
        sale_price: product.product_variants?.[0]?.sale_price || null,
        volume_ml: product.product_variants?.[0]?.volume_ml || 0,
        scents: [scentsFormatted],
        ingredients: product.product_ingredients?.map((pi: any) => pi.ingredients.name) || [],
      }
    }) || []
  )
}

/**
 * Log chat interaction for analytics
 */
export async function logChatInteraction(userId: string | null, query: string, response: string): Promise<void> {
  const supabase = await createServiceRoleClient()

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
  })

  if (error) {
    console.error("Error logging chat interaction:", error)
  }

  // Revalidate the path to ensure fresh data
  revalidatePath("/admin/settings/logs")
}
