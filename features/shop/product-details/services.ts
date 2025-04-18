import { createServerComponentClient } from "@/lib/supabase/server";
import type { ProductDetail } from "./types";

// Service: Lấy chi tiết sản phẩm chuẩn hóa theo types
export async function getProductDetailBySlug(
  slug: string
): Promise<ProductDetail | null> {
  const supabase = await createServerComponentClient();

  // 1. Lấy dữ liệu sản phẩm chính
  const { data: productData, error: productError } = await supabase
    .from("products")
    .select(
      `
      *,
      brands:brand_id(*),
      genders:gender_id(*),
      perfume_types:perfume_type_id(*),
      concentrations:concentration_id(*),
      product_images(*),
      product_variants(*),
      product_ingredients(scent_type, ingredients:ingredient_id(*))
    `
    )
    .eq("slug", slug)
    .single();

  if (productError || !productData) return null;

  // 2. Chuẩn hóa note pyramid
  const notePyramid = {
    top: (productData.product_ingredients || [])
      .filter((item: any) => item.scent_type === "top")
      .map((item: any) => item.ingredients),
    middle: (productData.product_ingredients || [])
      .filter((item: any) => item.scent_type === "middle")
      .map((item: any) => item.ingredients),
    base: (productData.product_ingredients || [])
      .filter((item: any) => item.scent_type === "base")
      .map((item: any) => item.ingredients),
  };

  // 3. Lấy reviews và profile liên quan
  const { data: reviewsRaw } = await supabase
    .from("reviews")
    .select(`*, review_replies(*)`)
    .eq("product_id", productData.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const fetchedReviewsRaw = reviewsRaw || [];
  const userIdsToFetch = new Set<string>();
  const staffIdsToFetch = new Set<string>();
  fetchedReviewsRaw.forEach((review: any) => {
    if (review.user_id) userIdsToFetch.add(review.user_id);
    if (review.review_replies && Array.isArray(review.review_replies)) {
      review.review_replies.forEach((reply: any) => {
        if (reply.user_id) staffIdsToFetch.add(reply.user_id);
      });
    }
  });
  const allProfileIds = [...userIdsToFetch, ...staffIdsToFetch];
  const profilesMap = new Map<
    string,
    { display_name: string | null; avatar_url: string | null }
  >();
  if (allProfileIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", allProfileIds);
    (profilesData || []).forEach((profile: any) => {
      profilesMap.set(profile.id, {
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
      });
    });
  }
  const reviews = fetchedReviewsRaw.map((review: any) => {
    const reviewerProfile = review.user_id
      ? profilesMap.get(review.user_id)
      : null;
    const repliesWithProfiles =
      review.review_replies && Array.isArray(review.review_replies)
        ? review.review_replies.map((reply: any) => {
            const replierProfile = reply.user_id
              ? profilesMap.get(reply.user_id)
              : null;
            return { ...reply, replier_profile: replierProfile };
          })
        : [];
    return {
      ...review,
      reviewer_profile: reviewerProfile,
      review_replies: repliesWithProfiles,
    };
  });

  // 4. Chuẩn hóa dữ liệu trả về
  return {
    id: productData.id,
    name: productData.name,
    slug: productData.slug,
    short_description: productData.short_description,
    long_description: productData.long_description,
    origin_country: productData.origin_country,
    style: productData.style,
    longevity: productData.longevity,
    sillage: productData.sillage,
    release_year: productData.release_year,
    brand: productData.brands,
    variants: productData.product_variants,
    images: productData.product_images,
    gender: productData.genders,
    concentration: productData.concentrations,
    perfumeType: productData.perfume_types,
    notePyramid,
    reviews,
  };
}
