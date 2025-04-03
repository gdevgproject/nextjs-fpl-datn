import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types/shared.types"

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brand:brands(*),
      images:product_images(*)
    `)
    .eq("is_featured", true)
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(8)

  if (error) {
    console.error("Error fetching featured products:", error)
    return []
  }

  return data as Product[]
}

