"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { productSchema, productVariantSchema, productImageSchema } from "./types";
import { StorageError } from "@supabase/storage-js";
import { PostgrestError } from "@supabase/supabase-js";
import { z } from "zod";

/**
 * Create a new product
 */
export async function createProductAction(formData: z.infer<typeof productSchema>) {
  try {
    // Server-side validation with Zod
    const validatedData = productSchema.parse(formData);
    
    const supabase = await getSupabaseServerClient();
    
    // Check user authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized", success: false };
    }
    
    const { data, error } = await supabase
      .from("products")
      .insert(validatedData)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating product:", error);
      return { error: error.message, success: false };
    }
    
    // Revalidate the products list path
    revalidatePath("/admin/catalog/products");
    
    return { data, success: true };
  } catch (error) {
    console.error("Error in createProductAction:", error);
    if (error instanceof z.ZodError) {
      return { 
        error: "Validation error", 
        validationErrors: error.errors,
        success: false 
      };
    }
    return { error: "Failed to create product", success: false };
  }
}

/**
 * Update an existing product
 */
export async function updateProductAction(id: number, formData: z.infer<typeof productSchema>) {
  try {
    // Server-side validation with Zod
    const validatedData = productSchema.parse(formData);
    
    const supabase = await getSupabaseServerClient();
    
    // Check user authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized", success: false };
    }
    
    const { data, error } = await supabase
      .from("products")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating product:", error);
      return { error: error.message, success: false };
    }
    
    // Revalidate the products list and detail paths
    revalidatePath("/admin/catalog/products");
    revalidatePath(`/admin/catalog/products/${id}`);
    
    return { data, success: true };
  } catch (error) {
    console.error("Error in updateProductAction:", error);
    if (error instanceof z.ZodError) {
      return { 
        error: "Validation error", 
        validationErrors: error.errors,
        success: false 
      };
    }
    return { error: "Failed to update product", success: false };
  }
}

/**
 * Soft delete a product by setting the deleted_at timestamp
 */
export async function softDeleteProductAction(id: number) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Check user authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized", success: false };
    }
    
    const { data, error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      console.error("Error soft deleting product:", error);
      return { error: error.message, success: false };
    }
    
    // Revalidate the products list path
    revalidatePath("/admin/catalog/products");
    
    return { data, success: true };
  } catch (error) {
    console.error("Error in softDeleteProductAction:", error);
    return { error: "Failed to delete product", success: false };
  }
}

/**
 * Restore a soft deleted product
 */
export async function restoreProductAction(id: number) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Check user authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized", success: false };
    }
    
    const { data, error } = await supabase
      .from("products")
      .update({ deleted_at: null })
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      console.error("Error restoring product:", error);
      return { error: error.message, success: false };
    }
    
    // Revalidate the products list path
    revalidatePath("/admin/catalog/products");
    
    return { data, success: true };
  } catch (error) {
    console.error("Error in restoreProductAction:", error);
    return { error: "Failed to restore product", success: false };
  }
}

/**
 * Hard delete a product (including related records and storage files)
 */
export async function hardDeleteProductAction(id: number) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Check user authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized", success: false };
    }
    
    // First get all image URLs to delete from storage
    const { data: images, error: fetchError } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", id);
      
    if (fetchError) {
      console.error("Error fetching product images before delete:", fetchError);
    }
    
    // Delete the product (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
      
    if (deleteError) {
      console.error("Error hard deleting product:", deleteError);
      return { error: deleteError.message, success: false };
    }
    
    // Delete images from storage if any were found
    if (images && images.length > 0) {
      const paths = images
        .map(img => {
          try {
            // Extract path from URL: https://xxx.supabase.co/storage/v1/object/public/products/path
            const parts = img.image_url.split('/products/');
            return parts.length > 1 ? parts[1] : null;
          } catch (e) {
            console.error("Error extracting path from URL:", e);
            return null;
          }
        })
        .filter(Boolean) as string[];
      
      if (paths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("products")
          .remove(paths);
          
        if (storageError) {
          console.error("Error deleting product images from storage:", storageError);
          // We don't fail the operation if image deletion fails
        }
      }
    }
    
    // Revalidate the products list path
    revalidatePath("/admin/catalog/products");
    
    return { success: true, id };
  } catch (error) {
    console.error("Error in hardDeleteProductAction:", error);
    return { error: "Failed to permanently delete product", success: false };
  }
}

/**
 * Create a product variant
 */
