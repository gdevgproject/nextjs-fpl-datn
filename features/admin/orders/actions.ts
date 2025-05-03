"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createServiceRoleClient,
  getSupabaseServerClient,
} from "@/lib/supabase/server";
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

    // Fetch order details with payment method and order status in a single query
    // Chỉ truy vấn các cột thực sự tồn tại trong bảng
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
        order_statuses (id, name),
        payment_methods (id, name)
        `
      )
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching order details:", error);
      throw new Error(`Failed to fetch order details: ${error.message}`);
    }

    // Create enhanced order object with all related data
    const enhancedOrder = { ...data };

    // Optimize: Fetch both user and shipper profiles in a single query if they exist
    const userIds = [];
    if (data?.user_id) userIds.push(data.user_id);
    if (
      data?.assigned_shipper_id &&
      data.assigned_shipper_id !== data.user_id
    ) {
      userIds.push(data.assigned_shipper_id);
    }

    if (userIds.length > 0) {
      // Fetch profiles for user and/or shipper in a single query
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name, phone_number, avatar_url, created_at")
        .in("id", userIds);

      if (!profilesError && profiles) {
        // Find user profile if it exists
        if (data.user_id) {
          const userProfile = profiles.find((p) => p.id === data.user_id);
          enhancedOrder.profiles = userProfile || null;

          // Get auth user data for email (only needed for user, not shipper)
          try {
            const { data: userData, error: userError } =
              await supabase.auth.admin.getUserById(data.user_id);

            if (!userError && userData) {
              // Combine profile and auth data correctly
              enhancedOrder.user = {
                id: data.user_id,
                email: userData.user?.email || null, // Email from auth.users
                phone: userProfile?.phone_number || null, // Phone from profiles
                created_at:
                  userData.user?.created_at || userProfile?.created_at || null,
                last_sign_in_at: userData.user?.last_sign_in_at || null,
                is_anonymous: !userData.user?.email,
                user_metadata: userData.user?.user_metadata || {},
              };
            }
          } catch (authError) {
            console.error("Error fetching auth user data:", authError);
          }
        }

        // Find shipper profile if it exists
        if (data.assigned_shipper_id) {
          const shipperProfile = profiles.find(
            (p) => p.id === data.assigned_shipper_id
          );
          enhancedOrder.shipper_profile = shipperProfile || null;
        }
      } else {
        console.warn("Could not fetch profiles:", profilesError);
      }
    }

    // Fetch order items for this order with optimized query to include images
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
        product_variants!inner (
          id, 
          product_id, 
          sku, 
          volume_ml,
          price,
          sale_price,
          products!inner (
            id, 
            name,
            slug,
            brand_id,
            brands (id, name)
          )
        )
        `
      )
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
    }

    // Optimize: Fetch product images in a single query instead of for each item
    let itemsWithImages = items || [];

    if (items && items.length > 0) {
      // Get all unique product IDs from the items
      const productIds = Array.from(
        new Set(
          items
            .map((item) => item.product_variants?.products?.id)
            .filter(Boolean)
        )
      );

      if (productIds.length > 0) {
        // Fetch all product images in a single query
        const { data: productImages, error: imagesError } = await supabase
          .from("product_images")
          .select("id, product_id, image_url, is_main") // Correct column name: image_url not url
          .in("product_id", productIds);

        if (!imagesError && productImages) {
          // Map the images to their respective products
          itemsWithImages = items.map((item) => {
            const productId = item.product_variants?.products?.id;
            if (!productId) return item;

            // Find all images for this product
            const images = productImages.filter(
              (img) => img.product_id === productId
            );

            return {
              ...item,
              product_variants: {
                ...item.product_variants,
                product_images: images, // Add images directly to product_variants
                products: {
                  ...item.product_variants?.products,
                  // We also keep images in the original location for backward compatibility
                  product_images: images,
                },
              },
            };
          });
        } else if (imagesError) {
          console.error("Error fetching product images:", imagesError);
        }
      }
    }

    return {
      data: enhancedOrder,
      items: itemsWithImages,
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

    // Query users with shipper role from auth.users table
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching users:", error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    // Filter users with shipper role and join with profiles
    const shippers = [];
    for (const user of data.users) {
      // Check if user has shipper role in user metadata
      if (user.user_metadata?.role === "shipper") {
        // Get profile data for this user
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, phone_number")
          .eq("id", user.id)
          .single();

        shippers.push({
          id: user.id,
          email: user.email,
          name: profile?.display_name || user.email?.split("@")[0] || "Unknown",
          phone_number: profile?.phone_number,
          avatar_url: profile?.avatar_url,
        });
      }
    }

    return {
      data: shippers,
      count: shippers.length,
    };
  } catch (error) {
    console.error("Error in fetchShippersAction:", error);
    throw error;
  }
}

