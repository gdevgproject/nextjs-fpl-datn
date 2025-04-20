"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEmails } from "../actions";

/**
 * Custom hook để lấy thông tin email của người dùng theo ID
 * - Sử dụng QueryClient để share dữ liệu giữa các component
 * - Hỗ trợ caching và gộp request
 */
export function useUserEmails(userIds: string[]) {
  const queryClient = useQueryClient();
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  // Lọc ra những ID chưa được cache để chỉ request những ID này
  const uncachedUserIds = uniqueUserIds.filter((userId) => {
    // Kiểm tra xem email đã được cache chưa
    const cachedData = queryClient.getQueryData<Record<string, string>>([
      "user-emails",
    ]);
    return !cachedData || cachedData[userId] === undefined;
  });

  return useQuery({
    queryKey: ["user-emails", uniqueUserIds.sort().join(",")],
    queryFn: async () => {
      // Nếu không có ID nào chưa được cache, trả về dữ liệu đã cache
      if (uncachedUserIds.length === 0) {
        const cachedData =
          queryClient.getQueryData<Record<string, string>>(["user-emails"]) ||
          {};
        return cachedData;
      }

      try {
        // Chỉ lấy email cho những userId chưa có trong cache
        const newEmails = await getEmails(uncachedUserIds);

        // Kết hợp dữ liệu mới với cache hiện tại
        const cachedData =
          queryClient.getQueryData<Record<string, string>>(["user-emails"]) ||
          {};
        const mergedData = { ...cachedData, ...newEmails };

        // Lưu kết quả vào global cache để các component khác có thể dùng
        queryClient.setQueryData(["user-emails"], mergedData);

        return mergedData;
      } catch (error) {
        console.error("Error fetching user emails:", error);
        return {}; // Trả về đối tượng trống nếu có lỗi
      }
    },
    // Chỉ chạy query nếu có ít nhất một userIds
    enabled: uniqueUserIds.length > 0,
    // Cache lâu hơn vì thông tin email người dùng ít thay đổi
    staleTime: 1000 * 60 * 30, // 30 phút
    cacheTime: 1000 * 60 * 60, // 1 giờ
    // Không refetch khi focus lại trang
    refetchOnWindowFocus: false,
  });
}
