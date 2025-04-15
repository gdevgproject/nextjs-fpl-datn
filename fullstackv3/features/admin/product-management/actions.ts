"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { getUserRoleFromMetadata } from "@/lib/utils/auth-utils"
import { productFilterSchema, productFormSchema, inventoryAdjustmentSchema } from "./schemas"
import type {
  ProductListParams,
  ProductListResponse,
  ProductDetailResponse,
  ProductMutationResponse,
  ProductFormData,
  BulkActionParams,
  BulkCategoryActionParams,
  BulkLabelActionParams,
  BulkActionResponse,
  StockAdjustmentParams,
} from "./types"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

// Helper function to get a service role client
async function getServiceRoleClient() {
  return await createServiceRoleClient()
}

// Get products with filtering, sorting, and pagination
export async function getProducts(params: ProductListParams): Promise<ProductListResponse> {
  try {
    // Parse and validate filter parameters
    const validParams = productFilterSchema.parse(params)

    // Get the Supabase client
    const supabase = await getSupabaseServerClient()

    // Build the base query
    let query = supabase.from("products").select(
      `
        id,
        name,
        product_code,
        created_at,
        updated_at,
        deleted_at,
        brand:brand_id (id, name),
        variants:product_variants (
          id,
          volume_ml,
          price, 
          sale_price,
          stock_quantity
        ),
        images:product_images (
          image_url,
          is_main
        )
      `,
      { count: "exact" },
    )

    // Apply filters
    if (validParams.search) {
      query = query.ilike("name", `%${validParams.search}%`)
    }

    if (validParams.brand_id) {
      query = query.eq("brand_id", validParams.brand_id)
    }

    if (validParams.gender_id) {
      query = query.eq("gender_id", validParams.gender_id)
    }

    if (validParams.perfume_type_id) {
      query = query.eq("perfume_type_id", validParams.perfume_type_id)
    }

    if (validParams.concentration_id) {
      query = query.eq("concentration_id", validParams.concentration_id)
    }

    // Handle categories filter
    if (validParams.categories && validParams.categories.length > 0) {
      const categoryIds = validParams.categories
      query = query.in("id", supabase.from("product_categories").select("product_id").in("category_id", categoryIds))
    }

    // Handle labels filter
    if (validParams.labels && validParams.labels.length > 0) {
      const labelIds = validParams.labels
      query = query.in("id", supabase.from("product_label_assignments").select("product_id").in("label_id", labelIds))
    }

    // Filter for deleted/active products
    if (validParams.deleted === true) {
      query = query.not("deleted_at", "is", null)
    } else if (validParams.deleted === false || validParams.deleted === undefined) {
      query = query.is("deleted_at", null)
    }

    // Handle in-stock filter
    if (validParams.in_stock === true) {
      query = query.in("id", supabase.from("product_variants").select("product_id").gt("stock_quantity", 0))
    } else if (validParams.in_stock === false) {
      query = query.in("id", supabase.from("product_variants").select("product_id").eq("stock_quantity", 0))
    }

    // Handle has-promotion filter
    if (validParams.has_promotion === true) {
      query = query.in("id", supabase.from("product_variants").select("product_id").not("sale_price", "is", null))
    } else if (validParams.has_promotion === false) {
      query = query.not(
        "id",
        "in",
        supabase.from("product_variants").select("product_id").not("sale_price", "is", null),
      )
    }

    // Handle price range filter - requires more complex handling of variants
    if (validParams.min_price !== null && validParams.min_price !== undefined) {
      query = query.in("id", supabase.from("product_variants").select("product_id").gte("price", validParams.min_price))
    }

    if (validParams.max_price !== null && validParams.max_price !== undefined) {
      query = query.in("id", supabase.from("product_variants").select("product_id").lte("price", validParams.max_price))
    }

    // Apply sorting
    if (validParams.sort_by === "price") {
      // Sorting by price requires a different approach since it's on variants
      // We'll handle it in post-processing
    } else {
      query = query.order(validParams.sort_by, {
        ascending: validParams.sort_order === "asc",
      })
    }

    // Apply pagination
    const from = (validParams.page - 1) * validParams.limit
    const to = from + validParams.limit - 1
    query = query.range(from, to)

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching products:", error)
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    // Process the results
    const formattedData = data.map((product) => {
      // Determine if product has promotions
      const hasPromotion = product.variants.some((v) => v.sale_price !== null) || false

      // Find main image
      const mainImage = product.images.find((img) => img.is_main)?.image_url || product.images[0]?.image_url || null

      return {
        id: product.id,
        name: product.name,
        product_code: product.product_code,
        brand: product.brand,
        variants: product.variants,
        created_at: product.created_at,
        updated_at: product.updated_at,
        deleted_at: product.deleted_at,
        has_promotion: hasPromotion,
        main_image: mainImage,
      }
    })

    // Handle special case for price sorting
    if (validParams.sort_by === "price") {
      formattedData.sort((a, b) => {
        const aPrice = Math.min(...a.variants.map((v) => v.sale_price ?? v.price))
        const bPrice = Math.min(...b.variants.map((v) => v.sale_price ?? v.price))
        return validParams.sort_order === "asc" ? aPrice - bPrice : bPrice - aPrice
      })
    }

    return {
      data: formattedData,
      total: count ?? 0,
      page: validParams.page,
      limit: validParams.limit,
    }
  } catch (error) {
    console.error("Error in getProducts:", error)
    throw error
  }
}

