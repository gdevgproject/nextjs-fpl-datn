import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  Banner,
  BannersFilters,
  BannersPagination,
  BannersSort,
} from "./types";

/**
 * Fetch banners with filters, pagination and sorting
 * This service can be used both in hooks and server components
 */
export async function fetchBanners(
  filters?: BannersFilters,
  pagination?: BannersPagination,
  sort?: BannersSort
) {
  const supabase = getSupabaseBrowserClient();
  const columns = `id, title, subtitle, image_url, link_url, is_active, display_order, start_date, end_date, created_at, updated_at`;

  // Start building the query
  let query = supabase.from("banners").select(columns, { count: "exact" });

  // Apply search filter
  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  // Apply active filter
  if (filters?.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }

  // Apply pagination
  if (pagination) {
    const { page, pageSize } = pagination;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  // Apply sorting
  if (sort) {
    query = query.order(sort.column, {
      ascending: sort.direction === "asc",
    });
  } else {
    query = query.order("display_order", { ascending: true });
  }

  // Execute the query
  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Error fetching banners: ${error.message}`);
  }

  return {
    data: data as Banner[],
    count: count || 0,
  };
}

/**
 * Fetch a single banner by ID
 */
export async function fetchBannerById(id: number) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("banners")
    .select(
      `id, title, subtitle, image_url, link_url, is_active, display_order, start_date, end_date, created_at, updated_at`
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Error fetching banner: ${error.message}`);
  }

  return data as Banner;
}

/**
 * Check if a banner is active based on dates and is_active flag
 * Utility function for frontend components
 */
export function isBannerActive(banner: Banner): boolean {
  if (!banner.is_active) return false;

  const now = new Date();

  if (banner.start_date && new Date(banner.start_date) > now) return false;
  if (banner.end_date && new Date(banner.end_date) < now) return false;

  return true;
}

/**
 * Helper function to extract path from banner image URL
 */
export function extractPathFromImageUrl(url: string): string | null {
  if (!url) return null;

  // URL format: https://xxx.supabase.co/storage/v1/object/public/banners/123/image.png
  const urlParts = url.split("/banners/");
  if (urlParts.length <= 1) return null;

  return urlParts[1];
}
