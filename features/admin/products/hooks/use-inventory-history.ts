"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export interface InventoryHistoryItem {
  id: number;
  variant_id: number;
  change_amount: number;
  reason: string;
  order_id: number | null;
  stock_after_change: number;
  updated_by: string | null;
  timestamp: string;
  user_email?: string | null;
  order_number?: string | null;
}

/**
 * Hook to fetch inventory history for a specific product variant
 */
export function useInventoryHistory(variantId: number | null) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["inventory_history", variantId],
    queryFn: async (): Promise<InventoryHistoryItem[]> => {
      if (!variantId) return [];

      try {
        // Query inventory history
        const { data: inventoryData, error: inventoryError } = await supabase
          .from("inventory")
          .select(
            `
            *,
            orders:order_id (
              id
            )
          `
          )
          .eq("variant_id", variantId)
          .order("timestamp", { ascending: false });

        if (inventoryError) {
          console.error("Error fetching inventory history:", inventoryError);
          throw new Error(inventoryError.message);
        }

        // Process the data to include user email
        const result = await Promise.all(
          (inventoryData || []).map(async (item) => {
            let userEmail = null;

            // If there's an updated_by user ID, fetch that user's email separately
            if (item.updated_by) {
              const { data: userData, error: userError } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", item.updated_by)
                .single();

              if (!userError && userData) {
                // Now get the email from auth.users
                const { data: authUser } =
                  await supabase.auth.admin.getUserById(item.updated_by);
                userEmail = authUser?.user?.email || "Hệ thống";
              }
            }

            return {
              ...item,
              user_email: userEmail || "Hệ thống",
              order_number: item.orders?.id ? `#${item.orders.id}` : null,
            };
          })
        );

        return result;
      } catch (error) {
        console.error("Error fetching inventory history:", error);
        return [];
      }
    },
    enabled: !!variantId,
  });
}

/**
 * Format inventory history timestamp for display
 */
export function formatInventoryTimestamp(timestamp: string): string {
  try {
    return format(new Date(timestamp), "HH:mm 'ngày' dd/MM/yyyy", {
      locale: vi,
    });
  } catch (e) {
    return timestamp;
  }
}

/**
 * Get reason display text for inventory change
 */
export function getInventoryReasonDisplay(
  reason: string,
  orderNumber: string | null
): string {
  if (reason === "Initial stock setup") {
    return "Thiết lập ban đầu";
  }

  if (reason === "Manual stock adjustment") {
    return "Điều chỉnh thủ công";
  }

  if (reason === "Đơn hàng đã giao" && orderNumber) {
    return `Đơn hàng ${orderNumber} đã giao`;
  }

  return reason;
}

/**
 * Get background color class for inventory change type
 */
export function getInventoryChangeColor(changeAmount: number): string {
  if (changeAmount > 0) {
    return "bg-green-50 border-green-200 text-green-700";
  } else if (changeAmount < 0) {
    return "bg-red-50 border-red-200 text-red-700";
  } else {
    return "bg-gray-50 border-gray-200 text-gray-700";
  }
}
