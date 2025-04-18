export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          created_at: string
          district: string
          id: number
          is_default: boolean
          postal_code: string | null
          province_city: string
          recipient_name: string
          recipient_phone: string
          street_address: string
          updated_at: string
          user_id: string
          ward: string
        }
        Insert: {
          created_at?: string
          district: string
          id?: number
          is_default?: boolean
          postal_code?: string | null
          province_city: string
          recipient_name: string
          recipient_phone: string
          street_address: string
          updated_at?: string
          user_id: string
          ward: string
        }
        Update: {
          created_at?: string
          district?: string
          id?: number
          is_default?: boolean
          postal_code?: string | null
          province_city?: string
          recipient_name?: string
          recipient_phone?: string
          street_address?: string
          updated_at?: string
          user_id?: string
          ward?: string
        }
        Relationships: []
      }
      admin_activity_log: {
        Row: {
          activity_type: string
          admin_user_id: string | null
          description: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: number
          timestamp: string
        }
        Insert: {
          activity_type: string
          admin_user_id?: string | null
          description?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: number
          timestamp?: string
        }
        Update: {
          activity_type?: string
          admin_user_id?: string | null
          description?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: number
          timestamp?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          display_order: number
          end_date: string | null
          id: number
          image_url: string
          is_active: boolean
          link_url: string | null
          start_date: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          end_date?: string | null
          id?: number
          image_url: string
          is_active?: boolean
          link_url?: string | null
          start_date?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          end_date?: string | null
          id?: number
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          start_date?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          description: string | null
          id: number
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: number
          created_at: string
          id: number
          quantity: number
          updated_at: string
          variant_id: number
        }
        Insert: {
          cart_id: number
          created_at?: string
          id?: number
          quantity: number
          updated_at?: string
          variant_id: number
        }
        Update: {
          cart_id?: number
          created_at?: string
          id?: number
          quantity?: number
          updated_at?: string
          variant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "shopping_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: number
          image_url: string | null
          is_featured: boolean
          name: string
          parent_category_id: number | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: number
          image_url?: string | null
          is_featured?: boolean
          name: string
          parent_category_id?: number | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: number
          image_url?: string | null
          is_featured?: boolean
          name?: string
          parent_category_id?: number | null
          slug?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      concentrations: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_percentage: number | null
          end_date: string | null
          id: number
          is_active: boolean
          max_discount_amount: number | null
          max_uses: number | null
          min_order_value: number | null
          remaining_uses: number | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          end_date?: string | null
          id?: number
          is_active?: boolean
          max_discount_amount?: number | null
          max_uses?: number | null
          min_order_value?: number | null
          remaining_uses?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          end_date?: string | null
          id?: number
          is_active?: boolean
          max_discount_amount?: number | null
          max_uses?: number | null
          min_order_value?: number | null
          remaining_uses?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      genders: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          change_amount: number
          created_at: string
          id: number
          order_id: number | null
          reason: string
          stock_after_change: number
          timestamp: string
          updated_at: string
          updated_by: string | null
          variant_id: number
        }
        Insert: {
          change_amount: number
          created_at?: string
          id?: number
          order_id?: number | null
          reason: string
          stock_after_change: number
          timestamp?: string
          updated_at?: string
          updated_by?: string | null
          variant_id: number
        }
        Update: {
          change_amount?: number
          created_at?: string
          id?: number
          order_id?: number | null
          reason?: string
          stock_after_change?: number
          timestamp?: string
          updated_at?: string
          updated_by?: string | null
          variant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: number
          order_id: number
          product_name: string
          quantity: number
          unit_price_at_order: number
          updated_at: string
          variant_id: number
          variant_volume_ml: number
        }
        Insert: {
          created_at?: string
          id?: number
          order_id: number
          product_name: string
          quantity: number
          unit_price_at_order: number
          updated_at?: string
          variant_id: number
          variant_volume_ml: number
        }
        Update: {
          created_at?: string
          id?: number
          order_id?: number
          product_name?: string
          quantity?: number
          unit_price_at_order?: number
          updated_at?: string
          variant_id?: number
          variant_volume_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_statuses: {
        Row: {
          description: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          access_token: string
          assigned_shipper_id: string | null
          cancellation_reason: string | null
          cancelled_by: string | null
          cancelled_by_user_id: string | null
          completed_at: string | null
          created_at: string
          delivery_failure_reason: string | null
          delivery_failure_timestamp: string | null
          delivery_notes: string | null
          discount_amount: number | null
          discount_id: number | null
          district: string
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: number
          order_date: string
          order_status_id: number | null
          payment_method_id: number | null
          payment_status: string
          province_city: string
          recipient_name: string
          recipient_phone: string
          shipping_fee: number | null
          street_address: string
          subtotal_amount: number
          total_amount: number
          updated_at: string
          user_id: string | null
          ward: string
        }
        Insert: {
          access_token?: string
          assigned_shipper_id?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          cancelled_by_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          delivery_failure_reason?: string | null
          delivery_failure_timestamp?: string | null
          delivery_notes?: string | null
          discount_amount?: number | null
          discount_id?: number | null
          district: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: number
          order_date?: string
          order_status_id?: number | null
          payment_method_id?: number | null
          payment_status?: string
          province_city: string
          recipient_name: string
          recipient_phone: string
          shipping_fee?: number | null
          street_address: string
          subtotal_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string | null
          ward: string
        }
        Update: {
          access_token?: string
          assigned_shipper_id?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          cancelled_by_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          delivery_failure_reason?: string | null
          delivery_failure_timestamp?: string | null
          delivery_notes?: string | null
          discount_amount?: number | null
          discount_id?: number | null
          district?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: number
          order_date?: string
          order_status_id?: number | null
          payment_method_id?: number | null
          payment_status?: string
          province_city?: string
          recipient_name?: string
          recipient_phone?: string
          shipping_fee?: number | null
          street_address?: string
          subtotal_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string | null
          ward?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_order_status_id_fkey"
            columns: ["order_status_id"]
            isOneToOne: false
            referencedRelation: "order_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          description: string | null
          id: number
          is_active: boolean
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          is_active?: boolean
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: number
          order_id: number
          payment_date: string
          payment_details: Json | null
          payment_method_id: number | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: number
          order_id: number
          payment_date?: string
          payment_details?: Json | null
          payment_method_id?: number | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: number
          order_id?: number
          payment_date?: string
          payment_details?: Json | null
          payment_method_id?: number | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      perfume_types: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          category_id: number
          id: number
          product_id: number
        }
        Insert: {
          category_id: number
          id?: number
          product_id: number
        }
        Update: {
          category_id?: number
          id?: number
          product_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: number
          image_url: string
          is_main: boolean
          product_id: number
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: number
          image_url: string
          is_main?: boolean
          product_id: number
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: number
          image_url?: string
          is_main?: boolean
          product_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ingredients: {
        Row: {
          id: number
          ingredient_id: number
          product_id: number
          scent_type: string
        }
        Insert: {
          id?: number
          ingredient_id: number
          product_id: number
          scent_type: string
        }
        Update: {
          id?: number
          ingredient_id?: number
          product_id?: number
          scent_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_label_assignments: {
        Row: {
          id: number
          label_id: number
          product_id: number
          valid_until: string | null
        }
        Insert: {
          id?: number
          label_id: number
          product_id: number
          valid_until?: string | null
        }
        Update: {
          id?: number
          label_id?: number
          product_id?: number
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_label_assignments_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "product_labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_label_assignments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_labels: {
        Row: {
          color_code: string | null
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          color_code?: string | null
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: number
          price: number
          product_id: number
          sale_price: number | null
          sku: string | null
          stock_quantity: number
          updated_at: string
          volume_ml: number
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          price: number
          product_id: number
          sale_price?: number | null
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
          volume_ml: number
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          price?: number
          product_id?: number
          sale_price?: number | null
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
          volume_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: number | null
          concentration_id: number | null
          created_at: string
          deleted_at: string | null
          fts: unknown | null
          gender_id: number | null
          id: number
          long_description: string | null
          longevity: string | null
          name: string
          origin_country: string | null
          perfume_type_id: number | null
          product_code: string | null
          release_year: number | null
          short_description: string | null
          sillage: string | null
          slug: string | null
          style: string | null
          updated_at: string
        }
        Insert: {
          brand_id?: number | null
          concentration_id?: number | null
          created_at?: string
          deleted_at?: string | null
          fts?: unknown | null
          gender_id?: number | null
          id?: number
          long_description?: string | null
          longevity?: string | null
          name: string
          origin_country?: string | null
          perfume_type_id?: number | null
          product_code?: string | null
          release_year?: number | null
          short_description?: string | null
          sillage?: string | null
          slug?: string | null
          style?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: number | null
          concentration_id?: number | null
          created_at?: string
          deleted_at?: string | null
          fts?: unknown | null
          gender_id?: number | null
          id?: number
          long_description?: string | null
          longevity?: string | null
          name?: string
          origin_country?: string | null
          perfume_type_id?: number | null
          product_code?: string | null
          release_year?: number | null
          short_description?: string | null
          sillage?: string | null
          slug?: string | null
          style?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_concentration_id_fkey"
            columns: ["concentration_id"]
            isOneToOne: false
            referencedRelation: "concentrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_gender_id_fkey"
            columns: ["gender_id"]
            isOneToOne: false
            referencedRelation: "genders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_perfume_type_id_fkey"
            columns: ["perfume_type_id"]
            isOneToOne: false
            referencedRelation: "perfume_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          default_address_id: number | null
          display_name: string | null
          gender: string | null
          id: string
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          default_address_id?: number | null
          display_name?: string | null
          gender?: string | null
          id: string
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          default_address_id?: number | null
          display_name?: string | null
          gender?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_address_id_fkey"
            columns: ["default_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      review_replies: {
        Row: {
          created_at: string
          id: number
          reply_text: string
          review_id: number
          staff_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          reply_text: string
          review_id: number
          staff_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          reply_text?: string
          review_id?: number
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          comment: string | null
          created_at: string
          id: number
          is_approved: boolean
          order_item_id: number | null
          product_id: number
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          comment?: string | null
          created_at?: string
          id?: number
          is_approved?: boolean
          order_item_id?: number | null
          product_id: number
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          comment?: string | null
          created_at?: string
          id?: number
          is_approved?: boolean
          order_item_id?: number | null
          product_id?: number
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      scents: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_settings: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          default_shipping_fee: number
          facebook_url: string | null
          id: number
          instagram_url: string | null
          messenger_url: string | null
          order_confirmation_sender_email: string | null
          privacy_policy_text: string | null
          refund_policy_text: string | null
          shipping_policy_text: string | null
          shop_logo_url: string | null
          shop_name: string
          terms_conditions_text: string | null
          tiktok_url: string | null
          updated_at: string
          youtube_url: string | null
          zalo_url: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_shipping_fee?: number
          facebook_url?: string | null
          id?: number
          instagram_url?: string | null
          messenger_url?: string | null
          order_confirmation_sender_email?: string | null
          privacy_policy_text?: string | null
          refund_policy_text?: string | null
          shipping_policy_text?: string | null
          shop_logo_url?: string | null
          shop_name: string
          terms_conditions_text?: string | null
          tiktok_url?: string | null
          updated_at?: string
          youtube_url?: string | null
          zalo_url?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_shipping_fee?: number
          facebook_url?: string | null
          id?: number
          instagram_url?: string | null
          messenger_url?: string | null
          order_confirmation_sender_email?: string | null
          privacy_policy_text?: string | null
          refund_policy_text?: string | null
          shipping_policy_text?: string | null
          shop_logo_url?: string | null
          shop_name?: string
          terms_conditions_text?: string | null
          tiktok_url?: string | null
          updated_at?: string
          youtube_url?: string | null
          zalo_url?: string | null
        }
        Relationships: []
      }
      shopping_carts: {
        Row: {
          created_at: string
          id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          added_at: string
          id: number
          product_id: number
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: number
          product_id: number
          user_id: string
        }
        Update: {
          added_at?: string
          id?: number
          product_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_stock: {
        Args: {
          p_variant_id: number
          p_change_amount: number
          p_reason: string
        }
        Returns: number
      }
      approve_review: {
        Args: { p_review_id: number }
        Returns: undefined
      }
      cancel_order_by_admin: {
        Args: { p_order_id: number; p_reason: string }
        Returns: undefined
      }
      cancel_order_by_user: {
        Args: { p_order_id: number; p_reason: string }
        Returns: undefined
      }
      confirm_bank_transfer_payment: {
        Args: { p_order_id: number; p_transaction_details?: Json }
        Returns: undefined
      }
      confirm_cod_payment_by_shipper: {
        Args: { p_order_id: number }
        Returns: undefined
      }
      filter_products: {
        Args: {
          p_filters?: Json
          p_page?: number
          p_page_size?: number
          p_sort_by?: string
          p_sort_order?: string
        }
        Returns: {
          product_id: number
          product_name: string
          product_slug: string
          short_description: string
          brand_id: number
          brand_name: string
          main_image_url: string
          min_price: number
          max_price: number
          min_sale_price: number
          display_price: number
          is_on_sale: boolean
          is_in_stock: boolean
          created_at: string
          total_count: number
        }[]
      }
      generate_slug: {
        Args: { name_input: string }
        Returns: string
      }
      get_auth_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_best_selling_products: {
        Args: { p_limit?: number }
        Returns: {
          product_id: number
          product_name: string
          product_slug: string
          brand_name: string
          image_url: string
          total_sold: number
        }[]
      }
      get_homepage_on_sale_products_with_stock: {
        Args: { p_limit?: number }
        Returns: {
          product_id: number
          product_name: string
          product_slug: string
          brand_name: string
          main_image_url: string
          display_price: number
          original_price_high: number
          is_generally_in_stock: boolean
        }[]
      }
      get_monthly_revenue: {
        Args: { p_start_date: string; p_end_date: string }
        Returns: {
          report_month: string
          total_revenue: number
          order_count: number
        }[]
      }
      get_order_details_by_token: {
        Args: { p_token: string }
        Returns: Json
      }
      get_plp_filter_options: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_top_selling_products_report: {
        Args: { p_limit?: number; p_start_date?: string; p_end_date?: string }
        Returns: {
          product_id: number
          product_name: string
          product_code: string
          brand_name: string
          total_quantity_sold: number
          total_revenue_generated: number
        }[]
      }
      has_user_purchased_product: {
        Args: { p_product_id: number }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_shipper: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_order_completed_by_user: {
        Args: { p_order_id: number }
        Returns: undefined
      }
      record_delivery_failure_by_shipper: {
        Args: { p_order_id: number; p_reason: string }
        Returns: undefined
      }
      reply_to_review: {
        Args: { p_review_id: number; p_reply_text: string }
        Returns: number
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      update_order_status_by_shipper: {
        Args: { p_order_id: number; p_new_status_name: string }
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
