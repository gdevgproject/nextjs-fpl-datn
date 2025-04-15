export interface ShopSettings {
  id: number;
  shop_name: string;
  shop_logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  facebook_url?: string;
  messenger_url?: string;
  zalo_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  refund_policy_text?: string;
  shipping_policy_text?: string;
  privacy_policy_text?: string;
  terms_conditions_text?: string;
  default_shipping_fee?: number;
  order_confirmation_sender_email?: string;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = "admin" | "staff" | "authenticated" | "anon";
