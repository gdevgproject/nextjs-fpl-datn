"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getInventoryHistoryByVariantId } from "../actions";

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
  return useQuery({
    queryKey: ["inventory_history", variantId],
    queryFn: async (): Promise<InventoryHistoryItem[]> => {
      if (!variantId) return [];
      // Gọi server action để lấy lịch sử kho (bypass RLS)
      return await getInventoryHistoryByVariantId(variantId);
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
