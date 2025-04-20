"use client";

import { useQuery } from "@tanstack/react-query";
import { getEmails } from "../actions";

/**
 * Custom hook to fetch user emails by their user IDs
 * Returns a map of user ID to email address
 */
export function useUserEmails(userIds: string[]) {
  return useQuery({
    queryKey: ["user-emails", userIds],
    queryFn: async () => {
      if (!userIds.length) return {};

      // Create unique list of IDs (remove duplicates)
      const uniqueUserIds = [...new Set(userIds)];

      try {
        // Sử dụng server action để lấy email từ auth.users
        const emailMap = await getEmails(uniqueUserIds);
        return emailMap;
      } catch (error) {
        console.error("Error fetching user emails:", error);
        return {}; // Trả về đối tượng trống nếu có lỗi
      }
    },
    enabled: userIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
