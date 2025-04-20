"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { cache } from "react";

/**
 * Lấy thông tin email của admin users từ auth.users
 * Hàm này được cache ở server side để giảm số lần gọi đến Supabase
 */
export const getEmails = cache(async function getEmails(
  userIds: string[]
): Promise<Record<string, string>> {
  if (!userIds.length) {
    return {};
  }

  // Xóa bỏ ID trùng lặp
  const uniqueUserIds = [...new Set(userIds)];

  try {
    // Sử dụng service role client để có quyền truy cập vào auth.users
    const supabase = await createServiceRoleClient();
    const emailMap: Record<string, string> = {};

    // Xử lý theo batch để tránh query quá dài
    const batchSize = 20;
    for (let i = 0; i < uniqueUserIds.length; i += batchSize) {
      const batch = uniqueUserIds.slice(i, i + batchSize);

      const { data, error } = await supabase.auth.admin.listUsers({
        perPage: 100,
        // Lọc theo danh sách userIds trong batch
        filter: {
          id: {
            in: batch,
          },
        },
      });

      if (error) {
        console.error(`Error fetching users in batch ${i}:`, error);
        continue;
      }

      if (data?.users) {
        // Map user id to email
        data.users.forEach((user) => {
          if (user.id && user.email) {
            emailMap[user.id] = user.email;
          }
        });
      }
    }

    return emailMap;
  } catch (error) {
    console.error("Failed to fetch user emails:", error);
    return {};
  }
});
