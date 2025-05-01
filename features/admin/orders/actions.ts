"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  orderStatusUpdateSchema,
  cancelOrderSchema,
  assignShipperSchema,
  OrdersFilters,
  OrdersPagination,
  OrdersSort,
} from "./types";

// Type for action responses to ensure consistent return format
interface ActionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Fetch orders with filters, pagination and sorting
 * Server action that bypasses RLS using service role
 */
export async function fetchOrdersAction(
  filters?: OrdersFilters,
  pagination?: OrdersPagination,
  sort?: OrdersSort
): Promise<{ data: any[]; count: number | null }> {
  try {
    // Get admin client with service role key to bypass RLS
    const supabase = await createServiceRoleClient();

    let query = supabase.from("orders").select(
      `
        id, 
        access_token, 
        user_id, 
        assigned_shipper_id, 
        guest_name, 
        guest_email, 
        guest_phone, 
        recipient_name, 
        recipient_phone, 
        province_city, 
        district, 
        ward, 
        street_address, 
        order_date, 
        delivery_notes, 
        payment_method_id, 
        payment_status, 
        order_status_id, 
        discount_id, 
        subtotal_amount, 
        discount_amount, 
        shipping_fee, 
        total_amount, 
        cancellation_reason, 
        cancelled_by, 
        cancelled_by_user_id, 
        delivery_failure_reason, 
        delivery_failure_timestamp, 
        completed_at, 
        created_at, 
        updated_at,
        order_statuses(id, name),
        payment_methods(id, name)
      `,
      { count: "exact" }
    );

    // Apply filters
    if (filters) {
      // Search filter
      if (filters.search) {
        query = query.or(
          `id.eq.${
            !isNaN(Number.parseInt(filters.search))
              ? Number.parseInt(filters.search)
              : 0
          },recipient_name.ilike.%${filters.search}%,recipient_phone.ilike.%${
            filters.search
          }%,guest_name.ilike.%${filters.search}%,guest_phone.ilike.%${
            filters.search
          }%`
        );
      }

      // Status filter
      if (filters.status_id !== undefined && filters.status_id !== null) {
        query = query.eq("order_status_id", filters.status_id);
      }

      // Payment status filter
      if (filters.payment_status) {
        query = query.eq("payment_status", filters.payment_status);
      }

      // Date range filter
      if (filters.date_start) {
        query = query.gte("order_date", filters.date_start);
      }

      if (filters.date_end) {
        // Add one day to include the end date fully
        const nextDay = new Date(filters.date_end);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt("order_date", nextDay.toISOString());
      }

      // Assigned shipper filter
      if (filters.assigned_shipper_id) {
        if (filters.assigned_shipper_id === "unassigned") {
          query = query.is("assigned_shipper_id", null);
        } else {
          query = query.eq("assigned_shipper_id", filters.assigned_shipper_id);
        }
      }

      // Additional filters
      if (filters.has_delivery_issues === true) {
        query = query.not("delivery_failure_reason", "is", null);
      }

      if (filters.cancelled_order === true) {
        query = query.not("cancellation_reason", "is", null);
      }

      if (filters.user_id === "registered") {
        query = query.not("user_id", "is", null);
      }
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.column, {
        ascending: sort.direction === "asc",
      });
    } else {
      query = query.order("order_date", { ascending: false }); // Default sort
    }

    // Apply pagination
    if (pagination) {
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return { data, count };
  } catch (error) {
    console.error("Error in fetchOrdersAction:", error);
    throw error;
  }
}

/**
 * Fetch a single order's details by ID
 * Server action that bypasses RLS using service role
 */