// Get a single product by ID with all relations
export async function getProductById(productId: number): Promise<ProductDetailResponse> {
  try {
    const supabase = await getSupabaseServerClient()

    // Fetch the product with its immediate relations
    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        brand:brand_id (*),
        gender:gender_id (*),
        perfume_type:perfume_type_id (*),
        concentration:concentration_id (*)
      `,
      )
      .eq("id", productId)
      .single()

    if (error) {
      console.error("Error fetching product:", error)
      return { data: null, error: error.message }
    }

    if (!product) {
      return { data: null, error: "Product not found" }
    }

    // Fetch variants
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("volume_ml", { ascending: true })

    if (variantsError) {
      console.error("Error fetching variants:", variantsError)
      return { data: null, error: variantsError.message }
    }

    // Fetch images
    const { data: images, error: imagesError } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("display_order", { ascending: true })

    if (imagesError) {
      console.error("Error fetching images:", imagesError)
      return { data: null, error: imagesError.message }
    }

    // Fetch categories with join info
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select(
        `
        *,
        product_categories!inner (*)
      `,
      )
      .eq("product_categories.product_id", productId)
      .order("name")

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError)
      return { data: null, error: categoriesError.message }
    }

    // Fetch labels with join info and valid_until
    const { data: labels, error: labelsError } = await supabase
      .from("product_labels")
      .select(
        `
        *,
        product_label_assignments!inner (*)
      `,
      )
      .eq("product_label_assignments.product_id", productId)
      .order("name")

    if (labelsError) {
      console.error("Error fetching labels:", labelsError)
      return { data: null, error: labelsError.message }
    }

    // Fetch scents with join info and scent_type
    const { data: scents, error: scentsError } = await supabase
      .from("scents")
      .select(
        `
        *,
        product_scents!inner (*)
      `,
      )
      .eq("product_scents.product_id", productId)
      .order("name")

    if (scentsError) {
      console.error("Error fetching scents:", scentsError)
      return { data: null, error: scentsError.message }
    }

    // Fetch ingredients with join info
    const { data: ingredients, error: ingredientsError } = await supabase
      .from("ingredients")
      .select(
        `
        *,
        product_ingredients!inner (*)
      `,
      )
      .eq("product_ingredients.product_id", productId)
      .order("name")

    if (ingredientsError) {
      console.error("Error fetching ingredients:", ingredientsError)
      return { data: null, error: ingredientsError.message }
    }

    // Combine all data into a single product object
    const productWithRelations = {
      ...product,
      variants,
      images,
      categories,
      labels,
      scents,
      ingredients,
    }

    return { data: productWithRelations }
  } catch (error) {
    console.error("Error in getProductById:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get inventory history for a variant
export async function getInventoryHistory(variantId: number) {
  try {
    const supabase = await getSupabaseServerClient()

    // Get current user info
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { data: [], error: "Unauthorized" }
    }

    const role = getUserRoleFromMetadata(session.user)

    if (role !== "admin" && role !== "staff") {
      return { data: [], error: "Unauthorized - Admin/Staff only" }
    }

    // Get the variant details first
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select(
        `
        *,
        product:product_id (
          id,
          name
        )
      `,
      )
      .eq("id", variantId)
      .single()

    if (variantError) {
      console.error("Error fetching variant:", variantError)
      throw new Error(`Failed to fetch variant: ${variantError.message}`)
    }

    // Get inventory history
    const { data, error } = await supabase
      .from("inventory")
      .select(
        `
        *,
        updated_by (
          id,
          email,
          profiles:public_profiles (
            display_name
          )
        )
      `,
      )
      .eq("variant_id", variantId)
      .order("timestamp", { ascending: false })

    if (error) {
      console.error("Error fetching inventory history:", error)
      throw new Error(`Failed to fetch inventory history: ${error.message}`)
    }

    // Enrich the data with product info
    const formattedData = data.map((record) => ({
      ...record,
      product_id: variant.product.id,
      product_name: variant.product.name,
      variant_volume: variant.volume_ml,
      updated_by_name: record.updated_by?.profiles?.display_name || record.updated_by?.email || "System",
    }))

    return { data: formattedData }
  } catch (error) {
    console.error("Error in getInventoryHistory:", error)
    throw error
  }
}

// Create a new product
export async function createProduct(formData: ProductFormData): Promise<ProductMutationResponse> {
  const supabase = await getServiceRoleClient()

  try {
    // Validate form data
    const validatedData = productFormSchema.parse(formData)

    // Start transaction
    await supabase.rpc("begin_transaction")

    // 1. Insert base product
    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert({
        name: validatedData.name,
        product_code: validatedData.product_code,
        short_description: validatedData.short_description || null,
        long_description: validatedData.long_description || null,
        brand_id: validatedData.brand_id,
        gender_id: validatedData.gender_id,
        perfume_type_id: validatedData.perfume_type_id,
        concentration_id: validatedData.concentration_id,
        origin_country: validatedData.origin_country || null,
        release_year: validatedData.release_year,
        style: validatedData.style || null,
        sillage: validatedData.sillage || null,
        longevity: validatedData.longevity || null,
      })
      .select()
      .single()

    if (productError) {
      throw new Error(`Failed to create product: ${productError.message}`)
    }

    const productId = productData.id

    // 2. Insert variants
    const variantPromises = validatedData.variants.map((variant) =>
      supabase.from("product_variants").insert({
        product_id: productId,
        volume_ml: variant.volume_ml,
        price: variant.price,
        sale_price: variant.sale_price || null,
        sku: variant.sku,
        stock_quantity: variant.stock_quantity,
      }),
    )

    await Promise.all(variantPromises)

    // 3. Insert category assignments
    if (validatedData.categories.length > 0) {
      const categoryRecords = validatedData.categories.map((categoryId) => ({
        product_id: productId,
        category_id: categoryId,
      }))

      const { error: categoriesError } = await supabase.from("product_categories").insert(categoryRecords)

      if (categoriesError) {
        throw new Error(`Failed to assign categories: ${categoriesError.message}`)
      }
    }

    // 4. Insert label assignments
    if (validatedData.labels.length > 0) {
      const labelRecords = validatedData.labels.map((label) => ({
        product_id: productId,
        label_id: label.label_id,
        valid_until: label.valid_until || null,
      }))

      const { error: labelsError } = await supabase.from("product_label_assignments").insert(labelRecords)

      if (labelsError) {
        throw new Error(`Failed to assign labels: ${labelsError.message}`)
      }
    }

    // Log admin activity
    await logAdminActivity(
      supabase,
      "PRODUCT_CREATE",
      `Created product: ${validatedData.name}`,
      "product",
      productId.toString(),
    )

    // Commit transaction
    await supabase.rpc("commit_transaction")

    // Revalidate paths
    revalidatePath(`/admin/san-pham/${productId}`)
    revalidatePath("/admin/san-pham")

    return {
      success: true,
      message: "Sản phẩm đã được tạo thành công",
      productId: productId,
    }
  } catch (error) {
    // Rollback transaction on error
    await supabase.rpc("rollback_transaction")
    console.error("Error in createProduct:", error)
    throw error
  }
}

// Update an existing product
export async function updateProduct(productId: number, formData: ProductFormData): Promise<ProductMutationResponse> {
  const supabase = await getServiceRoleClient()

  try {
    // Validate form data
    const validatedData = productFormSchema.parse(formData)

    // Start transaction
    await supabase.rpc("begin_transaction")

    // 1. Update base product
    const { error: productError } = await supabase
      .from("products")
      .update({
        name: validatedData.name,
        product_code: validatedData.product_code,
        short_description: validatedData.short_description || null,
        long_description: validatedData.long_description || null,
        brand_id: validatedData.brand_id,
        gender_id: validatedData.gender_id,
        perfume_type_id: validatedData.perfume_type_id,
        concentration_id: validatedData.concentration_id,
        origin_country: validatedData.origin_country || null,
        release_year: validatedData.release_year,
        style: validatedData.style || null,
        sillage: validatedData.sillage || null,
        longevity: validatedData.longevity || null,
      })
      .eq("id", productId)

    if (productError) {
      throw new Error(`Failed to update product: ${productError.message}`)
    }

    // 2. Handle variants
    // Get existing variants to determine what to add/update/delete
    const { data: existingVariants, error: variantsError } = await supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", productId)

    if (variantsError) {
      throw new Error(`Failed to fetch existing variants: ${variantsError.message}`)
    }

    const existingVariantIds = existingVariants.map((v) => v.id)
    const updatedVariantIds = validatedData.variants.filter((v) => v.id).map((v) => v.id as number)

    // Variants to delete
    const variantsToDelete = existingVariantIds.filter((id) => !updatedVariantIds.includes(id))

    if (variantsToDelete.length > 0) {
      const { error: deleteError } = await supabase.from("product_variants").delete().in("id", variantsToDelete)

      if (deleteError) {
        throw new Error(`Failed to delete variants: ${deleteError.message}`)
      }
    }

    // Variants to update
    const variantsToUpdate = validatedData.variants.filter((v) => v.id)
    for (const variant of variantsToUpdate) {
      const { error: updateError } = await supabase
        .from("product_variants")
        .update({
          volume_ml: variant.volume_ml,
          price: variant.price,
          sale_price: variant.sale_price || null,
          sku: variant.sku,
          stock_quantity: variant.stock_quantity,
        })
        .eq("id", variant.id)

      if (updateError) {
        throw new Error(`Failed to update variant: ${updateError.message}`)
      }
    }

    // Variants to create
    const variantsToCreate = validatedData.variants.filter((v) => !v.id)
    if (variantsToCreate.length > 0) {
      const newVariants = variantsToCreate.map((v) => ({
        product_id: productId,
        volume_ml: v.volume_ml,
        price: v.price,
        sale_price: v.sale_price || null,
        sku: v.sku,
        stock_quantity: v.stock_quantity,
      }))

      const { error: createError } = await supabase.from("product_variants").insert(newVariants)

      if (createError) {
        throw new Error(`Failed to create new variants: ${createError.message}`)
      }
    }

    // 3. Update categories (delete all, then insert new)
    const { error: deleteCategoriesError } = await supabase
      .from("product_categories")
      .delete()
      .eq("product_id", productId)

    if (deleteCategoriesError) {
      throw new Error(`Failed to clear existing categories: ${deleteCategoriesError.message}`)
    }

    if (validatedData.categories.length > 0) {
      const categoryRecords = validatedData.categories.map((categoryId) => ({
        product_id: productId,
        category_id: categoryId,
      }))

      const { error: categoriesError } = await supabase.from("product_categories").insert(categoryRecords)

      if (categoriesError) {
        throw new Error(`Failed to assign categories: ${categoriesError.message}`)
      }
    }

    // 4. Update labels (delete all, then insert new)
    const { error: deleteLabelsError } = await supabase
      .from("product_label_assignments")
      .delete()
      .eq("product_id", productId)

    if (deleteLabelsError) {
      throw new Error(`Failed to clear existing labels: ${deleteLabelsError.message}`)
    }

    if (validatedData.labels.length > 0) {
      const labelRecords = validatedData.labels.map((label) => ({
        product_id: productId,
        label_id: label.label_id,
        valid_until: label.valid_until || null,
      }))

      const { error: labelsError } = await supabase.from("product_label_assignments").insert(labelRecords)

      if (labelsError) {
        throw new Error(`Failed to assign labels: ${labelsError.message}`)
      }
    }

    // Log admin activity
    await logAdminActivity(
      supabase,
      "PRODUCT_UPDATE",
      `Updated product: ${validatedData.name}`,
      "product",
      productId.toString(),
    )

    // Commit transaction
    await supabase.rpc("commit_transaction")

    // Revalidate paths
    revalidatePath(`/admin/san-pham/${productId}`)
    revalidatePath("/admin/san-pham")

    return {
      success: true,
      message: "Sản phẩm đã được cập nhật thành công",
      productId: productId,
    }
  } catch (error) {
    // Rollback transaction on error
    await supabase.rpc("rollback_transaction")
    console.error("Error in updateProduct:", error)
    throw error
  }
}

// Soft delete a product
export async function softDeleteProduct(productId: number) {
  const supabase = await getServiceRoleClient()

  try {
    // Soft delete by setting deleted_at timestamp
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", productId)

    if (error) {
      console.error("Error soft deleting product:", error)
      throw new Error(`Failed to delete product: ${error.message}`)
    }

    // Log admin activity
    await logAdminActivity(supabase, "PRODUCT_DELETE", `Deleted product #${productId}`, "product", productId.toString())

    // Revalidate paths
    revalidatePath(`/admin/san-pham/${productId}`)
    revalidatePath("/admin/san-pham")

    return { success: true, message: "Product deleted successfully" }
  } catch (error) {
    console.error("Error in softDeleteProduct:", error)
    throw error
  }
}

