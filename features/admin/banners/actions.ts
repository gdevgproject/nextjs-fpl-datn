"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  bannerSchema,
  CreateBannerData,
  UpdateBannerData,
  DeleteBannerData,
} from "./types";

/**
 * Create a new banner
 */
export async function createBannerAction(data: CreateBannerData) {
  try {
    // Server-side validation
    const validatedData = bannerSchema.parse(data);

    // Format dates for database
    const formattedData = {
      ...validatedData,
      start_date: validatedData.start_date
        ? validatedData.start_date.toISOString()
        : null,
      end_date: validatedData.end_date
        ? validatedData.end_date.toISOString()
        : null,
    };

    const supabase = await getSupabaseServerClient();

    // Check if the user has admin privileges (RLS will block if not)
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      throw new Error("Authentication error: " + userError.message);
    }

    // Create banner in database
    const { data: banner, error } = await supabase
      .from("banners")
      .insert(formattedData)
      .select("*")
      .single();

    if (error) {
      throw new Error("Failed to create banner: " + error.message);
    }

    // Revalidate the banners page to reflect changes
    revalidatePath("/admin/marketing/banners");

    return banner;
  } catch (error) {
    // Return the error to be handled by the client
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Unknown error occurred" };
  }
}

/**
 * Update an existing banner
 */
export async function updateBannerAction(data: UpdateBannerData) {
  try {
    const { id, ...updateData } = data;

    // Validate the update data
    const validatedData = bannerSchema.partial().parse(updateData);

    // Format dates for database
    const formattedData = {
      ...validatedData,
      start_date: validatedData.start_date
        ? validatedData.start_date.toISOString()
        : undefined,
      end_date: validatedData.end_date
        ? validatedData.end_date.toISOString()
        : undefined,
    };

    const supabase = await getSupabaseServerClient();

    // Check if the user has admin privileges (RLS will block if not)
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      throw new Error("Authentication error: " + userError.message);
    }

    // Update banner in database
    const { data: banner, error } = await supabase
      .from("banners")
      .update(formattedData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error("Failed to update banner: " + error.message);
    }

    // Revalidate the banners page to reflect changes
    revalidatePath("/admin/marketing/banners");

    return banner;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Unknown error occurred" };
  }
}

/**
 * Delete a banner
 */
export async function deleteBannerAction({ id }: DeleteBannerData) {
  try {
    const supabase = await getSupabaseServerClient();

    // Check if the user has admin privileges (RLS will block if not)
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      throw new Error("Authentication error: " + userError.message);
    }

    // First fetch the banner to get the image URL
    const { data: banner, error: fetchError } = await supabase
      .from("banners")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(
        "Failed to fetch banner before deletion: " + fetchError.message
      );
    }

    // Delete the banner from the database
    const { data, error } = await supabase
      .from("banners")
      .delete()
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error("Failed to delete banner: " + error.message);
    }

    // Delete the image from storage if it exists
    if (banner?.image_url) {
      try {
        // Extract path from URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/banners/123/image.png
        const urlParts = banner.image_url.split("/banners/");
        if (urlParts.length > 1) {
          const path = urlParts[1];
          await supabase.storage.from("banners").remove([path]);
        }
      } catch (storageError) {
        console.error("Failed to delete banner image:", storageError);
        // Continue with the deletion process even if the image deletion fails
      }
    }

    // Revalidate the banners page to reflect changes
    revalidatePath("/admin/marketing/banners");

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Unknown error occurred" };
  }
}

/**
 * Upload a banner image to storage
 */
export async function uploadBannerImageAction(
  file: File,
  path?: string,
  options?: {
    contentType?: string;
    upsert?: boolean;
    bannerId?: number;
  }
) {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    const supabase = await getSupabaseServerClient();

    // Generate path if not provided
    let uploadPath = path;
    if (!uploadPath) {
      const fileExt = file.name.split(".").pop() || "png";
      if (options?.bannerId) {
        uploadPath = `${options.bannerId}/image.${fileExt}`;
      } else {
        const uuid = crypto.randomUUID();
        uploadPath = `${uuid}.${fileExt}`;
      }
    }

    // Upload the file
    const { data, error } = await supabase.storage
      .from("banners")
      .upload(uploadPath, file, {
        contentType: options?.contentType || file.type,
        upsert: options?.upsert || false,
      });

    if (error) {
      throw new Error("Failed to upload banner image: " + error.message);
    }

    // Get the public URL
    const publicUrl = supabase.storage.from("banners").getPublicUrl(data.path)
      .data.publicUrl;

    return { path: data.path, publicUrl };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Unknown error occurred" };
  }
}

/**
 * Delete a banner image from storage
 */
export async function deleteBannerImageAction(path: string) {
  try {
    const supabase = await getSupabaseServerClient();

    // Delete the file
    const { data, error } = await supabase.storage
      .from("banners")
      .remove([path]);

    if (error) {
      throw new Error("Failed to delete banner image: " + error.message);
    }

    return data || [path];
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Unknown error occurred" };
  }
}

/**
 * Delete a banner image from a URL
 */
export async function deleteBannerImageByUrlAction(url: string) {
  try {
    if (!url) {
      throw new Error("No URL provided");
    }

    // Extract path from URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/banners/123/image.png
    const urlParts = url.split("/banners/");
    if (urlParts.length <= 1) {
      throw new Error("Invalid banner image URL format");
    }

    const path = urlParts[1];
    return await deleteBannerImageAction(path);
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Unknown error occurred" };
  }
}
