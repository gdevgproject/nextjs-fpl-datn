"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  orderStatusUpdateSchema,
  cancelOrderSchema,
  assignShipperSchema,
} from "./types";

// Type for action responses to ensure consistent return format
interface ActionResponse {
  success: boolean;
  error?: string;
}

/**
 * Update the status of an order
 */
export async function updateOrderStatusAction(
  data: z.infer<typeof orderStatusUpdateSchema>
): Promise<ActionResponse> {
  try {
    // Input validation
    const validated = orderStatusUpdateSchema.parse(data);

    // Get server-side Supabase client
    const supabase = await getSupabaseServerClient();

    // Check that the user has admin/staff roles
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user metadata indicates admin/staff role
    const userRole = user.user.user_metadata?.role as string | undefined;
    if (userRole !== "admin" && userRole !== "staff") {
      return { success: false, error: "Insufficient permissions" };
    }

    // Update the order status
    const { error } = await supabase
      .from("orders")
      .update({ order_status_id: validated.order_status_id })
      .eq("id", validated.id);

    if (error) {
      console.error("Error updating order status:", error);
      return { success: false, error: error.message };
    }

    // Revalidate related paths
    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error) {
    console.error("Error in updateOrderStatusAction:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error:
          "Invalid input data: " +
          error.errors.map((e) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Cancel an order by admin/staff
 */
export async function cancelOrderAction(
  data: z.infer<typeof cancelOrderSchema>
): Promise<ActionResponse> {
  try {
    // Input validation
    const validated = cancelOrderSchema.parse(data);

    // Get server-side Supabase client
    const supabase = await getSupabaseServerClient();

    // Check that the user has admin/staff roles
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user metadata indicates admin/staff role
    const userRole = user.user.user_metadata?.role as string | undefined;
    if (userRole !== "admin" && userRole !== "staff") {
      return { success: false, error: "Insufficient permissions" };
    }

    // Get the cancelled status ID
    const { data: statusData } = await supabase
      .from("order_statuses")
      .select("id")
      .eq("name", "Đã hủy")
      .single();

    if (!statusData) {
      return { success: false, error: "Could not find 'Đã hủy' status" };
    }

    // Update the order with cancellation details
    const { error } = await supabase
      .from("orders")
      .update({
        order_status_id: statusData.id,
        cancellation_reason: validated.reason,
        cancelled_by: "admin",
        cancelled_by_user_id: user.user.id,
      })
      .eq("id", validated.id);

    if (error) {
      console.error("Error cancelling order:", error);
      return { success: false, error: error.message };
    }

    // Revalidate related paths
    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error) {
    console.error("Error in cancelOrderAction:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error:
          "Invalid input data: " +
          error.errors.map((e) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Assign a shipper to an order
 */
export async function assignShipperAction(
  data: z.infer<typeof assignShipperSchema>
): Promise<ActionResponse> {
  try {
    // Input validation
    const validated = assignShipperSchema.parse(data);

    // Get server-side Supabase client
    const supabase = await getSupabaseServerClient();

    // Check that the user has admin/staff roles
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user metadata indicates admin/staff role
    const userRole = user.user.user_metadata?.role as string | undefined;
    if (userRole !== "admin" && userRole !== "staff") {
      return { success: false, error: "Insufficient permissions" };
    }

    // Update the order with assigned shipper
    const { error } = await supabase
      .from("orders")
      .update({
        assigned_shipper_id: validated.assigned_shipper_id,
      })
      .eq("id", validated.id);

    if (error) {
      console.error("Error assigning shipper:", error);
      return { success: false, error: error.message };
    }

    // Revalidate related paths
    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error) {
    console.error("Error in assignShipperAction:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error:
          "Invalid input data: " +
          error.errors.map((e) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