export async function createProductVariantAction(
  productId: number, 
  formData: z.infer<typeof productVariantSchema>
) {
  try {
    // Extract and transform the data
    const validatedData = productVariantSchema.parse(formData);
    
    // Convert string values to numbers
    const payload = {
      product_id: productId,
      volume_ml: parseInt(validatedData.volume_ml, 10),
      price: parseFloat(validatedData.price),
      sale_price: validatedData.sale_price && validatedData.sale_price !== "" 
        ? parseFloat(validatedData.sale_price) 
        : null,
      sku: validatedData.sku,
      stock_quantity: parseInt(validatedData.stock_quantity, 10)
    };
    
    const supabase = await getSupabaseServerClient();
    
    // Check user authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized", success: false };
    }
    
    const { data, error } = await supabase
      .from("product_variants")
      .insert(payload)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating product variant:", error);
      return { error: error.message, success: false };
    }
    
    // Add inventory log entry for initial stock
    if (payload.stock_quantity > 0) {
      const { error: inventoryError } = await supabase
        .from("inventory")
        .insert({
          variant_id: data.id,
          quantity_change: payload.stock_quantity,
          stock_after_change: payload.stock_quantity,
          reason: "Initial stock setup",
          updated_by: user.id
        });
        
      if (inventoryError) {
        console.error("Error creating inventory log entry:", inventoryError);
        // Don't fail the operation if inventory log fails
      }
    }
    
    // Revalidate paths
    revalidatePath("/admin/catalog/products");
    revalidatePath(`/admin/catalog/products/${productId}`);
    
    return { data, success: true };
  } catch (error) {
    console.error("Error in createProductVariantAction:", error);
    if (error instanceof z.ZodError) {
      return { 
        error: "Validation error", 
        validationErrors: error.errors,
        success: false 
      };
    }
    return { error: "Failed to create product variant", success: false };
  }
}

/**
 * Update a product variant
 */
export async function updateProductVariantAction(
  variantId: number, 
  productId: number,
  formData: z.infer<typeof productVariantSchema>
) {
  try {
    // Extract and transform the data
    const validatedData = productVariantSchema.parse(formData);
    
    // Convert string values to numbers
    const payload = {
      volume_ml: parseInt(validatedData.volume_ml, 10),
      price: parseFloat(validatedData.price),
      sale_price: validatedData.sale_price && validatedData.sale_price !== "" 
        ? parseFloat(validatedData.sale_price) 
        : null,
      sku: validatedData.sku,
      stock_quantity: parseInt(validatedData.stock_quantity, 10)
    };
    
    const supabase = await getSupabaseServerClient();
    
    // Check user authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized", success: false };
    }
    
    // Get current stock quantity
    const { data: currentVariant, error: fetchError } = await supabase
      .from("product_variants")
      .select("stock_quantity")
      .eq("id", variantId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching current variant data:", fetchError);
      return { error: fetchError.message, success: false };
    }
    
    // Update the variant
    const { data, error } = await supabase
      .from("product_variants")
      .update(payload)
      .eq("id", variantId)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating product variant:", error);
      return { error: error.message, success: false };
    }
    
    // Add inventory log entry if stock quantity changed
    if (currentVariant && currentVariant.stock_quantity !== payload.stock_quantity) {
      const quantityChange = payload.stock_quantity - currentVariant.stock_quantity;
      
      const { error: inventoryError } = await supabase
        .from("inventory")
        .insert({
          variant_id: variantId,
          quantity_change: quantityChange,
          stock_after_change: payload.stock_quantity,
          reason: "Manual stock adjustment",
          updated_by: user.id
        });
        
      if (inventoryError) {
        console.error("Error creating inventory log entry:", inventoryError);
        // Don't fail the operation if inventory log fails
      }
    }
    
    // Revalidate paths
    revalidatePath("/admin/catalog/products");
    revalidatePath(`/admin/catalog/products/${productId}`);
    
    return { data, success: true };
  } catch (error) {
    console.error("Error in updateProductVariantAction:", error);
    if (error instanceof z.ZodError) {
      return { 
        error: "Validation error", 
        validationErrors: error.errors,
        success: false 
      };
    }
    return { error: "Failed to update product variant", success: false };
  }
}

/**
 * Update product categories (batch operation)
 */
