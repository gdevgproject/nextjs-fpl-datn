// Product detail types for product detail page

export interface Brand {
  id: number;
  name: string;
  logo_url: string | null;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  volume_ml: number;
  price: number;
  sale_price: number | null;
  sku: string;
  stock_quantity: number;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  is_main: boolean;
  display_order: number;
}

export interface Ingredient {
  id: number;
  name: string;
  description?: string | null;
}

export interface NotePyramid {
  top: Ingredient[];
  middle: Ingredient[];
  base: Ingredient[];
}

export interface ProductReviewReply {
  id: number;
  review_id: number;
  user_id: string;
  reply_text: string;
  created_at: string;
  replier_profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ProductReview {
  id: number;
  product_id: number;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  review_replies: ProductReviewReply[];
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  long_description: string | null;
  origin_country: string | null;
  style: string | null;
  longevity: string | null;
  sillage: string | null;
  release_year: number | null;
  brand: Brand;
  variants: ProductVariant[];
  images: ProductImage[];
  gender: { id: number; name: string } | null;
  concentration: { id: number; name: string } | null;
  perfumeType: { id: number; name: string } | null;
  notePyramid: NotePyramid;
  reviews: ProductReview[];
}
