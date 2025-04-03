// Types liên quan đến user, profile, address
export interface Profile {
  id: string
  display_name: string | null
  phone_number: string | null
  gender: string | null
  birth_date: string | null
  avatar_url: string | null
  default_address_id: number | null
  created_at: string
  updated_at: string | null
  role: "admin" | "staff" | "authenticated" | null
}

export interface Address {
  id: number
  user_id: string
  recipient_name: string
  recipient_phone: string
  province_city: string
  district: string
  ward: string
  street_address: string
  postal_code: string | null
  is_default: boolean
  created_at: string
  updated_at: string | null
}

export interface ShoppingCart {
  id: number
  user_id: string
  created_at: string
  updated_at: string | null
}