export async function updateProductCategoriesAction(productId: number, categoryIds: number[]) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Check user authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized", success: false };
    }
    
    // First, delete all existing category associations
    const { error: deleteError } = await supabase
      .from("product_categories")
      .delete()
      .eq("product_id", productId);
      
    if (deleteError) {
      console.error("Error deleting existing product categories:", deleteError);
      return { error: deleteError.message, success: false };
    }
    
    // Then, insert new category associations
    if (categoryIds.length > 0) {
      const categoryInserts = categoryIds.map(categoryId => ({
        product_id: productId,
        category_id: categoryId,
      }));
      
      const { error: insertError } = await supabase
        .from("product_categories")
        .insert(categoryInserts);
        
      if (insertError) {
        console.error("Error inserting new product categories:", insertError);
        return { error: insertError.message, success: false };
      }
    }
    
    // Revalidate paths
    revalidatePath("/admin/catalog/products");
    revalidatePath(`/admin/catalog/products/${productId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error in updateProductCategoriesAction:", error);
    return { error: "Failed to update product categories", success: false };
  }
}

/**
 * Update product ingredients (batch operation)
 */
export async function updateProductIngredientsAction(
  productId: number, 
  ingredients: Array<{
    ingredientId: number;
    scentType: "top" | "middle" | "base";
  }>
) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Check user authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized", success: false };
    }
    
    // First, delete all existing ingredient associations
    const { error: deleteError } = await supabase
      .from("product_ingredients")
      .delete()
      .eq("product_id", productId);
      
    if (deleteError) {
      console.error("Error deleting existing product ingredients:", deleteError);
      return { error: deleteError.message, success: false };
    }
    
    // Then, insert new ingredient associations
    if (ingredients.length > 0) {
      const ingredientInserts = ingredients.map(item => ({
        product_id: productId,
        ingredient_id: item.ingredientId,
        scent_type: item.scentType,
      }));
      
      const { error: insertError } = await supabase
        .from("product_ingredients")
        .insert(ingredientInserts);
        
      if (insertError) {
        console.error("Error inserting new product ingredients:", insertError);
        return { error: insertError.message, success: false };
      }
    }
    
    // Revalidate paths
    revalidatePath("/admin/catalog/products");
    revalidatePath(`/admin/catalog/products/${productId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error in updateProductIngredientsAction:", error);
    return { error: "Failed to update product ingredients", success: false };
  }
}

/**
 * Delete a product image and remove it from storage
 */
export async function deleteProductImageAction(imageId: number, imageUrl: string) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Check user authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized", success: false };
    }
    
    // Get product ID first for revalidation
    const { data: imageData, error: fetchError } = await supabase
      .from("product_images")
      .select("product_id")
      .eq("id", imageId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching product image:", fetchError);
      return { error: fetchError.message, success: false };
    }
    
    const productId = imageData?.product_id;
    
    // Delete from database
    const { error: dbError } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);
      
    if (dbError) {
      console.error("Error deleting product image from database:", dbError);
      return { error: dbError.message, success: false };
    }
    
    // Delete from storage
    try {
      // Extract path from URL: https://xxx.supabase.co/storage/v1/object/public/products/path
      const parts = imageUrl.split('/products/');
      const path = parts.length > 1 ? parts[1] : null;
      
      if (path) {
        const { error: storageError } = await supabase.storage
          .from("products")
          .remove([path]);
          
        if (storageError) {
          console.error("Error deleting product image from storage:", storageError);
          // Log but don't fail if storage deletion fails
        }
      }
    } catch (e) {
      console.error("Error processing image URL for deletion:", e);
    }
    
    // Revalidate paths
    if (productId) {
      revalidatePath("/admin/catalog/products");
      revalidatePath(`/admin/catalog/products/${productId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in deleteProductImageAction:", error);
    return { error: "Failed to delete product image", success: false };
  }
}

/**
 * Add product image with metadata
 */
export async function createProductImageAction(
  productId: number,
  imageUrl: string,
  isMain: boolean = false,
  altText: string = "",
  displayOrder: number = 0
) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Check user authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unauthorized", success: false };
    }
    
    // If this is set as main image, unset any existing main image
    if (isMain) {
      const { error: updateError } = await supabase
        .from("product_images")
        .update({ is_main: false })
        .eq("product_id", productId)
        .eq("is_main", true);
        
      if (updateError) {
        console.error("Error updating existing main image:", updateError);
        // Continue with the insertion anyway
      }
    }
    
    // Create the new image record
    const { data, error } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        image_url: imageUrl,
        alt_text: altText || null,
        is_main: isMain,
        display_order: displayOrder
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating product image:", error);
      return { error: error.message, success: false };
    }
    
    // Revalidate paths
    revalidatePath("/admin/catalog/products");
    revalidatePath(`/admin/catalog/products/${productId}`);
    
    return { data, success: true };
  } catch (error) {
    console.error("Error in createProductImageAction:", error);
    return { error: "Failed to create product image", success: false };
  }
}