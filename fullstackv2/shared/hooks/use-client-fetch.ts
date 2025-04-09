import { createClient } from "@/shared/supabase/client";
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { PostgrestFilterBuilder, PostgrestError } from "@supabase/postgrest-js";

const supabase = createClient();

/**
 * [V3 Base Hooks] Tùy chọn cho việc fetch dữ liệu với useClientFetch.
 */
type FetchDataOptions<
  Schema,
  Table extends keyof Schema["public"]["Tables"],
  Result
> = {
  /**
   * Chuỗi select theo chuẩn Supabase, bao gồm nested selects.
   * @example '*, brand(*), variants:product_variants(id, volume_ml)'
   * @default '*'
   */
  columns?: string;
  /**
   * Hàm nhận PostgrestFilterBuilder để áp dụng các bộ lọc (where, eq, gt, in, etc.).
   * @example query => query.eq('status', 'active').gt('price', 100)
   */
  filters?: (
    query: PostgrestFilterBuilder<
      Schema["public"]["Tables"][Table]["Row"],
      any,
      Result[]
    >
  ) => PostgrestFilterBuilder<
    Schema["public"]["Tables"][Table]["Row"],
    any,
    Result[]
  >;
  /**
   * Tùy chọn phân trang.
   */
  pagination?: {
    page: number; // Số trang (bắt đầu từ 1)
    pageSize: number;
  };
  /**
   * Mảng các tùy chọn sắp xếp.
   */
  sort?: {
    column: keyof Schema["public"]["Tables"][Table]["Row"] | string; // Cho phép cả cột quan hệ 'relation.column'
    ascending?: boolean;
  }[];
  /**
   * Tùy chọn đếm tổng số bản ghi (hữu ích khi phân trang).
   */
  count?: "exact" | "planned" | "estimated";
  /**
   * Tùy chọn tìm kiếm văn bản cơ bản (sử dụng ILIKE). Ưu tiên fts nếu được cung cấp.
   */
  search?: {
    column: keyof Schema["public"]["Tables"][Table]["Row"] | string;
    query: string;
  };
  /**
   * Tùy chọn Full-Text Search (Postgres FTS). Sẽ ghi đè 'search' nếu được cung cấp.
   */
  fts?: {
    column: keyof Schema["public"]["Tables"][Table]["Row"] | string;
    query: string;
    config?: string; // Tùy chọn cấu hình FTS (vd: 'english')
  };
};

/**
 * [V3 Base Hooks] Hook cơ sở để fetch dữ liệu từ một bảng Supabase phía client.
 * Hỗ trợ select cột (nested), filter, sort, pagination, count, search, FTS.
 *
 * @template Schema - Kiểu schema Supabase (thường được tạo tự động).
 * @template Table - Tên bảng cần fetch.
 * @template Result - Kiểu dữ liệu mong đợi trả về (mặc định là Row của bảng).
 * @param key Query key cho TanStack Query.
 * @param table Tên bảng Supabase.
 * @param options Các tùy chọn fetch (columns, filters, pagination, sort, count, search, fts).
 * @param queryOptions Các tùy chọn khác của useQuery (TanStack Query).
 * @returns Kết quả từ useQuery, bao gồm data { data: Result[]; count?: number } và các trạng thái khác.
 */
export function useClientFetch<
  Schema extends { public: { Tables: any } },
  Table extends keyof Schema["public"]["Tables"],
  Result = Schema["public"]["Tables"][Table]["Row"] // Mặc định kiểu trả về là Row
>(
  key: QueryKey,
  table: Table,
  options?: FetchDataOptions<Schema, Table, Result>,
  queryOptions?: Omit<
    UseQueryOptions<{ data: Result[]; count?: number | null }, PostgrestError>,
    "queryKey" | "queryFn"
  >
) {
  const queryKey = Array.isArray(key) ? key : [key];

  return useQuery<{ data: Result[]; count?: number | null }, PostgrestError>({
    queryKey: [...queryKey, options], // Bao gồm options trong key để tự động refetch khi options thay đổi
    queryFn: async () => {
      // Bắt đầu query
      let queryBuilder = supabase.from(table as string);

      // 1. Select columns (bao gồm nested và count)
      let selectQuery = queryBuilder.select(options?.columns || "*", {
        count: options?.count,
      });

      // 2. Áp dụng filters (nếu có)
      if (options?.filters) {
        selectQuery = options.filters(selectQuery as any) as any;
      }

      // 3. Áp dụng FTS hoặc Search (FTS ưu tiên hơn)
      if (options?.fts) {
        selectQuery = selectQuery.textSearch(
          options.fts.column as string,
          options.fts.query,
          { config: options.fts.config, type: "websearch" } // 'websearch' thường phù hợp
        );
      } else if (options?.search) {
        selectQuery = selectQuery.ilike(
          options.search.column as string,
          `%${options.search.query}%`
        );
      }

      // 4. Áp dụng sắp xếp
      if (options?.sort && options.sort.length > 0) {
        options.sort.forEach((sort) => {
          selectQuery = selectQuery.order(sort.column as string, {
            ascending: sort.ascending ?? true,
          });
        });
      }

      // 5. Áp dụng phân trang
      if (options?.pagination) {
        const { page, pageSize } = options.pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        selectQuery = selectQuery.range(from, to);
      }

      // Thực hiện truy vấn
      const { data, error, count } = await selectQuery;

      if (error) {
        console.error("Supabase fetch error:", error);
        throw error; // Ném lỗi để TanStack Query xử lý
      }

      return { data: data as Result[], count };
    },
    ...queryOptions,
  });
}
