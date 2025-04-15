import { createServerComponentClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import ProductImageGallery from "@/features/shop/product-details/components/product-image-gallery";
import ProductInfo from "@/features/shop/product-details/components/product-info";
import NotePyramid from "@/features/shop/product-details/components/note-pyramid";
import ProductDescription from "@/features/shop/product-details/components/product-description";
import ProductReviews from "@/features/shop/product-details/components/product-reviews";
import { Separator } from "@/components/ui/separator";

// Types for product data
interface ProductPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata(
  { params }: ProductPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại",
      description: "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.",
    };
  }

  return {
    title: `${product.name} | MyBeauty`,
    description:
      product.short_description ||
      product.description?.substring(0, 160) ||
      "Khám phá nước hoa cao cấp tại MyBeauty",
    openGraph: {
      images: product.product_images.find((img) => img.is_main)?.image_url
        ? [
            product.product_images.find((img) => img.is_main)
              ?.image_url as string,
          ]
        : [],
    },
  };
}

// Fetch product data by slug
async function fetchProductBySlug(slug: string) {
  const supabase = await createServerComponentClient();

  // --- Step 1: Fetch main product data ---
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
      product_variants(
        *,
        product_id
      ),
      product_ingredients(
        scent_type,
        ingredients:ingredient_id(*)
      )
    `
    )
    .eq("slug", slug)
    .single();

  if (productError || !productData) {
    console.error("Error fetching product:", productError);
    return null;
  }

  // --- Step 2: Fetch raw reviews and replies ---
  const { data: reviewsRaw, error: reviewsError } = await supabase
    .from("reviews")
    .select(
      `
      *,
      review_replies(*) // Only fetch raw replies, no profile join here
    `
    )
    .eq("product_id", productData.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (reviewsError) {
    console.error("Error fetching raw reviews:", reviewsError);
    // We can continue without reviews if needed
  }

  const fetchedReviewsRaw = reviewsRaw || [];

  // --- Step 3: Collect all profile IDs we need ---
  const userIdsToFetch = new Set<string>();
  const staffIdsToFetch = new Set<string>();

  fetchedReviewsRaw.forEach((review) => {
    if (review.user_id) userIdsToFetch.add(review.user_id);
    if (review.review_replies && Array.isArray(review.review_replies)) {
      review.review_replies.forEach((reply) => {
        if (reply.user_id) staffIdsToFetch.add(reply.user_id);
      });
    }
  });

  const allProfileIds = [...userIdsToFetch, ...staffIdsToFetch];

  // --- Step 4: Fetch all needed profiles in one query ---
  const profilesMap = new Map<
    string,
    { display_name: string | null; avatar_url: string | null }
  >();
  if (allProfileIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", allProfileIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      // Continue but profiles will be missing
    } else if (profilesData) {
      profilesData.forEach((profile) => {
        profilesMap.set(profile.id, {
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
        });
      });
    }
  }

  // --- Step 5: Combine the data ---
  const reviewsWithProfiles = fetchedReviewsRaw.map((review) => {
    const reviewerProfile = review.user_id
      ? profilesMap.get(review.user_id)
      : null;
    const repliesWithProfiles =
      review.review_replies && Array.isArray(review.review_replies)
        ? review.review_replies.map((reply) => {
            const replierProfile = reply.user_id
              ? profilesMap.get(reply.user_id)
              : null;
            return {
              ...reply,
              replier_profile: replierProfile, // Assign replier profile
            };
          })
        : [];

    return {
      ...review,
      reviewer_profile: reviewerProfile, // Assign reviewer profile
      review_replies: repliesWithProfiles, // Assign replies with profiles
    };
  });

  // --- Step 6: Return the final result ---
  return {
    ...productData,
    reviews: reviewsWithProfiles, // Return reviews with added profiles
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await fetchProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Organize note pyramid by tier
  const notePyramid = {
    top: product.product_ingredients
      .filter((item) => item.scent_type === "top")
      .map((item) => item.ingredients),
    middle: product.product_ingredients
      .filter((item) => item.scent_type === "middle")
      .map((item) => item.ingredients),
    base: product.product_ingredients
      .filter((item) => item.scent_type === "base")
      .map((item) => item.ingredients),
  };

  return (
    <div className="container py-8 px-4 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <ProductImageGallery images={product.product_images} />

        {/* Product Info */}
        <ProductInfo
          product={product}
          brand={product.brands}
          variants={product.product_variants}
          gender={product.genders}
          concentration={product.concentrations}
          perfumeType={product.perfume_types}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Note Pyramid */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Tháp hương</h2>
          <NotePyramid notePyramid={notePyramid} />
        </div>

        {/* Product Description */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Mô tả sản phẩm</h2>
          <ProductDescription product={product} />
        </div>
      </div>

      <Separator className="my-8" />

      {/* Product Reviews */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Đánh giá từ khách hàng</h2>
        <ProductReviews reviews={product.reviews} productId={product.id} />
      </div>
    </div>
  );
}
