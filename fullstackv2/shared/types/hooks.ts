import { Database } from "@/shared/types";
import { PostgrestError } from "@supabase/supabase-js";

// Define public schema reference for convenience
export type PublicSchema = Database["public"];

// Core table type helpers
export type Tables = PublicSchema["Tables"];
export type TableName = keyof Tables;

// Row, insert, and update types for tables
export type TableRow<T extends TableName> = Tables[T]["Row"];
export type TableInsert<T extends TableName> = Tables[T]["Insert"];
export type TableUpdate<T extends TableName> = Tables[T]["Update"];

// Function related types
export type Functions = PublicSchema["Functions"];
export type FunctionName = keyof Functions;
export type FunctionArgs<F extends FunctionName> = Functions[F]["Args"];
export type FunctionReturns<F extends FunctionName> = Functions[F]["Returns"];

// Storage bucket types
export type StorageBuckets = keyof Database["storage"]["buckets"];

// Common error type
export type ApiError = PostgrestError;
