import { createClient } from "@/shared/supabase/client";
import {
  Database,
  PublicSchema,
  TableName,
  TableRow,
  TableInsert,
} from "@/shared/types/index";
import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { SupabaseClient, PostgrestError } from "@supabase/supabase-js";

// Explicitly type the client
const supabase: SupabaseClient<Database> = createClient();

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
  mutationOptions?: Omit<
    UseMutationOptions<TData, TError, TVariables>,
    "mutationFn" | "onMutate" | "onError" | "onSuccess"
  >;
}

/**
 * Base hook for performing BATCH mutations on a Supabase table using TanStack Query.
 *
 * **Important:** Default optimistic updates are NOT implemented due to complexity.
 * Batch 'update' uses 'upsert' internally. Batch 'delete' with composite keys is not supported directly.
 *
 * @template T TableName - The name of the table.
 * @template TData Expected return data type.
 * @template TError Expected error type (default PostgrestError).
 * @template TItem Type of a single item in the batch array.
 * @template TVariables Type of the variables object passed to the mutation.
 *
 * @param table The name of the Supabase table.
 * @param options Configuration options for the mutation.
 * @returns The result object from `useMutation`.
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

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const { action, items, matchColumn = "id" } = variables;

      if (!Array.isArray(items) || items.length === 0) {
        console.warn(
          `Batch mutation (${action} on ${table}) called with empty items.`
        );
        return null as TData; // Or appropriate empty value
      }

      let response: any;
      const pkArray = Array.isArray(matchColumn)
        ? matchColumn.map((key) => String(key))
        : [String(matchColumn)];
      const onConflictConstraint = pkArray.join(",");

      try {
        switch (action) {
          case "insert":
            response = await supabase
              .from(table)
              .insert(items as any)
              .select();
            break;
          case "update":
            // Workaround using upsert
            console.warn(`Batch 'update' on '${table}' using 'upsert'.`);
            response = await supabase
              .from(table)
              .upsert(items as any, {
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
            response = await supabase
              .from(table)
              .delete()
              .in(key, valuesToDelete);
            // Delete often returns null data
            return null as TData;
          case "upsert":
            response = await supabase
              .from(table)
              .upsert(items as any, {
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
    onError: (error: TError, variables: TVariables, context) => {
      console.error(
        `Batch mutation error (${variables.action} on ${table}):`,
        error
      );
      // No default rollback needed as no default optimistic update. Rely on invalidation.
      options?.mutationOptions?.onError?.(error, variables, context);
    },
    onSuccess: (data: TData, variables: TVariables, context) => {
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
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      options?.mutationOptions?.onSettled?.(data, error, variables, context);
    },
    ...options?.mutationOptions,
  });
}
