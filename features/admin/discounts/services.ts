"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  CreateDiscountInput,
  UpdateDiscountInput,
  createDiscountAction,
  updateDiscountAction,
} from "./actions";
import { Discount, DiscountFilter } from "./types";

/**
 * Fetch discounts with optional filtering and search
 */
export async function fetchDiscounts(
  search?: string,
  filter?: DiscountFilter
): Promise<{ data: Discount[]; count: number | null }> {
  const supabase = getSupabaseBrowserClient();
  const now = new Date().toISOString();

  // Initialize query with proper table reference
  let query = supabase.from("discounts").select("*", { count: "exact" });

  // Apply search filter if provided
  if (search) {
    query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Apply status filter
  if (filter) {
    switch (filter) {
      case "active":
        query = query
          .eq("is_active", true)
          .or(`start_date.is.null,start_date.lte.${now}`)
          .or(`end_date.is.null,end_date.gt.${now}`)
          .or(`remaining_uses.is.null,remaining_uses.gt.0`);
        break;
      case "inactive":
        query = query.eq("is_active", false);
        break;
      case "expired":
        query = query.lte("end_date", now).not("end_date", "is", null);
        break;
      case "upcoming":
        query = query.gt("start_date", now).not("start_date", "is", null);
        break;
    }
  }

  // Sort by creation date (newest first)
  query = query.order("created_at", { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching discounts:", error);
    throw new Error(`Error fetching discounts: ${error.message}`);
  }

  return { data: data || [], count };
}

/**
 * Create a new discount using server action
 */
export async function createDiscount(data: CreateDiscountInput) {
  return createDiscountAction(data);
}

/**
 * Update an existing discount using server action
 */
export async function updateDiscount(data: UpdateDiscountInput) {
  return updateDiscountAction(data);
}
