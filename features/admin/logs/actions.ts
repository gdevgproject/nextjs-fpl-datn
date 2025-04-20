"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Lấy thông tin email của admin users từ auth.users
 * Sử dụng service role client để có quyền truy cập vào bảng auth.users
 */
export async function getEmails(
  userIds: string[]
): Promise<Record<string, string>> {
  if (!userIds.length) {
    return {};
  }

  try {
    // Sử dụng service role client để có quyền truy cập vào auth.users
    const supabase = await createServiceRoleClient();
    const emailMap: Record<string, string> = {};

    // Sử dụng auth.admin.getUserById thay vì truy vấn trực tiếp
    // Cần xử lý tuần tự vì Supabase chưa hỗ trợ lấy nhiều user cùng lúc
    const uniqueUserIds = [...new Set(userIds)];
    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        try {
          const { data, error } = await supabase.auth.admin.getUserById(userId);

          if (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return;
          }

          if (data?.user?.email) {
            emailMap[userId] = data.user.email;
          }
        } catch (err) {
          console.error(`Failed to fetch user ${userId}:`, err);
        }
      })
    );

    return emailMap;
  } catch (error) {
    console.error("Failed to fetch user emails:", error);
    return {};
  }
}
