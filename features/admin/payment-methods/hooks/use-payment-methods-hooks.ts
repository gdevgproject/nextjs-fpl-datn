"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { QueryKey } from "@tanstack/react-query";

const supabase = getSupabaseBrowserClient();

/**
 * Custom hook for performing mutations on payment_methods table
 */
export function usePaymentMethodMutation(
  action: "insert" | "update" | "delete",
  options: {
    invalidateQueries: QueryKey[];
    primaryKey: string;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      let response;

      try {
        switch (action) {
          case "insert":
            response = await supabase
              .from("payment_methods")
              .insert(payload)
              .select();
            break;
          case "update":
            // Extract the ID for the match condition
            const { id, ...dataToUpdate } = payload;
            response = await supabase
              .from("payment_methods")
              .update(dataToUpdate)
              .eq("id", id)
              .select();
            break;
          case "delete":
            response = await supabase
              .from("payment_methods")
              .delete()
              .eq("id", payload.id);
            break;
          default:
            throw new Error(`Unsupported action: ${action}`);
        }

        if (response.error) {
          throw response.error;
        }

        return action === "delete" ? null : response.data;
      } catch (error) {
        console.error(`Payment method ${action} error:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      options.invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    },
  });
}

/**
 * Custom hook for fetching payment methods with filtering, pagination and sorting
 */
export function usePaymentMethodsFetch(
  key: QueryKey,
  options?: {
    filters?: {
      search?: string;
    };
    pagination?: {
      page: number;
      pageSize: number;
    };
    sort?: {
      column: string;
      direction: "asc" | "desc";
    };
  }
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      // Start with the base query
      let query = supabase
        .from("payment_methods")
        .select("id, name, description, is_active", {
          count: "exact",
        });

      // Apply search filter if provided
      if (options?.filters?.search) {
        query = query.ilike("name", `%${options.filters.search}%`);
      }

      // Apply sorting
      if (options?.sort) {
        query = query.order(options.sort.column, {
          ascending: options.sort.direction === "asc",
        });
      } else {
        // Default sorting
        query = query.order("name", { ascending: true });
      }

      // Apply pagination if provided
      if (options?.pagination) {
        const { page, pageSize } = options.pagination;
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
        data,
        count,
      };
    },
  });
}
