import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Banner, Brand, Category, Product } from "./types";

/**
 * Lấy sản phẩm nổi bật (có nhãn "Featured")
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await getSupabaseServerClient();

  try {
    // Kiểm tra xem có bảng products không
    const { count: productsCount, error: productsCountError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    if (productsCountError || productsCount === 0) {
      return [];
    }

    // Lấy ID của nhãn "Featured" hoặc "Nổi bật"
    const { data: featuredLabel } = await supabase
      .from("product_labels")
      .select("id")
      .or("name.ilike.%featured%,name.ilike.%nổi bật%")
      .limit(1)
      .maybeSingle();

    // Nếu không tìm thấy nhãn, sử dụng ID mặc định là 1 (thường là Featured)
    const labelId = featuredLabel?.id || 1;

    // Kiểm tra xem có product_label_assignments nào không
    const { data: assignmentsCheck, error: assignmentsCheckError } =
      await supabase
        .from("product_label_assignments")
        .select("id")
        .eq("label_id", labelId)
        .limit(1);

    if (
      assignmentsCheckError ||
      !assignmentsCheck ||
      assignmentsCheck.length === 0
    ) {
      return await getNewArrivals(limit); // Fallback to new arrivals
    }

    // Lấy sản phẩm có nhãn "Featured"
    const { data: featuredProducts, error: productsError } = await supabase
      .from("product_label_assignments")
      .select(
        `
        product_id,
        products!inner(
          id,
          name,
          slug,
          short_description,
          brand_id,
          brand:brands(id, name, logo_url),
          images:product_images(id, image_url, alt_text, is_main, display_order)
        )
      `
      )
      .eq("label_id", labelId)
      .is("products.deleted_at", null)
      .limit(limit);

    if (productsError || !featuredProducts || featuredProducts.length === 0) {
      return await getNewArrivals(limit);
    }

    // Lấy thông tin variants cho mỗi sản phẩm
    const productIds = featuredProducts.map((item) => item.product_id);
    const { data: variantsData } = await supabase
      .from("product_variants")
      .select("id, product_id, price, sale_price, volume_ml, stock_quantity")
      .in("product_id", productIds)
      .is("deleted_at", null);

    // Nhóm variants theo product_id
    const variantsByProduct = (variantsData || []).reduce((acc, variant) => {
      if (!acc[variant.product_id]) {
        acc[variant.product_id] = [];
      }
      acc[variant.product_id].push({
        id: variant.id, // Ensuring the ID is explicitly included
        product_id: variant.product_id,
        price: variant.price,
        sale_price: variant.sale_price,
        volume_ml: variant.volume_ml,
        stock_quantity: variant.stock_quantity,
      });
      return acc;
    }, {} as Record<number, any[]>);

    // Kết hợp sản phẩm với variants và tính giá
    return featuredProducts.map((item) => {
      const product = item.products;
      const variants = variantsByProduct[product.id] || [];

      // Tính giá thấp nhất từ variants
      const prices = variants
        .map((v) => v.price)
        .filter((p) => p !== null && p > 0);
      const salePrices = variants
        .map((v) => v.sale_price)
        .filter((p) => p !== null && p > 0);

      return {
        ...product,
        variants,
        price: prices.length > 0 ? Math.min(...prices) : 0,
        sale_price: salePrices.length > 0 ? Math.min(...salePrices) : null,
      };
    }) as Product[];
  } catch (error) {
    console.error("Error in getFeaturedProducts:", error);
    return await getNewArrivals(limit);
  }
}

/**
 * Lấy sản phẩm mới nhất
 */
