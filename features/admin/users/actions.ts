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

    // Update user ban status
    const { error } = await supabase.auth.admin.updateUserById(params.userId, {
      banned: params.isBlocked,
    });

    if (error) {
      return createErrorResponse(error.message);
    }

    // Log the action
    await supabase.from("admin_activity_log").insert({
      admin_id: params.userId, // This should be the current admin's ID in production
      action_type: params.isBlocked ? "block_user" : "unblock_user",
      action_details: params.isBlocked ? "User blocked" : "User unblocked",
      entity_type: "user",
      entity_id: params.userId,
    });

    // Revalidate paths
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${params.userId}`);

    return createSuccessResponse();
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
