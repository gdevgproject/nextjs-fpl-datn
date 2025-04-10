import type { User } from "@supabase/supabase-js"

/**
 * User profile information from the profiles table
 */
export interface Profile {
  id: string
  display_name?: string | null
  phone_number?: string | null
  gender?: string | null
  birth_date?: string | null
  avatar_url?: string | null
  default_address_id?: number | null
  created_at?: string
  updated_at?: string
}

/**
 * User shipping/billing address from the addresses table
 */
export interface Address {
  id: number
  user_id: string
  recipient_name: string
  recipient_phone: string
  province_city: string
  district: string
  ward: string
  street_address: string
  postal_code?: string | null
  is_default: boolean
  created_at?: string
  updated_at?: string
}

/**
 * User authenticated state
 */
export interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  profile: Profile | null
  error: Error | null
}

/**
 * Account settings that can be updated
 */
export interface AccountSettings {
  display_name?: string
  avatar_url?: string
  phone_number?: string | null
  gender?: string | null
  birth_date?: string | null
}

/**
 * Address form values
 */
export interface AddressFormValues {
  recipient_name: string
  recipient_phone: string
  province_city: string
  district: string
  ward: string
  street_address: string
  postal_code?: string
  is_default?: boolean
}