export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const supabase = await getSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        short_description,
        brand_id,
        brand:brands(id, name, logo_url),
        images:product_images(id, image_url, alt_text, is_main, display_order)
      `
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return [];
    }

    // Lấy thông tin variants cho mỗi sản phẩm
    const productIds = data.map((product) => product.id);
    const { data: variants } = await supabase
      .from("product_variants")
      .select("id, product_id, price, sale_price, volume_ml, stock_quantity")
      .in("product_id", productIds)
      .is("deleted_at", null);

    // Nhóm variants theo product_id
    const variantsByProduct = (variants || []).reduce((acc, variant) => {
      if (!acc[variant.product_id]) {
        acc[variant.product_id] = [];
      }
      acc[variant.product_id].push({
        id: variant.id, // Ensuring the ID is explicitly included
        product_id: variant.product_id,
        price: variant.price,
        sale_price: variant.sale_price,
        volume_ml: variant.volume_ml,
        stock_quantity: variant.stock_quantity,
      });
      return acc;
    }, {} as Record<number, any[]>);

    // Kết hợp sản phẩm với variants và tính giá
    return data.map((product) => {
      const productVariants = variantsByProduct[product.id] || [];

      // Tính giá thấp nhất từ variants
      const prices = productVariants
        .map((v) => v.price)
        .filter((p) => p !== null && p > 0);
      const salePrices = productVariants
        .map((v) => v.sale_price)
        .filter((p) => p !== null && p > 0);

      return {
        ...product,
        variants: productVariants,
        price: prices.length > 0 ? Math.min(...prices) : 0,
        sale_price: salePrices.length > 0 ? Math.min(...salePrices) : null,
      };
    }) as Product[];
  } catch (error) {
    console.error("Error in getNewArrivals:", error);
    return [];
  }
}

/**
 * Lấy sản phẩm đang giảm giá
 * Kết hợp sản phẩm có nhãn "Sale" và sản phẩm có variant giảm giá
 */
export async function getProductsOnSale(limit = 8): Promise<Product[]> {
  const supabase = await getSupabaseServerClient();

  try {
    // Lấy ID của nhãn "Sale" hoặc "Giảm giá"
    const { data: saleLabel } = await supabase
      .from("product_labels")
      .select("id")
      .or("name.ilike.%sale%,name.ilike.%giảm giá%")
      .limit(1)
      .maybeSingle();

    // Thực hiện 2 truy vấn song song để tối ưu
    const [labelResult, variantResult] = await Promise.all([
      // 1. Lấy sản phẩm có nhãn "Sale"
      saleLabel?.id
        ? supabase
            .from("product_label_assignments")
            .select(
              `
              product_id,
              products!inner(
                id,
                name,
                slug,
                short_description,
                brand_id,
                brand:brands(id, name, logo_url),
                images:product_images(id, image_url, alt_text, is_main, display_order)
              )
            `
            )
            .eq("label_id", saleLabel.id)
            .is("products.deleted_at", null)
            .limit(limit)
        : { data: null },

      // 2. Lấy sản phẩm có variant giảm giá
      supabase
        .from("product_variants")
        .select(
          `
          product_id,
          products!inner(
            id,
            name,
            slug,
            short_description,
            brand_id,
            brand:brands(id, name, logo_url),
            images:product_images(id, image_url, alt_text, is_main, display_order)
          )
        `
        )
        .not("sale_price", "is", null)
        .gt("sale_price", 0)
        .is("deleted_at", null)
        .is("products.deleted_at", null)
        .limit(limit),
    ]);

    // Kết hợp hai danh sách sản phẩm, loại bỏ trùng lặp
    const allProductIds = new Set<number>();
    const allProducts: any[] = [];

    // Thêm sản phẩm có nhãn Sale
    if (labelResult.data) {
      labelResult.data.forEach((item) => {
        if (!allProductIds.has(item.product_id)) {
          allProductIds.add(item.product_id);
          allProducts.push(item.products);
        }
      });
    }

    // Thêm sản phẩm có variant giảm giá
    if (variantResult.data) {
      variantResult.data.forEach((item) => {
        if (!allProductIds.has(item.product_id)) {
          allProductIds.add(item.product_id);
          allProducts.push(item.products);
        }
      });
    }

    if (allProducts.length === 0) {
      return await getNewArrivals(limit);
    }

    // Lấy thông tin variants cho tất cả sản phẩm
    const { data: variantsData } = await supabase
      .from("product_variants")
      .select("id, product_id, price, sale_price, volume_ml, stock_quantity")
      .in("product_id", Array.from(allProductIds))
      .is("deleted_at", null);

    // Nhóm variants theo product_id
    const variantsByProduct = (variantsData || []).reduce((acc, variant) => {
      if (!acc[variant.product_id]) {
        acc[variant.product_id] = [];
      }
      acc[variant.product_id].push({
        id: variant.id, // Ensuring the ID is explicitly included
        product_id: variant.product_id,
        price: variant.price,
        sale_price: variant.sale_price,
        volume_ml: variant.volume_ml,
        stock_quantity: variant.stock_quantity,
      });
      return acc;
    }, {} as Record<number, any[]>);

    // Kết hợp sản phẩm với variants và tính giá
    const productsWithPricing = allProducts
      .map((product) => {
        const variants = variantsByProduct[product.id] || [];

        // Tính giá thấp nhất từ variants
        const prices = variants
          .map((v) => v.price)
          .filter((p) => p !== null && p > 0);
        const salePrices = variants
          .map((v) => v.sale_price)
          .filter((p) => p !== null && p > 0);

        return {
          ...product,
          variants,
          price: prices.length > 0 ? Math.min(...prices) : 0,
          sale_price: salePrices.length > 0 ? Math.min(...salePrices) : null,
        };
      })
      .filter((product) => product.sale_price !== null);

    // Giới hạn và trả về kết quả
    return productsWithPricing.slice(0, limit) as Product[];
  } catch (error) {
    console.error("Error in getProductsOnSale:", error);
    return await getNewArrivals(limit);
  }
}

/**
 * Lấy sản phẩm bán chạy nhất
 * Sử dụng function get_best_selling_products từ database
 */
export async function getBestSellingProducts(limit = 8): Promise<Product[]> {
  const supabase = await getSupabaseServerClient();

  try {
    // Sử dụng function get_best_selling_products từ database
    const { data: bestSellingData, error: functionError } = await supabase.rpc(
      "get_best_selling_products",
      {
        p_limit: limit,
      }
    );

    if (functionError || !bestSellingData || bestSellingData.length === 0) {
      // Fallback to new arrivals if function fails
      return await getNewArrivals(limit);
    }

    // Extract product IDs and total sold quantities
    const productIds = bestSellingData.map((item) => item.product_id);
    const totalSoldMap = bestSellingData.reduce((acc, item) => {
      acc[item.product_id] = item.total_sold;
      return acc;
    }, {} as Record<number, number>);

    // Get detailed product information
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        short_description,
        brand_id,
        brand:brands(id, name, logo_url),
        images:product_images(id, image_url, alt_text, is_main, display_order)
      `
      )
      .in("id", productIds)
      .is("deleted_at", null);

    if (productsError || !productsData) {
      return await getNewArrivals(limit);
    }

    // Get variant information for these products
    const { data: variantsData } = await supabase
      .from("product_variants")
      .select("id, product_id, price, sale_price, volume_ml, stock_quantity")
      .in("product_id", productIds)
      .is("deleted_at", null);

    // Group variants by product_id
    const variantsByProduct = (variantsData || []).reduce((acc, variant) => {
      if (!acc[variant.product_id]) {
        acc[variant.product_id] = [];
      }
      acc[variant.product_id].push({
        id: variant.id, // Ensuring the ID is explicitly included
        product_id: variant.product_id,
        price: variant.price,
        sale_price: variant.sale_price,
        volume_ml: variant.volume_ml,
        stock_quantity: variant.stock_quantity,
      });
      return acc;
    }, {} as Record<number, any[]>);

    // Combine everything into final products array with pricing and total_sold data
    return productsData.map((product) => {
      const variants = variantsByProduct[product.id] || [];

      // Calculate lowest price from variants
      const prices = variants
        .map((v) => v.price)
        .filter((p) => p !== null && p > 0);
      const salePrices = variants
        .map((v) => v.sale_price)
        .filter((p) => p !== null && p > 0);

      return {
        ...product,
        variants,
        total_sold: totalSoldMap[product.id] || 0,
        price: prices.length > 0 ? Math.min(...prices) : 0,
        sale_price: salePrices.length > 0 ? Math.min(...salePrices) : null,
      };
    }) as Product[];
  } catch (error) {
    console.error("Error in getBestSellingProducts:", error);
    return await getNewArrivals(limit);
  }
}

