// Types cho brands và accounts

/**
 * Brand entity
 */
export interface Brand {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Product count by brand ID
 */
export interface BrandProductCount {
  [brandId: number]: number;
}

/**
 * Brand filter options
 */
export interface BrandFilter {
  search?: string;
  sortBy?: "name_asc" | "name_desc" | "product_count";
}

// Profile type từ bảng profiles
export type Profile = {
  id: string; // user UUID từ Supabase Auth
  email?: string;
  display_name: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  role?: "user" | "admin" | string;
  created_at?: string;
  updated_at?: string | null;
  last_sign_in_at?: string | null;
  is_subscribed_to_newsletter?: boolean;
  address?: AddressInfo | null;
};

// Type cho địa chỉ
export type AddressInfo = {
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

// User type từ Supabase Auth
export type User = {
  id: string;
  email: string;
  email_confirmed_at?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string | null;
  role?: string;
  app_metadata?: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata?: {
    [key: string]: any;
  };
};

// Account type kết hợp User và Profile
export type Account = {
  user: User;
  profile: Profile;
};

// Type cho kết quả đăng nhập/đăng ký
export type AuthResult = {
  user: User | null;
  session: any | null;
  error?: string;
  code?: string;
};
