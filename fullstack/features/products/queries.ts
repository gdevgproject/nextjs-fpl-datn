import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types/shared.types"

export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brand:brands(*),
      images:product_images(*)
    `)
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data as Product[]
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      brand:brands(*),
      images:product_images(*),
      categories:product_categories(categories(*))
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .is("deleted_at", null)
    .single()

  if (error) {
    console.error("Error fetching product by slug:", error)
    return null
  }

  return data as Product
}