export async function fetchOrderDetailsAction(orderId: number | string) {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Get admin client with service role key to bypass RLS
    const supabase = await createServiceRoleClient();

    // Fetch order details
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id, 
        access_token, 
        user_id, 
        assigned_shipper_id, 
        guest_name, 
        guest_email, 
        guest_phone, 
        recipient_name, 
        recipient_phone, 
        province_city, 
        district, 
        ward, 
        street_address, 
        order_date, 
        delivery_notes, 
        payment_method_id, 
        payment_status, 
        order_status_id, 
        discount_id, 
        subtotal_amount, 
        discount_amount, 
        shipping_fee, 
        total_amount, 
        cancellation_reason, 
        cancelled_by, 
        cancelled_by_user_id, 
        delivery_failure_reason, 
        delivery_failure_timestamp, 
        completed_at, 
        created_at, 
        updated_at,
        order_statuses(id, name),
        payment_methods(id, name),
        profiles(id, display_name, phone_number, avatar_url)
        `
      )
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching order details:", error);
      throw new Error(`Failed to fetch order details: ${error.message}`);
    }

    // Fetch order items for this order
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
        id, 
        order_id, 
        variant_id, 
        product_name, 
        variant_volume_ml, 
        quantity, 
        unit_price_at_order,
        product_variants(
          id, 
          product_id, 
          sku, 
          volume,
          price,
          products(
            id, 
            name,
            slug,
            brand_id,
            brands(id, name),
            product_images(id, image_url, is_main)
          )
        )
        `
      )
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
    }

    return {
      data,
      items: items || [],
    };
  } catch (error) {
    console.error("Error in fetchOrderDetailsAction:", error);
    throw error;
  }
}

/**
 * Fetch all available shippers (users with shipper role)
 * Server action that bypasses RLS using service role
 */
export async function fetchShippersAction() {
  try {
    // Get admin client with service role key to bypass RLS
    const supabase = await createServiceRoleClient();

    // Get users with shipper role
    const { data, error, count } = await supabase
      .from("profiles")
      .select(
        `
        id, 
        email, 
        display_name,
        avatar_url, 
        phone_number
      `,
        { count: "exact" }
      )
      .eq("role", "shipper")
      .order("display_name", { ascending: true });

    if (error) {
      console.error("Error fetching shippers:", error);
      throw new Error(`Failed to fetch shippers: ${error.message}`);
    }

    // Map to the expected format
    const shippers = data.map((shipper) => ({
      id: shipper.id,
      email: shipper.email,
      name: shipper.display_name || shipper.email?.split("@")[0] || "Unknown",
      phone_number: shipper.phone_number,
      avatar_url: shipper.avatar_url,
    }));

    return {
      data: shippers,
      count: count || shippers.length,
    };
  } catch (error) {
    console.error("Error in fetchShippersAction:", error);
    throw error;
  }
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

    // Get admin Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    // Update the order status
    const { error, data: updatedOrder } = await supabase
      .from("orders")
      .update({
        order_status_id: validated.order_status_id,
      })
      .eq("id", validated.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order status:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate related paths
    revalidatePath("/admin/orders");

    return {
      success: true,
      data: updatedOrder,
    };
  } catch (error) {
    console.error("Error in updateOrderStatusAction:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
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

    // Get admin Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    // Check for current user info for audit purposes
    const { data: currentUser, error: userError } =
      await supabase.auth.getUser();
    if (userError) {
      return {
        success: false,
        error: `Authentication error: ${userError.message}`,
      };
    }

    // Update the order to cancelled status
    const { error, data: updatedOrder } = await supabase
      .from("orders")
      .update({
        order_status_id: 5, // Assuming 5 is "Cancelled" status ID
        cancellation_reason: validated.reason,
        cancelled_by: "Admin/Staff",
        cancelled_by_user_id: currentUser.user?.id || null,
      })
      .eq("id", validated.id)
      .select()
      .single();

    if (error) {
      console.error("Error cancelling order:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate related paths
    revalidatePath("/admin/orders");

    return {
      success: true,
      data: updatedOrder,
    };
  } catch (error) {
    console.error("Error in cancelOrderAction:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
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

    // Get admin Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    // Update the order with assigned shipper
    const { error, data: updatedOrder } = await supabase
      .from("orders")
      .update({
        assigned_shipper_id: validated.assigned_shipper_id,
      })
      .eq("id", validated.id)
      .select()
      .single();

    if (error) {
      console.error("Error assigning shipper:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate related paths
    revalidatePath("/admin/orders");

    return {
      success: true,
      data: updatedOrder,
    };
  } catch (error) {
    console.error("Error in assignShipperAction:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
