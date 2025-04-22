"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import type { UserExtended, UserFilter } from "./types";

/**
 * Fetches users with pagination and filtering
 */
export async function fetchUsers(filter: UserFilter) {
  try {
    const supabase = await createServiceRoleClient();

    // Construct the query for users from the auth.users table using admin API
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers({
      perPage: filter.perPage,
      page: filter.page,
    });

    if (error) throw error;

    // If we have users, get their profiles for additional info
    if (users && users.length > 0) {
      // Extract user IDs
      const userIds = users.map((user) => user.id);

      // Get profiles for these users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      // Combine auth users with their profiles
      const extendedUsers: UserExtended[] = users.map((user) => {
        const profile = profiles?.find((p) => p.id === user.id);
        const metadata = user.user_metadata || {};
        const appMetadata = user.app_metadata || {};

        return {
          id: user.id,
          email: user.email || "",
          display_name:
            profile?.display_name ||
            metadata.display_name ||
            user.email?.split("@")[0] ||
            "",
          phone_number: profile?.phone_number || metadata.phone_number || null,
          role: appMetadata.role || "user",
          is_blocked: user.banned || false,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
          avatar_url: profile?.avatar_url || null,
        };
      });

      // Apply filtering
      let filteredUsers = extendedUsers;

      // Filter by search term
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.email.toLowerCase().includes(searchLower) ||
            user.display_name?.toLowerCase().includes(searchLower) ||
            user.phone_number?.toLowerCase().includes(searchLower)
        );
      }

      // Filter by role
      if (filter.role !== "all") {
        filteredUsers = filteredUsers.filter(
          (user) => user.role === filter.role
        );
      }

      // Filter by status
      if (filter.status === "active") {
        filteredUsers = filteredUsers.filter((user) => !user.is_blocked);
      } else if (filter.status === "blocked") {
        filteredUsers = filteredUsers.filter((user) => user.is_blocked);
      }

      // Return the filtered users
      return {
        users: filteredUsers,
        total: extendedUsers.length, // Without filters
        filteredTotal: filteredUsers.length, // With filters applied
      };
    }

    return { users: [], total: 0, filteredTotal: 0 };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

/**
 * Fetches a single user with detailed information
 */
export async function fetchUserDetails(userId: string) {
  try {
    const supabase = await createServiceRoleClient();

    // Get the user from Auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById(userId);
    if (userError) throw userError;
    if (!user) throw new Error("User not found");

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (profileError && profileError.code !== "PGRST116") throw profileError; // Ignore not found errors

    // Get user addresses
    const { data: addresses, error: addressError } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });
    if (addressError) throw addressError;

    // Get user orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id, 
        order_number,
        created_at,
        subtotal_amount,
        discount_amount,
        shipping_fee,
        total_amount,
        order_status_id,
        payment_status,
        order_statuses(name)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (ordersError) throw ordersError;

    // Get user reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select(
        `
        id,
        product_id,
        rating,
        comment,
        is_approved,
        created_at,
        products(name, slug)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (reviewsError) throw reviewsError;

    // Get user wishlists
    const { data: wishlists, error: wishlistsError } = await supabase
      .from("wishlists")
      .select(
        `
        id,
        product_id,
        created_at,
        products(name, slug, brand_id, brands(name))
      `
      )
      .eq("user_id", userId);
    if (wishlistsError) throw wishlistsError;

    // Combine all data
    const metadata = user.user_metadata || {};
    const appMetadata = user.app_metadata || {};

    const userDetails = {
      id: user.id,
      email: user.email || "",
      display_name:
        profile?.display_name ||
        metadata.display_name ||
        user.email?.split("@")[0] ||
        "",
      phone_number: profile?.phone_number || metadata.phone_number || null,
      role: appMetadata.role || "user",
      is_blocked: user.banned || false,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      avatar_url: profile?.avatar_url || null,
      gender: profile?.gender || null,
      birth_date: profile?.birth_date || null,
      is_subscribed_to_newsletter:
        profile?.is_subscribed_to_newsletter || false,
      addresses: addresses || [],
      orders: orders || [],
      reviews: reviews || [],
      wishlists: wishlists || [],
    };

    return userDetails;
  } catch (error) {
    console.error(`Error fetching user details for ${userId}:`, error);
    throw error;
  }
}