// Restore a soft-deleted product
export async function restoreProduct(productId: number) {
  const supabase = await getServiceRoleClient()

  try {
    // Restore by clearing deleted_at timestamp
    const { error } = await supabase.from("products").update({ deleted_at: null }).eq("id", productId)

    if (error) {
      console.error("Error restoring product:", error)
      throw new Error(`Failed to restore product: ${error.message}`)
    }

    // Log admin activity
    await logAdminActivity(
      supabase,
      "PRODUCT_RESTORE",
      `Restored product #${productId}`,
      "product",
      productId.toString(),
    )

    // Revalidate paths
    revalidatePath(`/admin/san-pham/${productId}`)
    revalidatePath("/admin/san-pham")

    return { success: true, message: "Product restored successfully" }
  } catch (error) {
    console.error("Error in restoreProduct:", error)
    throw error
  }
}

// Upload product images
export async function uploadProductImages(productId: number, files: File[]) {
  const supabase = await getServiceRoleClient()

  const results = {
    success: [] as { path: string; id: number }[],
    errors: [] as string[],
  }

  try {
    // Start transaction
    await supabase.rpc("begin_transaction")

    for (const file of files) {
      // 1. Upload the file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `products/${productId}/${fileName}`

      const { error: uploadError } = await supabase.storage.from("products").upload(filePath, file)

      if (uploadError) {
        results.errors.push(`Failed to upload ${file.name}: ${uploadError.message}`)
        continue
      }

      // 2. Get public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath)

      // 3. Create image record in the database
      const { data: imageData, error: dbError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: publicUrl,
          alt_text: file.name,
          is_main: false, // Default to not main
        })
        .select()
        .single()

      if (dbError) {
        results.errors.push(`Failed to save image metadata: ${dbError.message}`)
        // If there's an error with the database, also delete the uploaded file
        await supabase.storage.from("products").remove([filePath])
        continue
      }

      results.success.push({
        path: publicUrl,
        id: imageData.id,
      })
    }

    // Set the first uploaded image as main if no main image exists
    if (results.success.length > 0) {
      const { data: mainImages } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", productId)
        .eq("is_main", true)

      if (!mainImages || mainImages.length === 0) {
        await supabase.from("product_images").update({ is_main: true }).eq("id", results.success[0].id)
      }
    }

    // Log admin activity
    await logAdminActivity(
      supabase,
      "PRODUCT_IMAGES_UPLOAD",
      `Uploaded ${results.success.length} images for product #${productId}`,
      "product",
      productId.toString(),
    )

    // Commit transaction
    await supabase.rpc("commit_transaction")

    // Revalidate paths
    revalidatePath(`/admin/san-pham/${productId}`)

    return {
      success: true,
      message: `${results.success.length} images uploaded successfully${
        results.errors.length ? ` (${results.errors.length} failed)` : ""
      }`,
      images: results.success,
      errors: results.errors,
    }
  } catch (error) {
    // Rollback transaction on error
    await supabase.rpc("rollback_transaction")
    console.error("Error in uploadProductImages:", error)
    throw error
  }
}

