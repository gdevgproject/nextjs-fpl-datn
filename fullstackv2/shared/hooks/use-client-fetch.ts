import { createClient } from "@/shared/supabase/client";
import {
  Database,
  PublicSchema,
  TableName,
  TableRow,
} from "@/shared/types/index";
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import {
  PostgrestFilterBuilder,
  PostgrestTransformBuilder,
  PostgrestSingleResponse,
} from "@supabase/postgrest-js";
import { SupabaseClient, PostgrestError } from "@supabase/supabase-js";

// Explicitly type the client
const supabase: SupabaseClient<Database> = createClient();

/**
 * Options for configuring the fetch query, now strongly typed.
 * @template T TableName - The name of the table being queried.
 * @template TResult The shape of the result (can include joined data). Defaults to the table's Row type.
 */
export type FetchHookOptions<
  T extends TableName,
  TResult = TableRow<T> // Default result is the row type
> = {
  /** Select specific columns, potentially with joins. E.g., `"id, name, profiles(*)"`, `"*"` */
  columns?: string;
  /**
   * Apply filters to the query. Provides type hints for the table's columns.
   * Example: `(query) => query.eq('status', 'active').gt('price', 100)`
   */
  filters?: (
    query: PostgrestFilterBuilder<PublicSchema, TableRow<T>, TResult>
  ) => PostgrestFilterBuilder<PublicSchema, TableRow<T>, TResult>;
  /** Pagination settings. */
  pagination?: {
    page: number; // 1-based
    pageSize: number;
  };
  /** Sorting criteria. */
  sort?: {
    column: keyof TResult | string; // Allow string for potentially joined/computed columns
    ascending?: boolean;
    nullsFirst?: boolean;
    foreignTable?: string; // Use for sorting joined columns
  }[];
  /** Type of count to perform ('exact', 'planned', 'estimated'). 'exact' required for pagination total. */
  count?: "exact" | "planned" | "estimated";
  /** Full-text search or pattern matching configuration. */
  search?: {
    column: keyof TResult | string;
    query: string;
    type?: "ilike" | "like" | "eq" | "fts"; // Add more as needed
    ftsOptions?: {
      config?: string;
      type?: "plain" | "phrase" | "websearch";
    };
  };
  /** Set to true to fetch a single record (e.g., using .eq('id', ...) and .single()). */
  single?: boolean;
};

/**
 * Type for the data returned by useClientFetch.
 * @template TData The shape of the data items.
 */
export type FetchHookResult<TData> = {
  data: TData | TData[] | null; // Can be single, array, or null
  count: number | null;
};

/**
 * Base hook for fetching data from a Supabase table on the client-side using TanStack Query.
 * Strongly typed based on your `Database` schema.
 *
 * @template T TableName - The name of the table to query (e.g., 'products').
 * @template TResult The expected shape of the data array elements. Defaults to the table's Row type.
 *
 * @param key The TanStack Query key. Used for caching. MUST be unique for the query.
 * @param table The name of the Supabase table to query.
 * @param options Fetch configuration (columns, filters, pagination, sort, count, search, single).
 * @param queryOptions Additional options for `useQuery`.
 *
 * @returns The result object from `useQuery`, containing typed data, status, error, etc.
 */
export function useClientFetch<
  T extends TableName,
  TResult = TableRow<T> // Default result to the Row type of the table
>(
  key: QueryKey,
  table: T,
  options?: FetchHookOptions<T, TResult>,
  queryOptions?: Omit<
    UseQueryOptions<FetchHookResult<TResult>, PostgrestError>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<FetchHookResult<TResult>, PostgrestError>({
    queryKey: key,
    queryFn: async (): Promise<FetchHookResult<TResult>> => {
      const queryBuilder = supabase.from(table);

      // Base select query
      let selectQuery = queryBuilder.select(options?.columns || "*", {
        count: options?.count,
      }) as PostgrestTransformBuilder<PublicSchema, TableRow<T>, TResult[]>;

      // Apply filters
      if (options?.filters) {
        // We need to cast selectQuery to FilterBuilder to apply filters
        const filterableQuery =
          selectQuery as unknown as PostgrestFilterBuilder<
            PublicSchema,
            TableRow<T>,
            TResult
          >;
        selectQuery = options.filters(
          filterableQuery
        ) as PostgrestTransformBuilder<PublicSchema, TableRow<T>, TResult[]>;
      }

      // Apply search - needs to be FilterBuilder
      if (options?.search && options.search.query) {
        const filterableQuery =
          selectQuery as unknown as PostgrestFilterBuilder<
            PublicSchema,
            TableRow<T>,
            TResult
          >;
        const {
          column,
          query: searchQuery,
          type = "ilike",
          ftsOptions,
        } = options.search;
        if (type === "fts") {
          const textSearchQuery = filterableQuery.textSearch(
            String(column),
            `'${searchQuery}'`,
            ftsOptions || {}
          );
          selectQuery = textSearchQuery as PostgrestTransformBuilder<
            PublicSchema,
            TableRow<T>,
            TResult[]
          >;
        } else {
          // For other search types (ilike, like, eq)
          const searchFilter = filterableQuery[type](
            String(column),
            type === "eq" ? searchQuery : `%${searchQuery}%`
          );
          selectQuery = searchFilter as PostgrestTransformBuilder<
            PublicSchema,
            TableRow<T>,
            TResult[]
          >;
        }
      }

      // Apply sorting - operates on TransformBuilder
      if (options?.sort && options.sort.length > 0) {
        options.sort.forEach((sort) => {
          selectQuery = selectQuery.order(String(sort.column), {
            ascending: sort.ascending ?? true,
            nullsFirst: sort.nullsFirst,
            foreignTable: sort.foreignTable,
          });
        });
      }

      // Apply pagination or single fetch - operates on TransformBuilder
      let response: PostgrestSingleResponse<TResult | TResult[]>;

      if (options?.single) {
        response = await selectQuery.single();
      } else if (options?.pagination) {
        const { page, pageSize } = options.pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        response = await selectQuery.range(from, to);
      } else {
        // Fetch all (or limited by RLS/PostgREST config)
        response = await selectQuery;
      }

      // Handle the response
      const { data, error, count } = response;

      if (error && !(options?.single && error.code === "PGRST116")) {
        // Ignore 'single' error if no rows found
        console.error(`Supabase fetch error (${table}):`, error);
        throw error;
      }

      return {
        data: data as TResult | TResult[] | null,
        count,
      };
    },
    ...queryOptions,
  });
}
