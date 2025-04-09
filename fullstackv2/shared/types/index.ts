export type Database = {
  public: {
    Tables: {
      // Define your tables here based on db.txt
      // This is a placeholder structure, you should replace it with your actual database schema
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          // Add other fields from your schema
        };
        Insert: {
          id?: string;
          email: string;
          // Add other insertable fields
        };
        Update: {
          id?: string;
          email?: string;
          // Add other updatable fields
        };
      };
      // Add other tables from your schema
    };
    Views: {
      // Define your views here
    };
    Functions: {
      // Define your functions here
      // Example:
      // my_function: {
      //   Args: { param1: string };
      //   Returns: { id: string; name: string }[];
      // };
    };
    Enums: {
      // Define your enums here
    };
  };
  storage: {
    buckets: {
      // Define your storage buckets here
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