/**
 * Lấy danh mục nổi bật
 */
export async function getFeaturedCategories(limit = 6): Promise<Category[]> {
  const supabase = await getSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, display_order")
      .eq("is_featured", true)
      .order("display_order", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured categories:", error);
      return [];
    }

    return data as Category[];
  } catch (error) {
    console.error("Error in getFeaturedCategories:", error);
    return [];
  }
}

/**
 * Lấy thương hiệu nổi bật
 * Note: Since there's no is_featured column, we're getting all brands sorted
 */
export async function getFeaturedBrands(limit = 8): Promise<Brand[]> {
  const supabase = await getSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("brands")
      .select("id, name, description, logo_url")
      .order("name")
      .limit(limit);

    if (error) {
      console.error("Error fetching brands:", error);
      return [];
    }

    return data as Brand[];
  } catch (error) {
    console.error("Error in getFeaturedBrands:", error);
    return [];
  }
}

/**
 * Lấy banner đang hoạt động
 * Lọc theo ngày hiệu lực
 */
export async function getActiveBanners(): Promise<Banner[]> {
  const supabase = await getSupabaseServerClient();

  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching active banners:", error);
      return [];
    }

    return data as Banner[];
  } catch (error) {
    console.error("Error in getActiveBanners:", error);
    return [];
  }
}

