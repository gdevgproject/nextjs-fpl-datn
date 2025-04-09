// Database definition based on the complete schema in db.txt
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
        };
        Update: {
          id?: string;
          email?: string;
        };
        Relationships: [
          {
            foreignKeyName: string;
            columns: string[];
            referencedRelation: string;
            referencedColumns: string[];
          }
        ];
      };
      addresses: {
        Row: {
          id: number;
          user_id: string;
          recipient_name: string;
          recipient_phone: string;
          province_city: string;
          district: string;
          ward: string;
          street_address: string;
          postal_code: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          recipient_name: string;
          recipient_phone: string;
          province_city: string;
          district: string;
          ward: string;
          street_address: string;
          postal_code?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          recipient_name?: string;
          recipient_phone?: string;
          province_city?: string;
          district?: string;
          ward?: string;
          street_address?: string;
          postal_code?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: string;
            columns: string[];
            referencedRelation: string;
            referencedColumns: string[];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          phone_number: string | null;
          gender: string | null;
          birth_date: string | null;
          avatar_url: string | null;
          default_address_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          phone_number?: string | null;
          gender?: string | null;
          birth_date?: string | null;
          avatar_url?: string | null;
          default_address_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          phone_number?: string | null;
          gender?: string | null;
          birth_date?: string | null;
          avatar_url?: string | null;
          default_address_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: string;
            columns: string[];
            referencedRelation: string;
            referencedColumns: string[];
          }
        ];
      };
      brands: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: number;
          name: string;
          slug: string;
          product_code: string | null;
          short_description: string | null;
          long_description: string | null;
          brand_id: number | null;
          gender_id: number | null;
          perfume_type_id: number | null;
          concentration_id: number | null;
          origin_country: string | null;
          release_year: number | null;
          style: string | null;
          sillage: string | null;
          longevity: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          slug?: string;
          product_code?: string | null;
          short_description?: string | null;
          long_description?: string | null;
          brand_id?: number | null;
          gender_id?: number | null;
          perfume_type_id?: number | null;
          concentration_id?: number | null;
          origin_country?: string | null;
          release_year?: number | null;
          style?: string | null;
          sillage?: string | null;
          longevity?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
          product_code?: string | null;
          short_description?: string | null;
          long_description?: string | null;
          brand_id?: number | null;
          gender_id?: number | null;
          perfume_type_id?: number | null;
          concentration_id?: number | null;
          origin_country?: string | null;
          release_year?: number | null;
          style?: string | null;
          sillage?: string | null;
          longevity?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: string;
            columns: string[];
            referencedRelation: string;
            referencedColumns: string[];
          }
        ];
      };
      product_variants: {
        Row: {
          id: number;
          product_id: number;
          volume_ml: number;
          price: number;
          sale_price: number | null;
          sku: string | null;
          stock_quantity: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          product_id: number;
          volume_ml: number;
          price: number;
          sale_price?: number | null;
          sku?: string | null;
          stock_quantity?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: number;
          product_id?: number;
          volume_ml?: number;
          price?: number;
          sale_price?: number | null;
          sku?: string | null;
          stock_quantity?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: string;
            columns: string[];
            referencedRelation: string;
            referencedColumns: string[];
          }
        ];
      };
      // Add definitions for other tables from the database schema
      // Including: categories, orders, order_items, etc.
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Relationships: {
          foreignKeyName: string;
          columns: string[];
          referencedRelation: string;
          referencedColumns: string[];
        }[];
      };
    };
    Functions: {
      // RPC functions from db.txt
      approve_review: {
        Args: {
          p_review_id: number;
        };
        Returns: undefined;
      };
      reply_to_review: {
        Args: {
          p_review_id: number;
          p_reply_text: string;
        };
        Returns: number;
      };
      get_best_selling_products: {
        Args: {
          p_limit?: number;
        };
        Returns: {
          product_id: number;
          product_name: string;
          product_slug: string;
          brand_name: string;
          image_url: string;
          total_sold: number;
        }[];
      };
      get_monthly_revenue: {
        Args: {
          p_start_date: string;
          p_end_date: string;
        };
        Returns: {
          report_month: string;
          total_revenue: number;
          order_count: number;
        }[];
      };
      get_top_selling_products_report: {
        Args: {
          p_limit?: number;
          p_start_date?: string;
          p_end_date?: string;
        };
        Returns: {
          product_id: number;
          product_name: string;
          product_code: string;
          brand_name: string;
          total_quantity_sold: number;
          total_revenue_generated: number;
        }[];
      };
      get_plp_filter_options: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      get_order_details_by_token: {
        Args: {
          p_token: string;
        };
        Returns: unknown;
      };
      cancel_order_by_user: {
        Args: {
          p_order_id: number;
          p_reason: string;
        };
        Returns: undefined;
      };
      cancel_order_by_admin: {
        Args: {
          p_order_id: number;
          p_reason: string;
        };
        Returns: undefined;
      };
      update_order_status_by_shipper: {
        Args: {
          p_order_id: number;
          p_new_status_name: string;
        };
        Returns: undefined;
      };
      confirm_cod_payment_by_shipper: {
        Args: {
          p_order_id: number;
        };
        Returns: undefined;
      };
      record_delivery_failure_by_shipper: {
        Args: {
          p_order_id: number;
          p_reason: string;
        };
        Returns: undefined;
      };
      mark_order_completed_by_user: {
        Args: {
          p_order_id: number;
        };
        Returns: undefined;
      };
      confirm_bank_transfer_payment: {
        Args: {
          p_order_id: number;
          p_transaction_details?: unknown;
        };
        Returns: undefined;
      };
      adjust_stock: {
        Args: {
          p_variant_id: number;
          p_change_amount: number;
          p_reason: string;
        };
        Returns: number;
      };
    };
    Enums: {
      // No custom enums in the database
    };
  };
  storage: {
    buckets: {
      avatars: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      logos: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      products: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      banners: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      categories: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
    };
  };
};

// Export utility types derived from the Database type
export type PublicSchema = Database["public"];
export type Tables = PublicSchema["Tables"];
export type TableName = keyof Tables;

// Get row types for tables
export type TableRow<T extends TableName> = Tables[T]["Row"];
export type TableInsert<T extends TableName> = Tables[T]["Insert"];
export type TableUpdate<T extends TableName> = Tables[T]["Update"];

// Export other useful types for working with the database
export type StorageBucketName = keyof Database["storage"]["buckets"] & string;
export type FunctionName = keyof PublicSchema["Functions"];

// Helper type for extracting function args and returns
export type FunctionArgs<T extends FunctionName> =
  PublicSchema["Functions"][T] extends { Args: infer A } ? A : undefined;

export type FunctionReturns<T extends FunctionName> =
  PublicSchema["Functions"][T] extends { Returns: infer R } ? R : unknown;

// Define GenericView type to match Supabase requirements
export interface GenericView {
  Row: Record<string, unknown>;
  Relationships: {
    foreignKeyName: string;
    columns: string[];
    referencedRelation: string;
    referencedColumns: string[];
  }[];
}
