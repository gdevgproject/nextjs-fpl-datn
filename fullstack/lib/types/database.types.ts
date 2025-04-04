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
      products: {
        Row: {
          id: number
          name: string
          slug: string
          short_description: string | null
          brand_id: number | null
          gender_id: number | null
          perfume_type_id: number | null
          concentration_id: number | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: number
          name: string
          slug: string
          short_description?: string | null
          brand_id?: number | null
          gender_id?: number | null
          perfume_type_id?: number | null
          concentration_id?: number | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          short_description?: string | null
          brand_id?: number | null
          gender_id?: number | null
          perfume_type_id?: number | null
          concentration_id?: number | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_concentration_id_fkey"
            columns: ["concentration_id"]
            referencedRelation: "concentrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_gender_id_fkey"
            columns: ["gender_id"]
            referencedRelation: "genders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_perfume_type_id_fkey"
            columns: ["perfume_type_id"]
            referencedRelation: "perfume_types"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          id: number
          name: string
          description: string | null
          logo_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          is_featured: boolean
          display_order: number
          parent_category_id: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          is_featured?: boolean
          display_order?: number
          parent_category_id?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          is_featured?: boolean
          display_order?: number
          parent_category_id?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          id: number
          product_id: number
          volume_ml: number
          price: number
          sale_price: number | null
          sku: string | null
          stock_quantity: number
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: number
          product_id: number
          volume_ml: number
          price: number
          sale_price?: number | null
          sku?: string | null
          stock_quantity?: number
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: number
          product_id?: number
          volume_ml?: number
          price?: number
          sale_price?: number | null
          sku?: string | null
          stock_quantity?: number
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          id: number
          product_id: number
          image_url: string
          alt_text: string | null
          is_main: boolean
          display_order: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          product_id: number
          image_url: string
          alt_text?: string | null
          is_main?: boolean
          display_order?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          product_id?: number
          image_url?: string
          alt_text?: string | null
          is_main?: boolean
          display_order?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          id: number
          product_id: number
          category_id: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          product_id: number
          category_id: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          product_id?: number
          category_id?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      genders: {
        Row: {
          id: number
          name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      perfume_types: {
        Row: {
          id: number
          name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      concentrations: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_scents: {
        Row: {
          id: number
          product_id: number
          scent_id: number
          scent_type: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          product_id: number
          scent_id: number
          scent_type: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          product_id?: number
          scent_id?: number
          scent_type?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_scents_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_scents_scent_id_fkey"
            columns: ["scent_id"]
            referencedRelation: "scents"
            referencedColumns: ["id"]
          },
        ]
      }
      scents: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_ingredients: {
        Row: {
          id: number
          product_id: number
          ingredient_id: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          product_id: number
          ingredient_id: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          product_id?: number
          ingredient_id?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_ingredients_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: number
          product_id: number
          user_id: string
          rating: number
          review_text: string | null
          is_approved: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          product_id: number
          user_id: string
          rating: number
          review_text?: string | null
          is_approved?: boolean
          created_at: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          product_id?: number
          user_id?: string
          rating?: number
          review_text?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      review_replies: {
        Row: {
          id: number
          review_id: number
          reply_text: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          review_id: number
          reply_text: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          review_id?: number
          reply_text?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
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
      get_plp_filter_options: {
        Args: Record<PropertyKey, never>
        Returns: {
          brands: Array<{
            id: number
            name: string
            product_count: number
          }>
          categories: Array<{
            id: number
            name: string
            slug: string
            product_count: number
          }>
          genders: Array<{
            id: number
            name: string
            product_count: number
          }>
          perfumeTypes: Array<{
            id: number
            name: string
            product_count: number
          }>
          concentrations: Array<{
            id: number
            name: string
            product_count: number
          }>
          priceRanges: Array<{
            min_price: number
            max_price: number
            product_count: number
          }>
        }
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

