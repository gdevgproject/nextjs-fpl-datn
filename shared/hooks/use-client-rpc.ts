// FILE: src/shared/hooks/use-client-rpc.ts
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";
import type {
  FunctionName,
  FunctionArgs,
  FunctionReturns,
} from "@/shared/types/hooks";
import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from "@tanstack/react-query";
import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";

// Explicitly type the client
const supabase: SupabaseClient<Database> = getSupabaseBrowserClient();

/**
 * Base hook for calling Supabase RPC functions (PostgreSQL functions)
 * that primarily fetch data (like a GET request) using TanStack Query.
 *
 * @template TFunc The name of the RPC function from your Database schema.
 * @template TData The expected type of data returned by the RPC function.
 * @template TError The type of error expected (defaults to PostgrestError).
 * @template TParams The type of the parameters object passed to the RPC function.
 *
 * @param rpcName The name of the RPC function.
 * @param params Optional parameters object for the RPC function.
 * @param options Additional options for the underlying `useQuery` hook.
 *
 * @returns The result object from `useQuery`.
 */
export function useClientRpcQuery<
  TFunc extends FunctionName = any,
  // Infer parameter type from Database schema if available
  TParams extends FunctionArgs<TFunc> = FunctionArgs<TFunc>,
  // Infer return type from Database schema if available
  TData = FunctionReturns<TFunc>,
  TError = PostgrestError
>(
  rpcName: TFunc,
  params?: TParams,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
) {
  // Create a stable query key, including parameters if they exist
  const queryKey: QueryKey = params ? [rpcName, params] : [rpcName];

  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      // Call the RPC function
      const { data, error } = await supabase.rpc(
        String(rpcName), // Convert to string to avoid implicit symbol-to-string conversion
        params as Record<string, unknown>
      );

      if (error) {
        console.error(`Supabase RPC (${rpcName}) query error:`, error);
        throw error; // Re-throw for TanStack Query
      }
      // Cast the returned data to the expected TData type
      return data as TData;
    },
    ...options, // Spread the rest of the useQuery options
  });
}

/**
 * Base hook for calling Supabase RPC functions (PostgreSQL functions)
 * that primarily perform mutations (like a POST/PUT/DELETE request) using TanStack Query.
 *
 * @template TFunc The name of the RPC function from your Database schema.
 * @template TData The expected type of data returned by the RPC function.
 * @template TError The type of error expected (defaults to PostgrestError).
 * @template TParams The type of the parameters object passed to the RPC function.
 *
 * @param rpcName The name of the RPC function.
 * @param options Additional options for the underlying `useMutation` hook.
 *
 * @returns The result object from `useMutation`.
 */
export function useClientRpcMutation<
  TFunc extends FunctionName = any,
  // Infer parameter type from Database schema if available
  TData = FunctionReturns<TFunc>,
  TParams extends FunctionArgs<TFunc> = FunctionArgs<TFunc>,
  TError = PostgrestError
>(
  rpcName: TFunc,
  options?: Omit<
    UseMutationOptions<TData, TError, TParams, unknown>,
    "mutationFn"
  >
) {
  return useMutation<TData, TError, TParams, unknown>({
    mutationFn: async (params: TParams) => {
      // Call the RPC function
      const { data, error } = await supabase.rpc(
        String(rpcName), // Convert to string to avoid implicit symbol-to-string conversion
        params as Record<string, unknown>
      );

      if (error) {
        console.error(`Supabase RPC (${rpcName}) mutation error:`, error);
        throw error; // Re-throw for TanStack Query
      }

      // Cast the returned data to the expected TData type
      return data as TData;
    },
    ...options, // Spread the rest of the useMutation options
  });
}
