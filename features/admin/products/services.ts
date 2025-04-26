import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  ProductsResponse,
  ProductWithRelations,
  ProductFilters,
  ProductPagination,
  ProductSort,
} from "./types";

/**
 * Extract storage path from a Supabase storage URL
 * @param url Full Supabase storage URL
 * @returns Path part of the URL or null if not valid
 */
export function extractStoragePath(url: string): string | null {
  try {
    // URL format: https://xxx.supabase.co/storage/v1/object/public/products/path
    const parts = url.split("/products/");
    return parts.length > 1 ? parts[1] : null;
  } catch (e) {
    console.error("Error extracting path from URL:", e);
    return null;
  }
}

/**
 * Build a query for fetching products with filters, pagination, and sorting
 * Reusable logic that works with both client and server-side Supabase clients
 */
export async function buildProductsQuery(
  supabase: any,
  filters?: ProductFilters,
  pagination?: ProductPagination,
  sort?: ProductSort
) {
  // Start building the query
  let query = supabase.from("products").select(
    `
    id, 
    name, 
    slug, 
    product_code, 
    short_description, 
    long_description,
    origin_country,
    style,
    sillage,
    longevity,
    release_year,
    brand_id, 
    gender_id, 
    perfume_type_id, 
    concentration_id, 
    deleted_at,
    brands:brand_id (id, name, logo_url),
    genders:gender_id (id, name),
    perfume_types:perfume_type_id (id, name),
    concentrations:concentration_id (id, name),
    images:product_images(id, image_url, alt_text, is_main, display_order),
    variants:product_variants(id, price, sale_price, stock_quantity, volume_ml, sku, deleted_at)
  `,
    { count: "exact" }
  );

  // Apply filters if provided
  if (filters) {
    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    if (filters.brandId) {
      query = query.eq("brand_id", filters.brandId);
    }

    if (filters.genderId) {
      query = query.eq("gender_id", filters.genderId);
    }

    if (filters.perfumeTypeId) {
      query = query.eq("perfume_type_id", filters.perfumeTypeId);
    }

    if (filters.concentrationId) {
      query = query.eq("concentration_id", filters.concentrationId);
    }

    if (filters.categoryId) {
      query = query.eq("product_categories.category_id", filters.categoryId);
    }

    // Lọc theo trạng thái xóa
    if (filters.includeDeleted) {
      // Khi ở chế độ xem "Đã ẩn", hiển thị:
      // 1. Các sản phẩm đã bị xóa (deleted_at không phải null)
      // 2. Hoặc các sản phẩm có biến thể đã bị xóa

      // Lấy danh sách các sản phẩm có biến thể đã ẩn
      const { data: productsWithHiddenVariants } = await supabase
        .from("product_variants")
        .select("product_id")
        .not("deleted_at", "is", null);

      // Lấy ID các sản phẩm có biến thể đã ẩn
      const productIdsWithHiddenVariants = productsWithHiddenVariants
        ? [...new Set(productsWithHiddenVariants.map((v: any) => v.product_id))]
        : [];

      if (productIdsWithHiddenVariants.length > 0) {
        // Hiển thị sản phẩm nếu nó bị xóa hoặc có biến thể bị ẩn
        query = query.or(
          `deleted_at.not.is.null,id.in.(${productIdsWithHiddenVariants.join(
            ","
          )})`
        );
      } else {
        // Nếu không có sản phẩm nào có biến thể bị ẩn, chỉ hiển thị sản phẩm đã bị xóa
        query = query.not("deleted_at", "is", null);
      }
    } else {
      // Ngược lại, chỉ hiển thị các sản phẩm chưa xóa
      query = query.is("deleted_at", null);
    }
  } else {
    // Default behavior: exclude deleted products
    query = query.is("deleted_at", null);
  }

  // Apply sorting
  const sortColumn = sort?.column || "name";
  const sortOrder = sort?.direction === "desc" ? false : true;
  query = query.order(sortColumn, { ascending: sortOrder });

  // Apply pagination if provided
  if (pagination) {
    const { page, pageSize } = pagination;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  return query;
}

/**
 * Fetch products with server-side client (for use in Server Components)
 */
export async function fetchProducts(
  filters?: ProductFilters,
  pagination?: ProductPagination,
  sort?: ProductSort
): Promise<ProductsResponse> {
  const supabase = await getSupabaseServerClient();

  try {
    const query = await buildProductsQuery(supabase, filters, pagination, sort);
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    return { data: data as ProductWithRelations[], count: count || 0 };
  } catch (error) {
    console.error("Error in fetchProducts:", error);
    throw error;
  }
}

/**
 * Get a single product by ID with related entities (server-side)
 */
export async function fetchProductById(
  id: number
): Promise<ProductWithRelations | null> {
  const supabase = await getSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id, 
        name, 
        slug, 
        product_code, 
        short_description,
        long_description,
        origin_country,
        style,
        longevity,
        sillage,
        release_year,
        brand_id, 
        gender_id, 
        perfume_type_id, 
        concentration_id, 
        created_at,
        updated_at,
        deleted_at,
        brands:brand_id (id, name, logo_url),
        genders:gender_id (id, name),
        perfume_types:perfume_type_id (id, name),
        concentrations:concentration_id (id, name),
        images:product_images(id, image_url, alt_text, is_main, display_order),
        variants:product_variants(id, price, sale_price, stock_quantity, volume_ml, sku)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching product by ID:", error);
      return null;
    }

    return data as ProductWithRelations;
  } catch (error) {
    console.error("Error in fetchProductById:", error);
    return null;
  }
}

/**
 * Get a single product by slug with related entities (server-side)
 */
export async function fetchProductBySlug(
  slug: string
): Promise<ProductWithRelations | null> {
  const supabase = await getSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id, 
        name, 
        slug, 
        product_code, 
        short_description,
        long_description,
        origin_country,
        style,
        longevity,
        sillage,
        release_year,
        brand_id, 
        gender_id, 
        perfume_type_id, 
        concentration_id, 
        created_at,
        updated_at,
        deleted_at,
        brands:brand_id (id, name, logo_url),
        genders:gender_id (id, name),
        perfume_types:perfume_type_id (id, name),
        concentrations:concentration_id (id, name),
        images:product_images(id, image_url, alt_text, is_main, display_order),
        variants:product_variants(id, price, sale_price, stock_quantity, volume_ml, sku)
      `
      )
      .eq("slug", slug)
      .is("deleted_at", null)
      .single();

    if (error) {
      console.error("Error fetching product by slug:", error);
      return null;
    }

    return data as ProductWithRelations;
  } catch (error) {
    console.error("Error in fetchProductBySlug:", error);
    return null;
  }
}
