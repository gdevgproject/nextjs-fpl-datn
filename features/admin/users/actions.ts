"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/error-utils";
import type { UpdateUserRole, UpdateUserBlockStatus } from "./types";

/**
 * Update user role
 */
export async function updateUserRoleAction(params: UpdateUserRole) {
  try {
    const supabase = await createServiceRoleClient();

    // Update user metadata with the new role
    const { error } = await supabase.auth.admin.updateUserById(params.userId, {
      app_metadata: { role: params.role },
    });

    if (error) {
      return createErrorResponse(error.message);
    }

    // Log the action (optional)
    await supabase.from("admin_activity_log").insert({
      admin_id: params.userId, // This should be the current admin's ID in production
      action_type: "update_user_role",
      action_details: `Role updated to ${params.role}`,
      entity_type: "user",
      entity_id: params.userId,
    });

    // Revalidate paths that might display this user
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${params.userId}`);

    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * Update user block status
 */
export async function updateUserBlockStatusAction(
  params: UpdateUserBlockStatus
) {
  try {
    const supabase = await createServiceRoleClient();

    // Get the current user's session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    // Security check: Prevent blocking yourself
    if (params.isBlocked && params.userId === currentUserId) {
      return createErrorResponse("Không thể chặn tài khoản của chính bạn");
    }

    // Security check: Get user role to prevent blocking admins
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(params.userId);
    if (userError) {
      return createErrorResponse(userError.message);
    }

    const userRole = userData?.user?.app_metadata?.role || "user";

    // Security check: Prevent blocking admin accounts
    if (params.isBlocked && userRole === "admin") {
      return createErrorResponse(
        "Không thể chặn tài khoản admin. Đây là hành động nhạy cảm và có thể ảnh hưởng đến toàn bộ hệ thống"
      );
    }

    // Determine ban_duration string per Supabase Admin API
    let banDurationStr: string;
    if (params.isBlocked) {
      switch (params.banDuration) {
        case "1day":
          banDurationStr = "24h";
          break;
        case "7days":
          banDurationStr = "168h";
          break;
        case "30days":
          banDurationStr = "720h";
          break;
        case "custom":
          banDurationStr = `${params.customDuration! * 24}h`;
          break;
        case "permanent":
        default:
          // Use a long duration (e.g. 10 years)
          banDurationStr = "87600h";
      }
    } else {
      // 'none' to clear ban
      banDurationStr = "none";
    }

    // Call Supabase Admin API with ban_duration
    const { data: user, error } = await supabase.auth.admin.updateUserById(
      params.userId,
      { ban_duration: banDurationStr }
    );

    if (error) {
      return createErrorResponse(error.message);
    }

    // Log the action
    await supabase.from("admin_activity_log").insert({
      admin_id: currentUserId || params.userId, // use current admin ID instead of target user
      action_type: params.isBlocked ? "block_user" : "unblock_user",
      action_details: params.isBlocked
        ? `Blocked for ${banDurationStr}`
        : "User unblocked",
      entity_type: "user",
      entity_id: params.userId,
    });

    // Revalidate paths
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${params.userId}`);

    return createSuccessResponse({
      message: params.isBlocked
        ? `User blocked until ${user!.banned_until}`
        : "User unblocked",
      bannedUntil: user!.banned_until,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetAction(email: string) {
  try {
    const supabase = await createServiceRoleClient();

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dat-lai-mat-khau`,
    });

    if (error) {
      return createErrorResponse(error.message);
    }

    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
}
