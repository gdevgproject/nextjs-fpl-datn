/**
 * Complete Database Type Definition based on Supabase schema
 */
export interface Database {
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
      // Add definitions for other tables (simplified example)
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
      // Define the other tables as needed based on db.txt
    };
    Views: Record<
      string,
      {
        Row: Record<string, unknown>;
        Relationships: {
          foreignKeyName: string;
          columns: string[];
          referencedRelation: string;
          referencedColumns: string[];
        }[];
      }
    >;
    Functions: {
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
      // Add other functions from db.txt
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: Record<
      string,
      {
        [key: string]: string;
      }
    >;
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
}

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

// Add missing types needed by the Supabase client
export interface GenericView {
  Row: Record<string, unknown>;
  Relationships: {
    foreignKeyName: string;
    columns: string[];
    referencedRelation: string;
    referencedColumns: string[];
  }[];
}

// Create specific types needed for hooks
export type FilterValue = string | number | boolean | null;

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
  | "is";