/**
 * Update the status of an order with enhanced validation
 */
export async function updateOrderStatusAction(
  data: z.infer<typeof orderStatusUpdateSchema>
): Promise<ActionResponse> {
  try {
    // Input validation
    const validated = orderStatusUpdateSchema.parse(data);

    // Get server Supabase client to access user session
    const supabaseServer = await getSupabaseServerClient();

    // Get current user info for audit purposes - using server-side session
    const { data: userData, error: userError } =
      await supabaseServer.auth.getUser();

    if (userError || !userData?.user) {
      return {
        success: false,
        error: `Authentication error: ${
          userError?.message || "No authenticated user found"
        }`,
      };
    }

    // Get admin Supabase client with service role to bypass RLS for DB operations
    const supabase = await createServiceRoleClient();

    // No need to fetch user data again, we already have it
    const userId = userData.user.id;

    // Fetch the current order to check what status change is happening
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        id, 
        order_status_id, 
        payment_status, 
        payment_method_id, 
        assigned_shipper_id,
        order_statuses(id, name)
      `
      )
      .eq("id", validated.id)
      .single();

    if (orderError) {
      return {
        success: false,
        error: `Error fetching order: ${orderError.message}`,
      };
    }

    // Fetch the new status to compare
    const { data: newStatus, error: statusError } = await supabase
      .from("order_statuses")
      .select("id, name")
      .eq("id", validated.order_status_id)
      .single();

    if (statusError) {
      return {
        success: false,
        error: `Error fetching status: ${statusError.message}`,
      };
    }

    // Server-side validation of status transitions
    // Check if order is already cancelled
    if (order.order_statuses.name === "Đã hủy") {
      return {
        success: false,
        error: "Không thể thay đổi trạng thái của đơn hàng đã hủy.",
      };
    }

    // Check for transition from "Đã xác nhận" or "Đang xử lý" to "Đang giao"
    if (newStatus.name === "Đang giao") {
      // Check for assigned shipper
      if (!order.assigned_shipper_id) {
        return {
          success: false,
          error:
            "Không thể chuyển sang trạng thái Đang giao khi chưa gán shipper.",
        };
      }

      // Check payment status for non-COD orders
      if (order.payment_method_id !== 1 && order.payment_status !== "Paid") {
        return {
          success: false,
          error:
            "Không thể chuyển sang trạng thái Đang giao khi đơn thanh toán online chưa được thanh toán.",
        };
      }
    }

    // Check for transition from "Đã giao" to "Đã hoàn thành"
    if (newStatus.name === "Đã hoàn thành" && order.payment_status !== "Paid") {
      return {
        success: false,
        error: "Không thể hoàn thành đơn hàng chưa được thanh toán.",
      };
    }

    // Update the order status with additional information
    const updateData: any = {
      order_status_id: validated.order_status_id,
    };

    // If moving to "Đã hoàn thành", record the completion timestamp
    if (newStatus.name === "Đã hoàn thành") {
      updateData.completed_at = new Date().toISOString();
    }

    // Perform the update
    const { error, data: updatedOrder } = await supabase
      .from("orders")
      .update(updateData)
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

    // Insert an entry into the order status history for auditing
    await supabase.from("order_status_history").insert({
      order_id: validated.id,
      previous_status_id: order.order_status_id,
      new_status_id: validated.order_status_id,
      changed_by_user_id: userData.user.id,
      note: validated.internal_note || null,
    });

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

    // Get server Supabase client to access user session
    const supabaseServer = await getSupabaseServerClient();

    // Get current user info for audit purposes using server-side session
    const { data: userData, error: userError } =
      await supabaseServer.auth.getUser();

    if (userError || !userData?.user) {
      return {
        success: false,
        error: `Authentication error: ${
          userError?.message || "No authenticated user found"
        }`,
      };
    }

    // Get admin Supabase client with service role to bypass RLS for DB operations
    const supabase = await createServiceRoleClient();

    // Update the order to cancelled status
    const { error, data: updatedOrder } = await supabase
      .from("orders")
      .update({
        order_status_id: 7, // Based on your schema, "Đã hủy" status ID
        cancellation_reason: validated.reason,
        cancelled_by: "Admin/Staff",
        cancelled_by_user_id: userData.user.id,
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
