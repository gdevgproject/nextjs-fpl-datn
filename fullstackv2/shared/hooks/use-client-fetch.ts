import { createClient } from "@/shared/supabase/client";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  PostgrestFilterBuilder,
  PostgrestTransformBuilder,
} from "@supabase/postgrest-js";
import { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";

// Initialize Supabase client
const supabase = createClient();

/**
 * Options for configuring the fetch query.
 * @template Schema The database schema type (usually inferred).
 * @template TableName The name of the table being queried.
 * @template RelationName The name of the relation for joins.
 * @template Relationships The relationship definitions for joins.
 * @template Result The expected shape of a single row in the result.
 */
type FetchOptions<
  Schema extends GenericSchema,
  TableName extends keyof Schema["Tables"],
  RelationName extends keyof Schema["Tables"][TableName]["Relationships"][number],
  Relationships = Schema["Tables"][TableName]["Relationships"],
  Result = Schema["Tables"][TableName]["Row"]
> = {
  /** Select specific columns, potentially with joins. E.g., `"id, name, profiles(*)"`, `"*"` */
  columns?: string;
  /**
   * Apply filters to the query.
   * Example: `(query) => query.eq('status', 'active').gt('price', 100)`
   * Allows chaining complex filters: `.or('cond1,cond2')`, `.in('id', [1,2])`, etc.
   */
  filters?: (
    query: PostgrestFilterBuilder<
      Schema,
      Schema["Tables"][TableName]["Row"],
      Result
    >
  ) => PostgrestFilterBuilder<
    Schema,
    Schema["Tables"][TableName]["Row"],
    Result
  >;
  /** Pagination settings. */
  pagination?: {
    /** The current page number (1-based). */
    page: number;
    /** The number of items per page. */
    pageSize: number;
  };
  /** Sorting criteria. Applied in the order provided. */
  sort?: {
    /** The column name to sort by. */
    column: keyof Result | string; // Allow string for joined columns
    /** Sort direction. Defaults to true (ascending). */
    ascending?: boolean;
    /** Options for sorting nulls ('nullsfirst', 'nullslast'). */
    nullsFirst?: boolean;
    /** Specify foreign table for sorting on joined columns. */
    foreignTable?: string;
  }[];
  /**
   * Joins configuration. Use `columns` for more complex joins.
   * Example: `[{ relation: 'profiles', columns: 'id, display_name' }]`
   * Note: Type safety on joined columns relies on correct `columns` string.
   * @deprecated Prefer using joined columns directly in the main `columns` string (e.g., `"*, relation(*)"`). This option is kept for potential specific use cases but might be removed later.
   */
  joins?: {
    relation: RelationName | string; // Allow string for flexibility
    columns?: string;
  }[];
  /** Type of count to perform ('exact', 'planned', 'estimated'). 'exact' required for pagination total. */
  count?: "exact" | "planned" | "estimated";
  /** Full-text search or pattern matching configuration. */
  search?: {
    /** Column to search against. */
    column: keyof Result | string;
    /** Search query string. */
    query: string;
    /** Search type ('ilike' for case-insensitive like, 'fts' for full-text search, etc.). Defaults to 'ilike'. */
    type?: "ilike" | "like" | "eq" | "fts"; // Add more as needed
    /** Full-text search options */
    ftsOptions?: {
      /** The text search configuration */
      config?: string;
      /** The type of query */
      type?: "plain" | "phrase" | "websearch";
    };
  };
};

/**
 * Base hook for fetching data from a Supabase table on the client-side using TanStack Query.
 * Handles selection, filtering, sorting, pagination, and joins.
 *
 * @template Schema The database schema type (e.g., Database).
 * @template TableName The name of the table to query (e.g., 'products').
 * @template Result The expected shape of the data array elements. Defaults to the table's Row type.
 *
 * @param key The TanStack Query key. Used for caching.
 * @param table The name of the Supabase table to query.
 * @param options Fetch configuration (columns, filters, pagination, sort, joins, count, search).
 * @param queryOptions Additional options for `useQuery`.
 *
 * @returns The result object from `useQuery`, containing data, status, error, etc.
 *          The `data` property is an object `{ data: Result[]; count?: number }`.
 */
export function useClientFetch<
  Schema extends GenericSchema,
  TableName extends keyof Schema["Tables"] & string, // Ensure TableName is a string
  Result = Schema["Tables"][TableName]["Row"]
>(
  key: unknown[], // Use unknown[] for query keys as recommended by TanStack Query v5
  table: TableName,
  options?: FetchOptions<Schema, TableName, any, any, Result>, // Use 'any' for RelationName/Relationships generics here for simplicity in the base hook signature
  queryOptions?: Omit<
    UseQueryOptions<{ data: Result[]; count?: number | null }, Error>,
    "queryKey" | "queryFn"
  >
) {
  const queryKey = key; // Use the provided key directly

  return useQuery<{ data: Result[]; count?: number | null }, Error>({
    queryKey,
    queryFn: async () => {
      // Start with select
      // The initial PostgrestQueryBuilder needs the schema type
      let queryBuilder = supabase.from(table);

      // Apply select with count
      // The PostgrestFilterBuilder needs schema, row type, and result type
      let selectQuery: PostgrestTransformBuilder<
        Schema,
        Schema["Tables"][TableName]["Row"],
        Result[]
      > = queryBuilder.select(options?.columns || "*", {
        count: options?.count,
      }) as PostgrestTransformBuilder<
        Schema,
        Schema["Tables"][TableName]["Row"],
        Result[]
      >; // Assert type after select

      // Apply joins (Deprecated approach - prefer joins in `columns`)
      // if (options?.joins && options.joins.length > 0) {
      //   console.warn("Using the 'joins' option in useClientFetch is deprecated. Prefer specifying joins directly in the 'columns' string (e.g., '*, relation(*)').");
      //   options.joins.forEach(join => {
      //     // This syntax is complex to type correctly with generics here, using 'any' for simplicity
      //     selectQuery = (selectQuery as any).select(`${join.relation}(${join.columns || '*'})`);
      //   });
      // }

      // Apply filters
      let filteredQuery: PostgrestFilterBuilder<
        Schema,
        Schema["Tables"][TableName]["Row"],
        Result
      > = options?.filters
        ? options.filters(
            selectQuery as PostgrestFilterBuilder<
              Schema,
              Schema["Tables"][TableName]["Row"],
              Result
            >
          ) // Apply filters
        : (selectQuery as PostgrestFilterBuilder<
            Schema,
            Schema["Tables"][TableName]["Row"],
            Result
          >); // Cast if no filters

      // Apply search
      if (options?.search && options.search.query) {
        const {
          column,
          query: searchQuery,
          type = "ilike",
          ftsOptions,
        } = options.search;
        if (type === "fts") {
          filteredQuery = filteredQuery.textSearch(
            column as string,
            `'${searchQuery}'`,
            ftsOptions || {}
          );
        } else {
          filteredQuery = filteredQuery[type](
            column as string,
            `%${searchQuery}%`
          );
        }
      }

      // Apply sorting
      if (options?.sort && options.sort.length > 0) {
        options.sort.forEach((sort) => {
          filteredQuery = filteredQuery.order(sort.column as string, {
            ascending: sort.ascending ?? true,
            nullsFirst: sort.nullsFirst,
            foreignTable: sort.foreignTable,
          });
        });
      }

      // Apply pagination
      if (options?.pagination) {
        const { page, pageSize } = options.pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        filteredQuery = filteredQuery.range(from, to);
      }

      // Execute query
      const { data, error, count } = await filteredQuery;

      if (error) {
        console.error("Supabase fetch error:", error);
        throw error; // Re-throw the error for TanStack Query to handle
      }

      return { data: data as Result[], count };
    },
    ...queryOptions,
  });
}
