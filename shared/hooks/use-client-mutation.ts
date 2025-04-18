import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";
import type {
  TableName,
  TableRow,
  TableInsert,
  TableUpdate,
} from "@/shared/types/hooks";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { type SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import type { FetchHookResult } from "./use-client-fetch";

const supabase: SupabaseClient<Database> = getSupabaseBrowserClient();

/** Type definition for mutation actions */
type MutationAction = "insert" | "update" | "delete" | "upsert";

/** Base type for payload identification (e.g., using primary key) */
type MatchPayload<T extends TableName> = Partial<TableRow<T>>;

/**
 * Type for mutation variables, with stronger typing based on action.
 */
type MutationVariables<
  T extends TableName,
  TAction extends MutationAction
> = TAction extends "insert"
  ? TableInsert<T> | TableInsert<T>[]
  : TAction extends "update"
  ? MatchPayload<T> & TableUpdate<T>
  : TAction extends "delete"
  ? MatchPayload<T>
  : TAction extends "upsert"
  ? TableInsert<T> | TableInsert<T>[]
  : never;

/** Context for optimistic updates */
type MutationContext<T extends TableName> = {
  previousData?: FetchHookResult<TableRow<T>>;
  optimisticUpdateApplied?: boolean;
};

/**
 * Options for the mutation hook with corrected mutationOptions type
 */
type MutationHookOptions<
  T extends TableName,
  TAction extends MutationAction,
  TData = TableRow<T>[] | null,
  TError = PostgrestError
> = {
  /** Array of query keys to invalidate upon successful mutation. */
  invalidateQueries?: QueryKey[];
  /**
   * The primary key column name(s). Crucial for 'update' and 'delete' operations,
   * and for optimistic updates.
   */
  primaryKey: keyof TableRow<T> | Array<keyof TableRow<T>>;
  /**
   * Optional custom function for optimistic updates.
   * If provided, it overrides the default optimistic update behavior.
   */
  onOptimisticUpdate?: (
    variables: MutationVariables<T, TAction>,
    queryClient: QueryClient,
    queryKey: QueryKey
  ) => MutationContext<T> | void | Promise<MutationContext<T> | void>;
  /** Additional options for the underlying `useMutation` hook. */
  mutationOptions?: Omit<
    UseMutationOptions<
      TData,
      TError,
      MutationVariables<T, TAction>,
      MutationContext<T>
    >,
    "mutationFn" | "onMutate"
  >;
};

/**
 * Base hook for performing mutations (insert, update, delete, upsert) on a Supabase table
 * on the client-side using TanStack Query. Strongly typed.
 */
export function useClientMutation<
  T extends TableName,
  TAction extends MutationAction,
  TData = TableRow<T>[] | null,
  TError = PostgrestError
>(
  table: T,
  action: TAction,
  options: MutationHookOptions<T, TAction, TData, TError>
) {
  const queryClient = useQueryClient();
  const { primaryKey, invalidateQueries, onOptimisticUpdate, mutationOptions } =
    options;
  const tableListQueryKey: QueryKey = [table, "list"];

  return useMutation<
    TData,
    TError,
    MutationVariables<T, TAction>,
    MutationContext<T>
  >({
    mutationFn: async (payload) => {
      let response: { data: unknown; error: PostgrestError | null };

      try {
        switch (action) {
          case "insert":
            response = await supabase.from(table).insert(payload).select();
            break;
          case "update":
            const { match, data } = extractMatchAndData(payload, primaryKey);
            response = await supabase
              .from(table)
              .update(data)
              .match(match)
              .select();
            break;
          case "delete":
            const matchDelete = extractMatch(payload, primaryKey);
            response = await supabase.from(table).delete().match(matchDelete);
            break;
          case "upsert":
            const conflictConstraint = Array.isArray(primaryKey)
              ? primaryKey.join(",")
              : String(primaryKey);
            response = await supabase
              .from(table)
              .upsert(payload, {
                onConflict: conflictConstraint,
              })
              .select();
            break;
          default:
            throw new Error(`Unsupported mutation action: ${action}`);
        }

        if (response.error) {
          throw response.error;
        }

        if (action === "delete") {
          return null as TData;
        }

        return response.data as TData;
      } catch (error) {
        console.error(
          `Supabase mutation error (${action} on ${table}):`,
          error
        );
        throw error instanceof PostgrestError
          ? error
          : new Error(String(error));
      }
    },
    onMutate: async (variables) => {
      if (onOptimisticUpdate) {
        const context = await onOptimisticUpdate(
          variables,
          queryClient,
          tableListQueryKey
        );
        return { ...(context || {}), optimisticUpdateApplied: true };
      }

      await queryClient.cancelQueries({ queryKey: tableListQueryKey });
      const previousData =
        queryClient.getQueryData<FetchHookResult<TableRow<T>>>(
          tableListQueryKey
        );

      const itemMatches = (item: TableRow<T>, vars: object): boolean => {
        if (typeof vars !== "object" || vars === null) return false;
        const pkArray = Array.isArray(primaryKey) ? primaryKey : [primaryKey];
        return pkArray.every(
          (key) =>
            key in vars &&
            item[key] === (vars as Record<string, unknown>)[key as string]
        );
      };

      queryClient.setQueryData<FetchHookResult<TableRow<T>>>(
        tableListQueryKey,
        (old) => {
          if (!old || !Array.isArray(old.data)) return old;

          let updatedData = [...(old.data as TableRow<T>[])];
          let updatedCount = old.count ?? old.data.length;

          switch (action) {
            case "insert": {
              const newItems = Array.isArray(variables)
                ? variables
                : [variables];
              updatedData = [
                ...updatedData,
                ...(newItems as unknown as TableRow<T>[]),
              ];
              updatedCount += newItems.length;
              break;
            }
            case "update": {
              updatedData = updatedData.map((item) =>
                itemMatches(item, variables as object)
                  ? { ...item, ...(variables as object) }
                  : item
              );
              break;
            }
            case "delete": {
              const initialLength = updatedData.length;
              updatedData = updatedData.filter(
                (item) => !itemMatches(item, variables as object)
              );
              updatedCount -= initialLength - updatedData.length;
              break;
            }
            case "upsert": {
              const itemsToUpsert = Array.isArray(variables)
                ? variables
                : [variables];

              itemsToUpsert.forEach((itemToUpsert) => {
                const existingIndex = updatedData.findIndex((item) =>
                  itemMatches(item, itemToUpsert as object)
                );

                if (existingIndex > -1) {
                  updatedData[existingIndex] = {
                    ...updatedData[existingIndex],
                    ...(itemToUpsert as object),
                  };
                } else {
                  updatedData.push(itemToUpsert as unknown as TableRow<T>);
                  updatedCount++;
                }
              });
              break;
            }
          }

          updatedCount = Math.max(0, updatedCount);
          return { data: updatedData, count: updatedCount };
        }
      );

      return { previousData, optimisticUpdateApplied: true };
    },
    onError: (error, variables, context) => {
      console.error(`Mutation error (${action} on ${table}):`, error);

      if (context?.optimisticUpdateApplied && context?.previousData) {
        queryClient.setQueryData(tableListQueryKey, context.previousData);
        console.log(`Optimistic update rolled back for ${table}.`);
      } else if (context?.optimisticUpdateApplied) {
        console.warn(
          `Optimistic update applied for ${table}, but no previous data found for rollback. Invalidating query.`
        );
        queryClient.invalidateQueries({ queryKey: tableListQueryKey });
      }

      if (mutationOptions?.onError) {
        mutationOptions.onError(error, variables, context);
      }
    },
    onSuccess: (data, variables, context) => {
      const queriesToInvalidate = invalidateQueries ?? [tableListQueryKey];
      console.log(
        `Mutation success (${action} on ${table}). Invalidating keys:`,
        queriesToInvalidate
      );

      queriesToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },
    onSettled: mutationOptions?.onSettled,
    ...mutationOptions,
  });
}

function extractMatchAndData<T extends TableName>(
  payload: any,
  primaryKey: keyof TableRow<T> | Array<keyof TableRow<T>>
): { match: Partial<TableRow<T>>; data: TableUpdate<T> } {
  const match: any = {};
  const data: any = {};

  if (Array.isArray(primaryKey)) {
    primaryKey.forEach((key) => {
      if (payload[key] === undefined) {
        throw new Error(`Missing primary key ${String(key)} in payload`);
      }
      match[key] = payload[key];
    });
  } else {
    if (payload[primaryKey] === undefined) {
      throw new Error(`Missing primary key ${String(primaryKey)} in payload`);
    }
    match[primaryKey] = payload[primaryKey];
  }

  Object.keys(payload).forEach((key) => {
    if (!match[key]) {
      data[key] = payload[key];
    }
  });

  return { match, data };
}

function extractMatch<T extends TableName>(
  payload: any,
  primaryKey: keyof TableRow<T> | Array<keyof TableRow<T>>
): Partial<TableRow<T>> {
  const match: any = {};

  if (Array.isArray(primaryKey)) {
    primaryKey.forEach((key) => {
      if (payload[key] === undefined) {
        throw new Error(`Missing primary key ${String(key)} in payload`);
      }
      match[key] = payload[key];
    });
  } else {
    if (payload[primaryKey] === undefined) {
      throw new Error(`Missing primary key ${String(primaryKey)} in payload`);
    }
    match[primaryKey] = payload[primaryKey];
  }

  return match;
}
