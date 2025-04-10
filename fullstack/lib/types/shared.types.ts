export interface ShopSettings {
  id: number;
  shop_name: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  shipping_fee: number;
  free_shipping_threshold: number | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  about_us: string | null;
  privacy_policy: string | null;
  terms_of_service: string | null;
  return_policy: string | null;
  faq: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole = "admin" | "staff" | "authenticated" | "anon";
