import { createClient } from "@/shared/supabase/client";
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { PostgrestError } from "@supabase/postgrest-js";

const supabase = createClient();

/**
 * [V3 Base Hooks] Hook cơ sở để gọi RPC function và lấy dữ liệu (thường dùng cho GET-like operations).
 *
 * @template TData - Kiểu dữ liệu mong đợi RPC trả về.
 * @template TError - Kiểu lỗi (mặc định PostgrestError).
 * @template TParams - Kiểu dữ liệu của tham số truyền vào RPC.
 * @param rpcName Tên của RPC function trong Postgres.
 * @param params Tham số truyền vào RPC (nếu có).
 * @param options Các tùy chọn khác của useQuery (TanStack Query).
 */
export function useClientRpcQuery<
  TData = unknown,
  TError = PostgrestError,
  TParams = object | undefined // RPC params thường là object
>(
  rpcName: string,
  params?: TParams,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
) {
  // Query key bao gồm tên RPC và params để đảm bảo tính duy nhất và refetch khi params đổi
  const queryKey: QueryKey = params ? [rpcName, params] : [rpcName];

  return useQuery<TData, TError>({
    queryKey: queryKey,
    queryFn: async (): Promise<TData> => {
      const { data, error } = await supabase.rpc(rpcName, params as any); // Dùng as any vì Supabase client typing cho params có thể không khớp hoàn toàn
      if (error) {
        console.error(`Supabase RPC query error (${rpcName}):`, error);
        throw error;
      }
      return data as TData;
    },
    ...options,
  });
}

/**
 * [V3 Base Hooks] Tùy chọn cho useClientRpcMutation.
 */
type ClientRpcMutationOptions<TData, TError, TParams, TContext> = {
  /**
   * Mảng các queryKey cần được invalidate sau khi mutation thành công.
   */
  invalidateQueries?: QueryKey[];
  /**
   * Các tùy chọn khác của useMutation (TanStack Query).
   * Bao gồm cả onMutate, onError, onSuccess, onSettled nếu cần xử lý optimistic update tùy chỉnh.
   */
  mutationOptions?: Omit<
    UseMutationOptions<TData, TError, TParams, TContext>,
    "mutationFn"
  >;
};

/**
 * [V3 Base Hooks] Hook cơ sở để gọi RPC function và thực hiện thay đổi dữ liệu (thường dùng cho POST-like operations).
 *
 * @template TData - Kiểu dữ liệu mong đợi RPC trả về sau khi thực thi.
 * @template TError - Kiểu lỗi (mặc định PostgrestError).
 * @template TParams - Kiểu dữ liệu của tham số truyền vào RPC.
 * @template TContext - Kiểu dữ liệu context cho các callback của useMutation.
 * @param rpcName Tên của RPC function trong Postgres.
 * @param options Các tùy chọn (invalidateQueries, mutationOptions).
 */
export function useClientRpcMutation<
  TData = unknown,
  TError = PostgrestError,
  TParams = object | undefined, // RPC params thường là object
  TContext = unknown
>(
  rpcName: string,
  options?: ClientRpcMutationOptions<TData, TError, TParams, TContext>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TParams, TContext>({
    mutationFn: async (params: TParams): Promise<TData> => {
      const { data, error } = await supabase.rpc(rpcName, params as any);
      if (error) {
        console.error(`Supabase RPC mutation error (${rpcName}):`, error);
        throw error;
      }
      return data as TData;
    },
    // onSuccess, onError, onSettled có thể được override trong options.mutationOptions
    onSuccess: (data, variables, context) => {
      console.log(`RPC mutation successful (${rpcName})`);
      // Invalidate queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      // Gọi onSuccess từ options nếu có
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(`RPC mutation failed (${rpcName}):`, error);
      // Gọi onError từ options nếu có
      options?.mutationOptions?.onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      // Gọi onSettled từ options nếu có
      options?.mutationOptions?.onSettled?.(data, error, variables, context);
    },
    // Spread các options còn lại
    ...options?.mutationOptions,
  });
}
