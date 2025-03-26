export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      addresses: {
        Row: {
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
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          recipient_name: string
          recipient_phone: string
          province_city: string
          district: string
          ward: string
          street_address: string
          postal_code?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          recipient_name?: string
          recipient_phone?: string
          province_city?: string
          district?: string
          ward?: string
          street_address?: string
          postal_code?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          phone_number: string | null
          gender: string | null
          birth_date: string | null
          avatar_url: string | null
          default_address_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
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
        Update: {
          id?: string
          display_name?: string | null
          phone_number?: string | null
          gender?: string | null
          birth_date?: string | null
          avatar_url?: string | null
          default_address_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      shopping_carts: {
        Row: {
          id: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]

