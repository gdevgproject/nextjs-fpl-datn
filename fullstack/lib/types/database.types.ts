export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      addresses: {
        Row: {
          id: number
          user_id: string | null
          recipient_name: string
          recipient_phone: string
          province_city: string
          district: string
          ward: string
          street_address: string
          postal_code: string | null
          is_default: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          recipient_name: string
          recipient_phone: string
          province_city: string
          district: string
          ward: string
          street_address: string
          postal_code?: string | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          recipient_name?: string
          recipient_phone?: string
          province_city?: string
          district?: string
          ward?: string
          street_address?: string
          postal_code?: string | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string | null
          updated_at: string | null
          role: string | null
        }
        Insert: {
          id: string
          display_name?: string | null
          phone_number?: string | null
          gender?: string | null
          birth_date?: string | null
          avatar_url?: string | null
          default_address_id?: number | null
          created_at?: string | null
          updated_at?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          display_name?: string | null
          phone_number?: string | null
          gender?: string | null
          birth_date?: string | null
          avatar_url?: string | null
          default_address_id?: number | null
          created_at?: string | null
          updated_at?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_address_id_fkey"
            columns: ["default_address_id"]
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_carts: {
        Row: {
          id: number
          user_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_carts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      // Thêm các bảng khác nếu cần
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_user_purchased_product: {
        Args: {
          p_product_id: number
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

