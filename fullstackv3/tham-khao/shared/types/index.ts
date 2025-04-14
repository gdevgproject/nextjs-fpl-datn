/**
 * Complete Database Type Definition based on Supabase schema
 * Generated from db.txt
 */
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
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
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
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      brands: {
        Row: {
          id: number
          name: string
          description: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      genders: {
        Row: {
          id: number
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      perfume_types: {
        Row: {
          id: number
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      concentrations: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          image_url: string | null
          is_featured: boolean
          display_order: number
          parent_category_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug?: string
          description?: string | null
          image_url?: string | null
          is_featured?: boolean
          display_order?: number
          parent_category_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          is_featured?: boolean
          display_order?: number
          parent_category_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      products: {
        Row: {
          id: number
          name: string
          slug: string
          product_code: string | null
          short_description: string | null
          long_description: string | null
          brand_id: number | null
          gender_id: number | null
          perfume_type_id: number | null
          concentration_id: number | null
          origin_country: string | null
          release_year: number | null
          style: string | null
          sillage: string | null
          longevity: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: number
          name: string
          slug?: string
          product_code?: string | null
          short_description?: string | null
          long_description?: string | null
          brand_id?: number | null
          gender_id?: number | null
          perfume_type_id?: number | null
          concentration_id?: number | null
          origin_country?: string | null
          release_year?: number | null
          style?: string | null
          sillage?: string | null
          longevity?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          product_code?: string | null
          short_description?: string | null
          long_description?: string | null
          brand_id?: number | null
          gender_id?: number | null
          perfume_type_id?: number | null
          concentration_id?: number | null
          origin_country?: string | null
          release_year?: number | null
          style?: string | null
          sillage?: string | null
          longevity?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      scents: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          id: number
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
          created_at: string
          updated_at: string
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
          created_at?: string
          updated_at?: string
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
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      product_ingredients: {
        Row: {
          id: number
          product_id: number
          ingredient_id: number
          scent_type: string
        }
        Insert: {
          id?: number
          product_id: number
          ingredient_id: number
          scent_type: string
        }
        Update: {
          id?: number
          product_id?: number
          ingredient_id?: number
          scent_type?: string
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          product_id: number
          image_url: string
          alt_text?: string | null
          is_main?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          image_url?: string
          alt_text?: string | null
          is_main?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      product_categories: {
        Row: {
          id: number
          product_id: number
          category_id: number
        }
        Insert: {
          id?: number
          product_id: number
          category_id: number
        }
        Update: {
          id?: number
          product_id?: number
          category_id?: number
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      product_labels: {
        Row: {
          id: number
          name: string
          color_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          color_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          color_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_label_assignments: {
        Row: {
          id: number
          product_id: number
          label_id: number
          valid_until: string | null
        }
        Insert: {
          id?: number
          product_id: number
          label_id: number
          valid_until?: string | null
        }
        Update: {
          id?: number
          product_id?: number
          label_id?: number
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      discounts: {
        Row: {
          id: number
          code: string
          description: string | null
          start_date: string | null
          end_date: string | null
          max_uses: number | null
          remaining_uses: number | null
          min_order_value: number | null
          max_discount_amount: number | null
          discount_percentage: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          code: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          max_uses?: number | null
          remaining_uses?: number | null
          min_order_value?: number | null
          max_discount_amount?: number | null
          discount_percentage?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          code?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          max_uses?: number | null
          remaining_uses?: number | null
          min_order_value?: number | null
          max_discount_amount?: number | null
          discount_percentage?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      cart_items: {
        Row: {
          id: number
          cart_id: number
          variant_id: number
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          cart_id: number
          variant_id: number
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          cart_id?: number
          variant_id?: number
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      order_statuses: {
        Row: {
          id: number
          name: string
          description: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          id: number
          name: string
          description: string | null
          is_active: boolean
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          is_active?: boolean
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: number
          access_token: string
          user_id: string | null
          assigned_shipper_id: string | null
          guest_name: string | null
          guest_email: string | null
          guest_phone: string | null
          recipient_name: string
          recipient_phone: string
          province_city: string
          district: string
          ward: string
          street_address: string
          order_date: string
          delivery_notes: string | null
          payment_method_id: number | null
          payment_status: string
          order_status_id: number | null
          discount_id: number | null
          subtotal_amount: number
          discount_amount: number
          shipping_fee: number
          total_amount: number
          cancellation_reason: string | null
          cancelled_by: string | null
          cancelled_by_user_id: string | null
          delivery_failure_reason: string | null
          delivery_failure_timestamp: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          access_token?: string
          user_id?: string | null
          assigned_shipper_id?: string | null
          guest_name?: string | null
          guest_email?: string | null
          guest_phone?: string | null
          recipient_name: string
          recipient_phone: string
          province_city: string
          district: string
          ward: string
          street_address: string
          order_date?: string
          delivery_notes?: string | null
          payment_method_id?: number | null
          payment_status?: string
          order_status_id?: number | null
          discount_id?: number | null
          subtotal_amount?: number
          discount_amount?: number
          shipping_fee?: number
          total_amount?: number
          cancellation_reason?: string | null
          cancelled_by?: string | null
          cancelled_by_user_id?: string | null
          delivery_failure_reason?: string | null
          delivery_failure_timestamp?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          access_token?: string
          user_id?: string | null
          assigned_shipper_id?: string | null
          guest_name?: string | null
          guest_email?: string | null
          guest_phone?: string | null
          recipient_name?: string
          recipient_phone?: string
          province_city?: string
          district?: string
          ward?: string
          street_address?: string
          order_date?: string
          delivery_notes?: string | null
          payment_method_id?: number | null
          payment_status?: string
          order_status_id?: number | null
          discount_id?: number | null
          subtotal_amount?: number
          discount_amount?: number
          shipping_fee?: number
          total_amount?: number
          cancellation_reason?: string | null
          cancelled_by?: string | null
          cancelled_by_user_id?: string | null
          delivery_failure_reason?: string | null
          delivery_failure_timestamp?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          variant_id: number
          product_name: string
          variant_volume_ml: number
          quantity: number
          unit_price_at_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          order_id: number
          variant_id: number
          product_name: string
          variant_volume_ml: number
          quantity: number
          unit_price_at_order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          variant_id?: number
          product_name?: string
          variant_volume_ml?: number
          quantity?: number
          unit_price_at_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      payments: {
        Row: {
          id: number
          order_id: number
          payment_date: string
          payment_method_id: number | null
          transaction_id: string | null
          amount: number
          status: string
          payment_details: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          order_id: number
          payment_date?: string
          payment_method_id?: number | null
          transaction_id?: string | null
          amount: number
          status?: string
          payment_details?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          payment_date?: string
          payment_method_id?: number | null
          transaction_id?: string | null
          amount?: number
          status?: string
          payment_details?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      inventory: {
        Row: {
          id: number
          variant_id: number
          change_amount: number
          reason: string
          order_id: number | null
          stock_after_change: number
          updated_by: string | null
          timestamp: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          variant_id: number
          change_amount: number
          reason: string
          order_id?: number | null
          stock_after_change: number
          updated_by?: string | null
          timestamp?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          variant_id?: number
          change_amount?: number
          reason?: string
          order_id?: number | null
          stock_after_change?: number
          updated_by?: string | null
          timestamp?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      reviews: {
        Row: {
          id: number
          product_id: number
          user_id: string
          order_item_id: number | null
          rating: number
          comment: string | null
          is_approved: boolean
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          product_id: number
          user_id: string
          order_item_id?: number | null
          rating: number
          comment?: string | null
          is_approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          user_id?: string
          order_item_id?: number | null
          rating?: number
          comment?: string | null
          is_approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      review_replies: {
        Row: {
          id: number
          review_id: number
          staff_id: string
          reply_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          review_id: number
          staff_id: string
          reply_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          review_id?: number
          staff_id?: string
          reply_text?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      wishlists: {
        Row: {
          id: number
          user_id: string
          product_id: number
          added_at: string
        }
        Insert: {
          id?: number
          user_id: string
          product_id: number
          added_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          product_id?: number
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      admin_activity_log: {
        Row: {
          id: number
          admin_user_id: string | null
          activity_type: string
          description: string | null
          entity_type: string | null
          entity_id: string | null
          details: Record<string, unknown> | null
          timestamp: string
        }
        Insert: {
          id?: number
          admin_user_id?: string | null
          activity_type: string
          description?: string | null
          entity_type?: string | null
          entity_id?: string | null
          details?: Record<string, unknown> | null
          timestamp?: string
        }
        Update: {
          id?: number
          admin_user_id?: string | null
          activity_type?: string
          description?: string | null
          entity_type?: string | null
          entity_id?: string | null
          details?: Record<string, unknown> | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: string
            columns: string[]
            referencedRelation: string
            referencedColumns: string[]
          },
        ]
      }
      banners: {
        Row: {
          id: number
          title: string
          subtitle: string | null
          image_url: string
          link_url: string | null
          is_active: boolean
          display_order: number
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          subtitle?: string | null
          image_url: string
          link_url?: string | null
          is_active?: boolean
          display_order?: number
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          subtitle?: string | null
          image_url?: string
          link_url?: string | null
          is_active?: boolean
          display_order?: number
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_settings: {
        Row: {
          id: number
          shop_name: string
          shop_logo_url: string | null
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          facebook_url: string | null
          messenger_url: string | null
          zalo_url: string | null
          instagram_url: string | null
          tiktok_url: string | null
          youtube_url: string | null
          refund_policy_text: string | null
          shipping_policy_text: string | null
          privacy_policy_text: string | null
          terms_conditions_text: string | null
          default_shipping_fee: number
          order_confirmation_sender_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          shop_name: string
          shop_logo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          facebook_url?: string | null
          messenger_url?: string | null
          zalo_url?: string | null
          instagram_url?: string | null
          tiktok_url?: string | null
          youtube_url?: string | null
          refund_policy_text?: string | null
          shipping_policy_text?: string | null
          privacy_policy_text?: string | null
          terms_conditions_text?: string | null
          default_shipping_fee?: number
          order_confirmation_sender_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          shop_name?: string
          shop_logo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          facebook_url?: string | null
          messenger_url?: string | null
          zalo_url?: string | null
          instagram_url?: string | null
          tiktok_url?: string | null
          youtube_url?: string | null
          refund_policy_text?: string | null
          shipping_policy_text?: string | null
          privacy_policy_text?: string | null
          terms_conditions_text?: string | null
          default_shipping_fee?: number
          order_confirmation_sender_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<
      string,
      {
        Row: Record<string, unknown>
        Relationships: {
          foreignKeyName: string
          columns: string[]
          referencedRelation: string
          referencedColumns: string[]
        }[]
      }
    >
    Functions: {
      approve_review: {
        Args: {
          p_review_id: number
        }
        Returns: undefined
      }
      reply_to_review: {
        Args: {
          p_review_id: number
          p_reply_text: string
        }
        Returns: number
      }
      get_best_selling_products: {
        Args: {
          p_limit?: number
        }
        Returns: {
          product_id: number
          product_name: string
          product_slug: string
          brand_name: string
          image_url: string
          total_sold: number
        }[]
      }
      get_monthly_revenue: {
        Args: {
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          report_month: string
          total_revenue: number
          order_count: number
        }[]
      }
      get_top_selling_products_report: {
        Args: {
          p_limit?: number
          p_start_date?: string
          p_end_date?: string
        }
        Returns: {
          product_id: number
          product_name: string
          product_code: string
          brand_name: string
          total_quantity_sold: number
          total_revenue_generated: number
        }[]
      }
      get_plp_filter_options: {
        Args: Record<string, never>
        Returns: Record<string, unknown>
      }
      get_order_details_by_token: {
        Args: {
          p_token: string
        }
        Returns: Record<string, unknown>
      }
      cancel_order_by_user: {
        Args: {
          p_order_id: number
          p_reason: string
        }
        Returns: undefined
      }
      cancel_order_by_admin: {
        Args: {
          p_order_id: number
          p_reason: string
        }
        Returns: undefined
      }
      update_order_status_by_shipper: {
        Args: {
          p_order_id: number
          p_new_status_name: string
        }
        Returns: undefined
      }
      confirm_cod_payment_by_shipper: {
        Args: {
          p_order_id: number
        }
        Returns: undefined
      }
      record_delivery_failure_by_shipper: {
        Args: {
          p_order_id: number
          p_reason: string
        }
        Returns: undefined
      }
      mark_order_completed_by_user: {
        Args: {
          p_order_id: number
        }
        Returns: undefined
      }
      confirm_bank_transfer_payment: {
        Args: {
          p_order_id: number
          p_transaction_details?: Record<string, unknown>
        }
        Returns: undefined
      }
      adjust_stock: {
        Args: {
          p_variant_id: number
          p_change_amount: number
          p_reason: string
        }
        Returns: number
      }
    }
    Enums: Record<
      string,
      {
        [key: string]: string
      }
    >
  }
  storage: {
    buckets: {
      avatars: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: Array<{
          foreignKeyName: string
          columns: string[]
          referencedRelation: string
          referencedColumns: string[]
        }>
      }
      logos: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: Array<{
          foreignKeyName: string
          columns: string[]
          referencedRelation: string
          referencedColumns: string[]
        }>
      }
      products: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: Array<{
          foreignKeyName: string
          columns: string[]
          referencedRelation: string
          referencedColumns: string[]
        }>
      }
      banners: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: Array<{
          foreignKeyName: string
          columns: string[]
          referencedRelation: string
          referencedColumns: string[]
        }>
      }
      categories: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: Array<{
          foreignKeyName: string
          columns: string[]
          referencedRelation: string
          referencedColumns: string[]
        }>
      }
    }
  }
}

// Export utility types derived from the Database type
export type PublicSchema = Database["public"]
export type Tables = PublicSchema["Tables"]
export type TableName = keyof Tables

// Get row types for tables
export type TableRow<T extends TableName> = Tables[T]["Row"]
export type TableInsert<T extends TableName> = Tables[T]["Insert"]
export type TableUpdate<T extends TableName> = Tables[T]["Update"]

// Export other useful types for working with the database
export type StorageBucketName = keyof Database["storage"]["buckets"] & string
export type FunctionName = keyof PublicSchema["Functions"]

// Helper type for extracting function args and returns
export type FunctionArgs<T extends FunctionName> = PublicSchema["Functions"][T] extends { Args: infer A }
  ? A
  : Record<string, never>

export type FunctionReturns<T extends FunctionName> = PublicSchema["Functions"][T] extends { Returns: infer R }
  ? R
  : unknown

// Add missing types needed by the Supabase client
export interface GenericView {
  Row: Record<string, unknown>
  Relationships: {
    foreignKeyName: string
    columns: string[]
    referencedRelation: string
    referencedColumns: string[]
  }[]
}

// Create specific types needed for hooks
export type FilterValue = string | number | boolean | null
export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "like"
  | "ilike"
  | "in"
  | "is"
  | "contains"
  | "containedBy"
  | "rangeGt"
  | "rangeGte"
  | "rangeLt"
  | "rangeLte"
  | "rangeAdjacent"
  | "overlaps"
  | "textSearch"