// Delete a product image
export async function deleteProductImage(imageId: number) {
  const supabase = await getServiceRoleClient()

  try {
    // First, get the image details to find the file path
    const { data: image, error: fetchError } = await supabase
      .from("product_images")
      .select("*, product:product_id (id)")
      .eq("id", imageId)
      .single()

    if (fetchError) {
      console.error("Error fetching image:", fetchError)
      throw new Error(`Failed to fetch image: ${fetchError.message}`)
    }

    // Extract the file path from the image URL
    // URL format should be: https://[supabase-project-url]/storage/v1/object/public/products/[file-path]
    const url = new URL(image.image_url)
    const pathParts = url.pathname.split("/")
    const storagePath = pathParts.slice(pathParts.indexOf("products")).join("/")

    // Delete the image record from the database
    const { error: dbError } = await supabase.from("product_images").delete().eq("id", imageId)

    if (dbError) {
      console.error("Error deleting image from database:", dbError)
      throw new Error(`Failed to delete image: ${dbError.message}`)
    }

    // Delete the image file from storage
    const { error: storageError } = await supabase.storage.from("products").remove([storagePath])

    if (storageError) {
      console.error("Warning - Failed to delete image file:", storageError)
      // We don't throw here because the database record is already deleted
    }

    // Check if the deleted image was the main image
    if (image.is_main) {
      // Set another image as main if one exists
      const { data: otherImages } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", image.product.id)
        .limit(1)

      if (otherImages && otherImages.length > 0) {
        await supabase.from("product_images").update({ is_main: true }).eq("id", otherImages[0].id)
      }
    }

    // Log admin activity
    await logAdminActivity(
      supabase,
      "PRODUCT_IMAGE_DELETE",
      `Deleted image #${imageId} from product #${image.product.id}`,
      "product_image",
      imageId.toString(),
    )

    // Revalidate product detail page
    revalidatePath(`/admin/san-pham/${image.product.id}`)

    return { success: true, message: "Image deleted successfully" }
  } catch (error) {
    console.error("Error in deleteProductImage:", error)
    throw error
  }
}

