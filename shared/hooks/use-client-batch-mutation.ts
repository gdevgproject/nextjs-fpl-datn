import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";
import type { TableName, TableRow, TableInsert } from "@/shared/types/hooks";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { type SupabaseClient, PostgrestError } from "@supabase/supabase-js";

// Explicitly type the client
const supabase: SupabaseClient<Database> = getSupabaseBrowserClient();

/** Type definition for batch mutation actions */
type BatchMutationAction = "insert" | "update" | "delete" | "upsert";

/** Input variables for the batch mutation hook with improved typing */
interface BatchMutationVariables<T extends TableName, TItem = unknown> {
  action: BatchMutationAction;
  items: TItem[];
  /** Column(s) to match on for update/upsert/delete operations */
  matchColumn?: keyof TableRow<T> | Array<keyof TableRow<T>>;
}

/** Options for configuring the batch mutation */
interface BatchMutationOptions<
  T extends TableName,
  TData,
  TError = PostgrestError,
  TItem = unknown,
  TVariables extends BatchMutationVariables<T, TItem> = BatchMutationVariables<
    T,
    TItem
  >
> {
  /** NOTE: Default optimistic updates NOT provided for batch. Implement custom logic if needed. */
  onOptimisticUpdate?: (
    queryKey: QueryKey,
    variables: TVariables,
    queryClient: QueryClient
  ) => void | Promise<void>;
  invalidateQueries?: QueryKey[];
  /** Additional options for the underlying `useMutation` hook. */
  mutationOptions?: Omit<
    UseMutationOptions<TData, TError, TVariables, unknown>,
    "mutationFn" | "onMutate"
  >;
}

/**
 * Base hook for performing BATCH mutations on a Supabase table using TanStack Query.
 */
export function useClientBatchMutation<
  T extends TableName,
  TData = TableRow<T>[] | null, // Default return type
  TError = PostgrestError,
  TItem = TableInsert<T>, // Default item type to Insert for upsert/insert
  TVariables extends BatchMutationVariables<T, TItem> = BatchMutationVariables<
    T,
    TItem
  >
>(
  table: T,
  options?: BatchMutationOptions<T, TData, TError, TItem, TVariables>
) {
  const queryClient = useQueryClient();
  const tableListQueryKey: QueryKey = [table, "list"]; // Example default key

  return useMutation<TData, TError, TVariables, unknown>({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const { action, items, matchColumn = "id" } = variables;

      if (!Array.isArray(items) || items.length === 0) {
        console.warn(
          `Batch mutation (${action} on ${table}) called with empty items.`
        );
        return null as TData; // Or appropriate empty value
      }

      // We need to use type assertion here because the Supabase types don't perfectly match
      // our generic approach. This is a necessary compromise for the flexibility of the API.
      let response: { data: unknown; error: PostgrestError | null };
      const pkArray = Array.isArray(matchColumn)
        ? matchColumn.map((key) => String(key))
        : [String(matchColumn)];
      const onConflictConstraint = pkArray.join(",");

      try {
        switch (action) {
          case "insert":
            response = await supabase
              .from(table)
              .insert(items as Record<string, unknown>[])
              .select();
            break;
          case "update":
            // Workaround using upsert
            console.warn(`Batch 'update' on '${table}' using 'upsert'.`);
            response = await supabase
              .from(table)
              .upsert(items as Record<string, unknown>[], {
                onConflict: onConflictConstraint,
                ignoreDuplicates: false,
              })
              .select();
            break;
          case "delete":
            if (pkArray.length > 1) {
              throw new Error(
                `Batch delete with composite keys (${onConflictConstraint}) not directly supported.`
              );
            }
            const key = pkArray[0];
            const valuesToDelete = items.map((item) => {
              // We need to use Record<string, unknown> here because TItem is generic
              // and we can't guarantee it has the key property
              const typedItem = item as Record<string, unknown>;
              if (
                !(key in typedItem) ||
                typedItem[key] === undefined ||
                typedItem[key] === null
              ) {
                throw new Error(
                  `Item missing primary key '${key}' for batch delete.`
                );
              }
              return typedItem[key];
            });

            // Cast to array of primitives for the 'in' operation
            response = await supabase
              .from(table)
              .delete()
              .in(key, valuesToDelete as (string | number | boolean)[]);
            // Delete often returns null data
            return null as TData;
          case "upsert":
            response = await supabase
              .from(table)
              .upsert(items as Record<string, unknown>[], {
                onConflict: onConflictConstraint,
                ignoreDuplicates: false,
              })
              .select();
            break;
          default:
            throw new Error(`Unsupported batch action: ${action}`);
        }

        if (response.error) {
          throw response.error;
        }
        return response.data as TData;
      } catch (error) {
        console.error(
          `Supabase batch ${action} error on table ${table}:`,
          error
        );
        throw error instanceof PostgrestError
          ? error
          : new Error(String(error));
      }
    },
    onMutate: async (variables: TVariables) => {
      if (options?.onOptimisticUpdate) {
        // Ensure queries are cancelled before applying optimistic updates
        await queryClient.cancelQueries({ queryKey: tableListQueryKey }); // Example key
        await options.onOptimisticUpdate(
          tableListQueryKey,
          variables,
          queryClient
        );
      }
      // Return undefined context as no default optimistic update is done
      return undefined;
    },
    onError: (error: TError, variables: TVariables, context: unknown) => {
      console.error(
        `Batch mutation error (${variables.action} on ${table}):`,
        error
      );
      // No default rollback needed as no default optimistic update. Rely on invalidation.
      if (options?.mutationOptions?.onError) {
        options.mutationOptions.onError(error, variables, context);
      }
    },
    onSuccess: (data: TData, variables: TVariables, context: unknown) => {
      const queriesToInvalidate = options?.invalidateQueries ?? [
        tableListQueryKey,
      ];
      console.log(
        `Batch mutation success (${variables.action} on ${table}). Invalidating keys:`,
        queriesToInvalidate
      );
      queriesToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      if (options?.mutationOptions?.onSuccess) {
        options.mutationOptions.onSuccess(data, variables, context);
      }
    },
    onSettled: (data, error, variables, context) => {
      if (options?.mutationOptions?.onSettled) {
        options.mutationOptions.onSettled(data, error, variables, context);
      }
    },
    ...options?.mutationOptions,
  });
}