/**
 * Lấy sản phẩm theo giới tính
 */
export async function getProductsByGender(
  genderId: number,
  limit = 8
): Promise<Product[]> {
  const supabase = await getSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        short_description,
        brand_id,
        brand:brands(id, name, logo_url),
        images:product_images(id, image_url, alt_text, is_main, display_order)
      `
      )
      .eq("gender_id", genderId)
      .is("deleted_at", null)
      .limit(limit);

    if (error || !data || data.length === 0) {
      return [];
    }

    // Lấy thông tin variants cho mỗi sản phẩm
    const productIds = data.map((product) => product.id);
    const { data: variantsData } = await supabase
      .from("product_variants")
      .select("id, product_id, price, sale_price, volume_ml, stock_quantity")
      .in("product_id", productIds)
      .is("deleted_at", null);

    // Group variants by product_id
    const variantsByProduct = (variantsData || []).reduce((acc, variant) => {
      if (!acc[variant.product_id]) {
        acc[variant.product_id] = [];
      }
      acc[variant.product_id].push({
        id: variant.id, // Ensuring the ID is explicitly included
        product_id: variant.product_id,
        price: variant.price,
        sale_price: variant.sale_price,
        volume_ml: variant.volume_ml,
        stock_quantity: variant.stock_quantity,
      });
      return acc;
    }, {} as Record<number, any[]>);

    // Combine products with variants
    return data.map((product) => {
      const variants = variantsByProduct[product.id] || [];

      // Calculate lowest price from variants
      const prices = variants
        .map((v) => v.price)
        .filter((p) => p !== null && p > 0);
      const salePrices = variants
        .map((v) => v.sale_price)
        .filter((p) => p !== null && p > 0);

      return {
        ...product,
        variants,
        price: prices.length > 0 ? Math.min(...prices) : 0,
        sale_price: salePrices.length > 0 ? Math.min(...salePrices) : null,
      };
    }) as Product[];
  } catch (error) {
    console.error(`Error in getProductsByGender(${genderId}):`, error);
    return [];
  }
}

/**
 * Fetch customer reviews for the homepage
 */
export async function getRecentReviews(limit = 5): Promise<any[]> {
  const supabase = await getSupabaseServerClient();

  try {
    // Check if reviews table exists and has data
    const { count, error: countError } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true });

    if (countError || count === 0) {
      console.log("No reviews found in database, returning sample data");
      return []; // Return empty array, will use sample data in component
    }

    // Get approved reviews with user profile and product info
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        product_id,
        user_id,
        product:products(id, name, slug),
        user:profiles(id, display_name, avatar_url)
      `
      )
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching reviews:", error.message);
      return [];
    }

    // Format the data for the component
    return data.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      product_name: review.product?.name,
      product_slug: review.product?.slug,
      created_at: review.created_at,
      user: {
        id: review.user?.id || review.user_id,
        name: review.user?.display_name || "Anonymous",
        avatar: review.user?.avatar_url,
      },
    }));
  } catch (error) {
    console.error("Error in getRecentReviews:", error);
    return [];
  }
}