// Update a product image (alt text, is_main, display_order)
export async function updateProductImage(
  imageId: number,
  updates: { is_main?: boolean; alt_text?: string; display_order?: number },
) {
  const supabase = await getServiceRoleClient()

  try {
    // Get image's product ID first
    const { data: image, error: fetchError } = await supabase
      .from("product_images")
      .select("product_id")
      .eq("id", imageId)
      .single()

    if (fetchError) {
      console.error("Error fetching image:", fetchError)
      throw new Error(`Failed to fetch image: ${fetchError.message}`)
    }

    const productId = image.product_id

    // If setting this image as main, unset any existing main image
    if (updates.is_main) {
      const { error: updateMainError } = await supabase
        .from("product_images")
        .update({ is_main: false })
        .eq("product_id", productId)
        .neq("id", imageId)

      if (updateMainError) {
        console.error("Error updating main image status:", updateMainError)
        throw new Error(`Failed to update main image status: ${updateMainError.message}`)
      }
    }

    // Update the image
    const { error: updateError } = await supabase.from("product_images").update(updates).eq("id", imageId)

    if (updateError) {
      console.error("Error updating image:", updateError)
      throw new Error(`Failed to update image: ${updateError.message}`)
    }

    // Log admin activity
    await logAdminActivity(
      supabase,
      "PRODUCT_IMAGE_UPDATE",
      `Updated image #${imageId} for product #${productId}`,
      "product_image",
      imageId.toString(),
      updates,
    )

    // Revalidate product detail page
    revalidatePath(`/admin/san-pham/${productId}`)

    return { success: true, message: "Image updated successfully" }
  } catch (error) {
    console.error("Error in updateProductImage:", error)
    throw error
  }
}

