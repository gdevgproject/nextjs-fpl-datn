"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config";
import {
  createPaymentMethodAction,
  updatePaymentMethodAction,
  togglePaymentMethodActiveStateAction,
} from "./actions";
import type {
  PaymentMethod,
  PaymentMethodsFilters,
  PaymentMethodsPagination,
  PaymentMethodsSort,
  PaymentMethodsResult,
} from "./types";

/**
 * Hook to fetch payment methods with filtering, pagination, and sorting
 */
export function usePaymentMethods(
  filters?: PaymentMethodsFilters,
  pagination?: PaymentMethodsPagination,
  sort?: PaymentMethodsSort
) {
  const queryKey = ["payment-methods", "list", filters, pagination, sort];

  return useQuery<PaymentMethodsResult>({
    queryKey,
    queryFn: async (): Promise<PaymentMethodsResult> => {
      const supabase = getSupabaseBrowserClient();

      // Start with the base query
      let query = supabase.from("payment_methods").select("*", {
        count: "exact",
      });

      // Apply search filter
      if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.column, {
          ascending: sort.direction === "asc",
        });
      } else {
        // Default sorting
        query = query.order("name", { ascending: true });
      }

      // Apply pagination
      if (pagination) {
        const { page, pageSize } = pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      // Execute the query
      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching payment methods:", error);
        throw error;
      }

      return {
        data: data || [],
        count,
      };
    },
    staleTime: QUERY_STALE_TIME.CATEGORY, // Using longer stale time as payment methods don't change often
  });
}

/**
 * Hook to create a new payment method
 */
export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PaymentMethod) => createPaymentMethodAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

/**
 * Hook to update an existing payment method
 */
export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PaymentMethod) => updatePaymentMethodAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

/**
 * Hook to toggle a payment method's active state
 */
export function useTogglePaymentMethodActiveState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      togglePaymentMethodActiveStateAction(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}
