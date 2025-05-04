"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchShippers } from "../services";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

/**
 * Hook to fetch available shippers (users with shipper role)
 * @param options - Optional configuration options
 * @param options.showErrorToast - Whether to automatically show error toast (default: true)
 */
export function useShippers({ showErrorToast = true } = {}) {
  const toast = useSonnerToast();

  return useQuery({
    queryKey: ["shippers"],
    queryFn: async () => {
      try {
        console.log("Fetching shippers data...");
        const result = await fetchShippers();
        console.log("Shippers data fetched:", result);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Không thể kết nối với máy chủ";

        console.error("Error fetching shippers:", error);

        if (showErrorToast) {
          toast.error("Không thể tải danh sách người giao hàng", {
            description: errorMessage,
            duration: 5000,
          });
        }

        // Fallback để React Query không bị lỗi hoàn toàn
        return {
          data: [],
          count: 0,
          error: errorMessage,
        };
      }
    },
    staleTime: 1000 * 60, // Cache trong 1 phút thay vì 5 phút để debug
    refetchOnWindowFocus: false,
    retry: 1, // Giảm số lần retry để debug nhanh hơn
  });
}