// Adjust inventory for a variant
export async function adjustInventory(data: StockAdjustmentParams) {
  const supabase = await getServiceRoleClient()

  try {
    // Validate input
    const validatedData = inventoryAdjustmentSchema.parse(data)

    // Start transaction
    await supabase.rpc("begin_transaction")

    // Get the variant info first
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("*, product:product_id(id, name)")
      .eq("id", validatedData.variant_id)
      .single()

    if (variantError) {
      throw new Error(`Failed to find variant: ${variantError.message}`)
    }

    // Update variant stock
    const newStockLevel = variant.stock_quantity + validatedData.change_amount

    if (newStockLevel < 0) {
      throw new Error("Stock adjustment would result in negative inventory")
    }

    const { error: updateError } = await supabase
      .from("product_variants")
      .update({ stock_quantity: newStockLevel })
      .eq("id", validatedData.variant_id)

    if (updateError) {
      throw new Error(`Failed to update stock: ${updateError.message}`)
    }

    // Insert inventory log record
    const { error: logError } = await supabase.from("inventory").insert({
      variant_id: validatedData.variant_id,
      change_amount: validatedData.change_amount,
      reason: validatedData.reason,
      order_id: validatedData.order_id || null,
      stock_after_change: newStockLevel,
      updated_by: (await supabase.auth.getSession()).data.session?.user.id,
    })

    if (logError) {
      throw new Error(`Failed to create inventory log: ${logError.message}`)
    }

    // Log admin activity
    await logAdminActivity(
      supabase,
      "INVENTORY_UPDATE",
      `Adjusted stock for variant #${validatedData.variant_id} by ${validatedData.change_amount}`,
      "product_variant",
      validatedData.variant_id.toString(),
    )

    // Revalidate product detail page
    revalidatePath(`/admin/san-pham/${variant.product.id}`)

    return {
      success: true,
      message: `Stock adjusted by ${validatedData.change_amount}. New level: ${newStockLevel}`,
    }
  } catch (error) {
    // Rollback transaction on error
    await supabase.rpc("rollback_transaction")
    console.error("Error in adjustInventory:", error)
    throw error
  }
}

