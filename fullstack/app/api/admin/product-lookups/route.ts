import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();

    // Fetch all lookup data in parallel
    const [
      brandsResponse,
      categoriesResponse,
      gendersResponse,
      perfumeTypesResponse,
      concentrationsResponse,
      productLabelsResponse,
      scentsResponse,
      ingredientsResponse,
    ] = await Promise.all([
      supabase.from("brands").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
      supabase.from("genders").select("*").order("id"),
      supabase.from("perfume_types").select("*").order("name"),
      supabase.from("concentrations").select("*").order("name"),
      supabase.from("product_labels").select("*").order("name"),
      supabase.from("scents").select("*").order("name"),
      supabase.from("ingredients").select("*").order("name"),
    ]);

    // Handle errors
    if (brandsResponse.error) throw new Error(brandsResponse.error.message);
    if (categoriesResponse.error)
      throw new Error(categoriesResponse.error.message);
    if (gendersResponse.error) throw new Error(gendersResponse.error.message);
    if (perfumeTypesResponse.error)
      throw new Error(perfumeTypesResponse.error.message);
    if (concentrationsResponse.error)
      throw new Error(concentrationsResponse.error.message);
    if (productLabelsResponse.error)
      throw new Error(productLabelsResponse.error.message);
    if (scentsResponse.error) throw new Error(scentsResponse.error.message);
    if (ingredientsResponse.error)
      throw new Error(ingredientsResponse.error.message);

    // Return combined data
    return NextResponse.json({
      brands: brandsResponse.data || [],
      categories: categoriesResponse.data || [],
      genders: gendersResponse.data || [],
      perfumeTypes: perfumeTypesResponse.data || [],
      concentrations: concentrationsResponse.data || [],
      productLabels: productLabelsResponse.data || [],
      scents: scentsResponse.data || [],
      ingredients: ingredientsResponse.data || [],
    });
  } catch (error) {
    console.error("Error fetching product lookups:", error);
    return NextResponse.json(
      { error: "Failed to fetch product lookups" },
      { status: 500 }
    );
  }
}
