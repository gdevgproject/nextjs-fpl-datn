"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config";
import type { Order, OrderFilter, OrdersResponse } from "./types";
import { cancelOrder } from "../order-confirmation/actions";

// Lấy danh sách đơn hàng của người dùng
export function useUserOrders(
  userId: string | undefined,
  page = 1,
  pageSize = 5,
  filter: OrderFilter = {}
) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["orders", userId, page, pageSize, filter],
    queryFn: async (): Promise<OrdersResponse> => {
      if (!userId) throw new Error("Unauthorized");

      // Tạo query cơ bản
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          order_status:order_statuses(*),
          payment_method:payment_methods(*)
        `,
          { count: "exact" }
        )
        .eq("user_id", userId)
        .order("order_date", { ascending: false });

      // Áp dụng filter nếu có
      if (filter.status) {
        query = query.eq("order_status_id", filter.status);
      }

      if (filter.dateRange?.from) {
        query = query.gte("order_date", filter.dateRange.from.toISOString());
      }

      if (filter.dateRange?.to) {
        query = query.lte("order_date", filter.dateRange.to.toISOString());
      }

      // Áp dụng phân trang
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as Order[],
        count: count || 0,
      };
    },
    enabled: !!userId,
    staleTime: QUERY_STALE_TIME.ORDER,
  });
}

// Lấy chi tiết đơn hàng
export function useOrderDetail(userId: string | undefined, orderId: number) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["order", orderId, userId],
    queryFn: async () => {
      if (!userId) throw new Error("Unauthorized");

      // Lấy thông tin đơn hàng
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_status:order_statuses(*),
          payment_method:payment_methods(*)
        `
        )
        .eq("id", orderId)
        .eq("user_id", userId)
        .single();

      if (orderError) throw orderError;

      // Lấy các item trong đơn hàng
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select(
          `
          *,
          variant:product_variants(
            *,
            products:products(
              id,
              name,
              slug,
              images:product_images(*)
            )
          )
        `
        )
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      return {
        ...order,
        items: orderItems,
      } as Order;
    },
    enabled: !!userId && !!orderId,
    staleTime: QUERY_STALE_TIME.ORDER,
  });
}

// Hook để hủy đơn hàng
export function useCancelOrder(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: number) => {
      if (!userId) throw new Error("Unauthorized");

      const result = await cancelOrder(orderId);

      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    },
    // Cập nhật cache ngay lập tức để UI phản hồi nhanh chóng
    onMutate: async (orderId) => {
      // Hủy các queries đang chạy để tránh ghi đè
      await queryClient.cancelQueries({
        queryKey: ["order", orderId, userId],
      });

      // Lưu trữ state trước đó để có thể rollback nếu có lỗi
      const previousOrder = queryClient.getQueryData<Order>([
        "order",
        orderId,
        userId,
      ]);

      // Cập nhật cache ngay lập tức
      if (previousOrder) {
        queryClient.setQueryData<Order>(["order", orderId, userId], (old) => {
          if (!old) return previousOrder;

          // Cập nhật trạng thái đơn hàng thành "Cancelled"
          return {
            ...old,
            order_status_id: 5, // ID của trạng thái "Cancelled"
            order_status: {
              id: 5,
              name: "Cancelled",
            },
          };
        });
      }

      // Trả về context để sử dụng trong onError
      return { previousOrder };
    },
    // Nếu có lỗi, rollback lại state trước đó
    onError: (error, variables, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(
          ["order", variables, userId],
          context.previousOrder
        );
      }
    },
    // Sau khi mutation thành công, invalidate queries để fetch lại dữ liệu mới
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId, userId] });
      queryClient.invalidateQueries({ queryKey: ["orders", userId] });
    },
  });
}

// Lấy danh sách trạng thái đơn hàng
export function useOrderStatuses() {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["orderStatuses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_statuses")
        .select("*")
        .order("id");

      if (error) throw error;

      return data;
    },
    staleTime: Number.POSITIVE_INFINITY, // Dữ liệu này ít khi thay đổi
  });
}