// Bulk soft delete products
export async function bulkSoftDeleteProducts(params: BulkActionParams): Promise<BulkActionResponse> {
  const { productIds } = params

  if (!productIds.length) {
    return { success: false, message: "No products selected" }
  }

  const supabase = await getServiceRoleClient()

  try {
    const { data, error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", productIds)

    if (error) {
      console.error("Error bulk deleting products:", error)
      throw new Error(`Failed to delete products: ${error.message}`)
    }

    // Log admin activity
    await logAdminActivity(
      supabase,
      "PRODUCT_BULK_DELETE",
      `Deleted ${productIds.length} products`,
      "products",
      productIds.join(","),
    )

    // Revalidate product list
    revalidatePath("/admin/san-pham")

    return {
      success: true,
      message: `${productIds.length} products deleted successfully`,
      affectedCount: productIds.length,
    }
  } catch (error) {
    console.error("Error in bulkSoftDeleteProducts:", error)
    throw error
  }
}

// Bulk restore products
export async function bulkRestoreProducts(params: BulkActionParams): Promise<BulkActionResponse> {
  const { productIds } = params

  if (!productIds.length) {
    return { success: false, message: "No products selected" }
  }

  const supabase = await getServiceRoleClient()

  try {
    const { data, error } = await supabase.from("products").update({ deleted_at: null }).in("id", productIds)

    if (error) {
      console.error("Error bulk restoring products:", error)
      throw new Error(`Failed to restore products: ${error.message}`)
    }

    // Log admin activity
    await logAdminActivity(
      supabase,
      "PRODUCT_BULK_RESTORE",
      `Restored ${productIds.length} products`,
      "products",
      productIds.join(","),
    )

    // Revalidate product list
    revalidatePath("/admin/san-pham")

    return {
      success: true,
      message: `${productIds.length} products restored successfully`,
      affectedCount: productIds.length,
    }
  } catch (error) {
    console.error("Error in bulkRestoreProducts:", error)
    throw error
  }
}

// Bulk assign category to products
export async function bulkAssignCategoryToProducts(params: BulkCategoryActionParams): Promise<BulkActionResponse> {
  const { productIds, categoryId } = params

  if (!productIds.length) {
    return { success: false, message: "No products selected" }
  }

  const supabase = await getServiceRoleClient()

  try {
    // Start transaction
    await supabase.rpc("begin_transaction")

    // Create records for product-category assignments
    const records = productIds.map((productId) => ({
      product_id: productId,
      category_id: categoryId,
    }))

    // Insert records, ignore if they already exist (on conflict do nothing)
    const { error } = await supabase
      .from("product_categories")
      .upsert(records, { onConflict: "product_id,category_id" })

    if (error) {
      throw new Error(`Failed to assign category: ${error.message}`)
    }

    // Log admin activity
    await logAdminActivity(
      supabase,
      "PRODUCT_BULK_ADD_CATEGORY",
      `Added category #${categoryId} to ${productIds.length} products`,
      "products",
      productIds.join(","),
    )

    // Commit transaction
    await supabase.rpc("commit_transaction")

    // Revalidate product list
    revalidatePath("/admin/san-pham")

    return {
      success: true,
      message: `Category assigned to ${productIds.length} products successfully`,
      affectedCount: productIds.length,
    }
  } catch (error) {
    // Rollback transaction on error
    await supabase.rpc("rollback_transaction")
    console.error("Error in bulkAssignCategoryToProducts:", error)
    throw error
  }
}

// Bulk remove category from products
export async function bulkRemoveCategoryFromProducts(params: BulkCategoryActionParams): Promise<BulkActionResponse> {
  const { productIds, categoryId } = params

  if (!productIds.length) {
    return { success: false, message: "No products selected" }
  }

  const supabase = await getServiceRoleClient()

  try {
    const { data, error } = await supabase
      .from("product_categories")
      .delete()
      .eq("category_id", categoryId)
      .in("product_id", productIds)

    if (error) {
      console.error("Error removing category from products:", error)
      throw new Error(`Failed to remove category: ${error.message}`)
    }

    // Log admin activity
    await logAdminActivity(
      supabase,
      "PRODUCT_BULK_REMOVE_CATEGORY",
      `Removed category #${categoryId} from ${productIds.length} products`,
      "products",
      productIds.join(","),
    )

    // Revalidate product list
    revalidatePath("/admin/san-pham")

    return {
      success: true,
      message: `Category removed from ${productIds.length} products successfully`,
      affectedCount: productIds.length,
    }
  } catch (error) {
    console.error("Error in bulkRemoveCategoryFromProducts:", error)
    throw error
  }
}

// Bulk assign label to products
export async function bulkAssignLabelToProducts(params: BulkLabelActionParams): Promise<BulkActionResponse> {
  const { productIds, labelId, valid_until } = params

  if (!productIds.length) {
    return { success: false, message: "No products selected" }
  }

  const supabase = await getServiceRoleClient()

  try {
    // Start transaction
    await supabase.rpc("begin_transaction")

    // Create records for product-label assignments
    const records = productIds.map((productId) => ({
      product_id: productId,
      label_id: labelId,
      valid_until: valid_until ? new Date(valid_until).toISOString() : null,
    }))

    // Insert records, update if they already exist
    const { error } = await supabase
      .from("product_label_assignments")
      .upsert(records, { onConflict: "product_id,label_id" })

    if (error) {
      throw new Error(`Failed to assign label: ${error.message}`)
    }

    // Log admin activity
    await logAdminActivity(
      supabase,
      "PRODUCT_BULK_ADD_LABEL",
      `Added label #${labelId} to ${productIds.length} products`,
      "products",
      productIds.join(","),
    )

    // Commit transaction
    await supabase.rpc("commit_transaction")

    // Revalidate product list
    revalidatePath("/admin/san-pham")

    return {
      success: true,
      message: `Label assigned to ${productIds.length} products successfully`,
      affectedCount: productIds.length,
    }
  } catch (error) {
    // Rollback transaction on error
    await supabase.rpc("rollback_transaction")
    console.error("Error in bulkAssignLabelToProducts:", error)
    throw error
  }
}

// Bulk remove label from products
export async function bulkRemoveLabelFromProducts(params: BulkLabelActionParams): Promise<BulkActionResponse> {
  const { productIds, labelId } = params

  if (!productIds.length) {
    return { success: false, message: "No products selected" }
  }

  const supabase = await getServiceRoleClient()

  try {
    const { data, error } = await supabase
      .from("product_label_assignments")
      .delete()
      .eq("label_id", labelId)
      .in("product_id", productIds)

    if (error) {
      console.error("Error removing label from products:", error)
      throw new Error(`Failed to remove label: ${error.message}`)
    }

    // Log admin activity
    await logAdminActivity(
      supabase,
      "PRODUCT_BULK_REMOVE_LABEL",
      `Removed label #${labelId} from ${productIds.length} products`,
      "products",
      productIds.join(","),
    )

    // Revalidate product list
    revalidatePath("/admin/san-pham")

    return {
      success: true,
      message: `Label removed from ${productIds.length} products successfully`,
      affectedCount: productIds.length,
    }
  } catch (error) {
    console.error("Error in bulkRemoveLabelFromProducts:", error)
    throw error
  }
}

// Helper function to log admin activity
async function logAdminActivity(
  supabase: any,
  activity_type: string,
  description: string,
  entity_type: string,
  entity_id: string,
  details?: object,
) {
  try {
    // Get current user info from auth API
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.error("No active session found for admin activity logging")
      return
    }

    const adminUserId = session.user.id

    const { error } = await supabase.from("admin_activity_log").insert({
      admin_user_id: adminUserId,
      activity_type,
      description,
      entity_type,
      entity_id,
      details: details ? JSON.stringify(details) : null,
    })

    if (error) {
      console.error("Error logging admin activity:", error)
    }
  } catch (error) {
    console.error("Error in logAdminActivity:", error)
  }
}

