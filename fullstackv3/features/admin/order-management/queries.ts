"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  OrderFilter,
  PaginatedOrders,
  OrderDetails,
  OrderActivityLog,
  OrderStats,
} from "./types";
import type { PaymentStatus } from "@/features/shop/account/order-types";
import {
  getOrdersList,
  getOrderDetails,
  updateOrderStatus,
  updateOrderTracking,
  updatePaymentStatus,
  getOrderActivityLog,
  getOrderStats,
  getOrderStatuses,
} from "./actions";

// Query keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: OrderFilter) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
  activityLog: (id: number) => [...orderKeys.detail(id), "activity"] as const,
  statuses: () => [...orderKeys.all, "statuses"] as const,
  stats: () => [...orderKeys.all, "stats"] as const,
};

/**
 * Hook to fetch paginated orders with filtering
 */
export function useOrders(filter: OrderFilter) {
  return useQuery({
    queryKey: orderKeys.list(filter),
    queryFn: () => getOrdersList(filter),
    select: (response) => response.data as PaginatedOrders,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch a single order with all details
 */
export function useOrderDetails(orderId: number) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrderDetails(orderId),
    select: (response) => response.data as OrderDetails,
    enabled: !!orderId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch order activity log
 */
export function useOrderActivityLog(orderId: number) {
  return useQuery({
    queryKey: orderKeys.activityLog(orderId),
    queryFn: () => getOrderActivityLog(orderId),
    select: (response) => response.data as OrderActivityLog[],
    enabled: !!orderId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch order statistics
 */
export function useOrderStats() {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: () => getOrderStats(),
    select: (response) => response.data as OrderStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch all order statuses
 */
export function useOrderStatuses() {
  return useQuery({
    queryKey: orderKeys.statuses(),
    queryFn: () => getOrderStatuses(),
    select: (response) => response.data as Array<{ id: number; name: string }>,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      statusId,
    }: {
      orderId: number;
      statusId: number;
    }) => updateOrderStatus(orderId, statusId),
    onSuccess: (_, variables) => {
      // Invalidate specific order detail
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      });
      // Invalidate order lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      // Invalidate activity log
      queryClient.invalidateQueries({
        queryKey: orderKeys.activityLog(variables.orderId),
      });
    },
  });
}

/**
 * Hook to update order tracking number
 */
export function useUpdateOrderTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      trackingNumber,
    }: {
      orderId: number;
      trackingNumber: string;
    }) => updateOrderTracking(orderId, trackingNumber),
    onSuccess: (_, variables) => {
      // Invalidate specific order detail
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      });
      // Invalidate order lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Invalidate activity log
      queryClient.invalidateQueries({
        queryKey: orderKeys.activityLog(variables.orderId),
      });
    },
  });
}

/**
 * Hook to update payment status
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      paymentStatus,
    }: {
      orderId: number;
      paymentStatus: PaymentStatus;
    }) => updatePaymentStatus(orderId, paymentStatus),
    onSuccess: (_, variables) => {
      // Invalidate specific order detail
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      });
      // Invalidate order lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Invalidate activity log
      queryClient.invalidateQueries({
        queryKey: orderKeys.activityLog(variables.orderId),
      });
    },
  });
}
