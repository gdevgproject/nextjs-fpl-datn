import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Banner, Brand, Category, Product } from "./types"

/**
 * Lấy sản phẩm nổi bật (có nhãn "Featured")
 * Sử dụng RLS policy "Product label assignments are viewable by everyone"
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()

  try {
    // Trước tiên, kiểm tra xem có sản phẩm nào không
    const { data: productsCheck, error: productsCheckError } = await supabase
      .from("products")
      .select("id")
      .is("deleted_at", null)
      .limit(1)

    if (productsCheckError) {
      console.error("Error checking products:", productsCheckError)
      return []
    }

    // Nếu không có sản phẩm nào, trả về mảng rỗng
    if (!productsCheck || productsCheck.length === 0) {
      console.log("No products found in database")
      return []
    }

    // Lấy ID của nhãn "Featured" hoặc tương tự
    const { data: featuredLabel, error: labelError } = await supabase
      .from("product_labels")
      .select("id")
      .or("name.ilike.%featured%,name.ilike.%nổi bật%")
      .limit(1)
      .maybeSingle()

    if (labelError) {
      console.error("Error fetching Featured label:", labelError)
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    // Nếu không tìm thấy nhãn, sử dụng ID mặc định là 3 (thường là Featured)
    const labelId = featuredLabel?.id || 3

    // Kiểm tra xem có product_label_assignments nào không
    const { data: assignmentsCheck, error: assignmentsCheckError } = await supabase
      .from("product_label_assignments")
      .select("id")
      .eq("label_id", labelId)
      .limit(1)

    if (assignmentsCheckError) {
      console.error("Error checking product_label_assignments:", assignmentsCheckError)
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    // Nếu không có assignments nào, fallback to new arrivals
    if (!assignmentsCheck || assignmentsCheck.length === 0) {
      console.log("No product_label_assignments found for label_id:", labelId)
      return await getNewArrivals(limit) // Fallback to new arrivals
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
          gender_id,
          perfume_type_id,
          concentration_id,
          deleted_at,
          created_at,
          updated_at,
          brand:brands(*),
          images:product_images(*)
        )
      `,
      )
      .eq("label_id", labelId)
      .is("products.deleted_at", null)
      .limit(limit)

    if (productsError) {
      console.error("Error fetching featured products:", productsError)
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    if (!featuredProducts || featuredProducts.length === 0) {
      console.log("No featured products found, falling back to new arrivals")
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    // Lấy thông tin variants cho mỗi sản phẩm
    const productIds = featuredProducts.map((item) => item.product_id)
    const { data: variantsData, error: variantsError } = await supabase
      .from("product_variants")
      .select("*")
      .in("product_id", productIds)
      .is("deleted_at", null)

    if (variantsError) {
      console.error("Error fetching variants for featured products:", variantsError)
    }

    // Nhóm variants theo product_id
    const variantsByProduct = (variantsData || []).reduce(
      (acc, variant) => {
        if (!acc[variant.product_id]) {
          acc[variant.product_id] = []
        }
        acc[variant.product_id].push(variant)
        return acc
      },
      {} as Record<number, any[]>,
    )

    // Kết hợp sản phẩm với variants và tính giá
    return featuredProducts.map((item) => {
      const product = item.products
      const variants = variantsByProduct[product.id] || []

      // Tính giá thấp nhất từ variants
      const prices = variants.map((v) => v.price).filter((p) => p !== null && p > 0)
      const salePrices = variants.map((v) => v.sale_price).filter((p) => p !== null && p > 0)

      return {
        ...product,
        variants,
        price: prices.length > 0 ? Math.min(...prices) : 0,
        sale_price: salePrices.length > 0 ? Math.min(...salePrices) : null,
      }
    }) as Product[]
  } catch (error) {
    console.error("Error in getFeaturedProducts:", error)
    return await getNewArrivals(limit) // Fallback to new arrivals
  }
}

/**
 * Lấy sản phẩm mới nhất
 * Sử dụng RLS policy "Products are viewable by everyone"
 */
export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()

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
        gender_id,
        perfume_type_id,
        concentration_id,
        deleted_at,
        created_at,
        updated_at,
        brand:brands(*),
        images:product_images(*)
      `,
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching new arrivals:", error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Lấy thông tin variants cho mỗi sản phẩm
    const productIds = data.map((product) => product.id)
    const { data: variantsData, error: variantsError } = await supabase
      .from("product_variants")
      .select("*")
      .in("product_id", productIds)
      .is("deleted_at", null)

    if (variantsError) {
      console.error("Error fetching variants for new arrivals:", variantsError)
    }

    // Nhóm variants theo product_id
    const variantsByProduct = (variantsData || []).reduce(
      (acc, variant) => {
        if (!acc[variant.product_id]) {
          acc[variant.product_id] = []
        }
        acc[variant.product_id].push(variant)
        return acc
      },
      {} as Record<number, any[]>,
    )

    // Kết hợp sản phẩm với variants và tính giá
    return data.map((product) => {
      const variants = variantsByProduct[product.id] || []

      // Tính giá thấp nhất từ variants
      const prices = variants.map((v) => v.price).filter((p) => p !== null && p > 0)
      const salePrices = variants.map((v) => v.sale_price).filter((p) => p !== null && p > 0)

      return {
        ...product,
        variants,
        price: prices.length > 0 ? Math.min(...prices) : 0,
        sale_price: salePrices.length > 0 ? Math.min(...salePrices) : null,
      }
    }) as Product[]
  } catch (error) {
    console.error("Error in getNewArrivals:", error)
    return []
  }
}

/**
 * Lấy sản phẩm đang giảm giá
 * Kết hợp sản phẩm có nhãn "Sale" và sản phẩm có variant giảm giá
 */
export async function getProductsOnSale(limit = 8): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()

  try {
    // Kiểm tra xem có sản phẩm nào không
    const { data: productsCheck, error: productsCheckError } = await supabase
      .from("products")
      .select("id")
      .is("deleted_at", null)
      .limit(1)

    if (productsCheckError) {
      console.error("Error checking products:", productsCheckError)
      return []
    }

    // Nếu không có sản phẩm nào, trả về mảng rỗng
    if (!productsCheck || productsCheck.length === 0) {
      console.log("No products found in database")
      return []
    }

    // Lấy ID của nhãn "Sale" hoặc tương tự
    const { data: saleLabel, error: labelError } = await supabase
      .from("product_labels")
      .select("id")
      .or("name.ilike.%sale%,name.ilike.%giảm giá%")
      .limit(1)
      .maybeSingle()

    // Nếu không tìm thấy nhãn, sử dụng ID mặc định là 2 (thường là Sale)
    const labelId = saleLabel?.id || 2

    // Lấy sản phẩm có nhãn "Sale"
    let productsWithSaleLabel: any[] = []
    if (labelId) {
      const { data, error } = await supabase
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
            gender_id,
            perfume_type_id,
            concentration_id,
            deleted_at,
            created_at,
            updated_at,
            brand:brands(*),
            images:product_images(*)
          )
        `,
        )
        .eq("label_id", labelId)
        .is("products.deleted_at", null)
        .limit(limit * 2) // Lấy nhiều hơn để có đủ sau khi lọc

      if (error) {
        console.error("Error fetching products with Sale label:", error)
      } else if (data) {
        productsWithSaleLabel = data
      }
    }

    // Lấy sản phẩm có variant giảm giá
    const { data: productsWithSalePrice, error: salePriceError } = await supabase
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
          gender_id,
          perfume_type_id,
          concentration_id,
          deleted_at,
          created_at,
          updated_at,
          brand:brands(*),
          images:product_images(*)
        )
      `,
      )
      .not("sale_price", "is", null)
      .gt("sale_price", 0)
      .is("products.deleted_at", null)
      .limit(limit * 2) // Lấy nhiều hơn để có đủ sau khi lọc

    if (salePriceError) {
      console.error("Error fetching products with sale price:", salePriceError)
    }

    // Kết hợp hai danh sách sản phẩm
    const allProductIds = new Set<number>()
    const allProducts: any[] = []

    // Thêm sản phẩm có nhãn Sale
    if (productsWithSaleLabel && productsWithSaleLabel.length > 0) {
      productsWithSaleLabel.forEach((item) => {
        if (!allProductIds.has(item.product_id)) {
          allProductIds.add(item.product_id)
          allProducts.push(item.products)
        }
      })
    }

    // Thêm sản phẩm có variant giảm giá
    if (productsWithSalePrice && productsWithSalePrice.length > 0) {
      productsWithSalePrice.forEach((item) => {
        if (!allProductIds.has(item.product_id)) {
          allProductIds.add(item.product_id)
          allProducts.push(item.products)
        }
      })
    }

    if (allProducts.length === 0) {
      console.log("No sale products found, falling back to new arrivals")
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    // Lấy thông tin variants cho tất cả sản phẩm
    const { data: variantsData, error: variantsError } = await supabase
      .from("product_variants")
      .select("*")
      .in("product_id", Array.from(allProductIds))
      .is("deleted_at", null)

    if (variantsError) {
      console.error("Error fetching variants for sale products:", variantsError)
    }

    // Nhóm variants theo product_id
    const variantsByProduct = (variantsData || []).reduce(
      (acc, variant) => {
        if (!acc[variant.product_id]) {
          acc[variant.product_id] = []
        }
        acc[variant.product_id].push(variant)
        return acc
      },
      {} as Record<number, any[]>,
    )

    // Kết hợp sản phẩm với variants và tính giá
    const productsWithPricing = allProducts
      .map((product) => {
        const variants = variantsByProduct[product.id] || []

        // Tính giá thấp nhất từ variants
        const prices = variants.map((v) => v.price).filter((p) => p !== null && p > 0)
        const salePrices = variants.map((v) => v.sale_price).filter((p) => p !== null && p > 0)

        return {
          ...product,
          variants,
          price: prices.length > 0 ? Math.min(...prices) : 0,
          sale_price: salePrices.length > 0 ? Math.min(...salePrices) : null,
        }
      })
      .filter((product) => product.sale_price !== null) // Chỉ giữ lại sản phẩm có giá giảm

    // Giới hạn số lượng sản phẩm trả về
    return productsWithPricing.slice(0, limit) as Product[]
  } catch (error) {
    console.error("Error in getProductsOnSale:", error)
    return await getNewArrivals(limit) // Fallback to new arrivals
  }
}

/**
 * Lấy sản phẩm bán chạy nhất
 * Sử dụng function get_best_selling_products từ function.txt
 */
export async function getBestSellingProducts(limit = 8): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()

  try {
    // Kiểm tra xem có sản phẩm nào không
    const { count: productsCount, error: productsCountError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)

    if (productsCountError) {
      console.error("Error checking products:", productsCountError)
      return []
    }

    // Nếu không có sản phẩm nào, trả về mảng rỗng
    if (productsCount === 0) {
      console.log("No products found in database")
      return []
    }

    // Sử dụng function get_best_selling_products từ database
    // Theo function.txt, function này trả về product_id, product_name, product_slug, brand_name, image_url, total_sold
    const { data: bestSellingData, error: functionError } = await supabase.rpc("get_best_selling_products", {
      p_limit: limit,
    })

    if (functionError) {
      console.error("Error calling get_best_selling_products function:", functionError)
      // Kiểm tra xem function có tồn tại không
      console.log("Falling back to alternative method for best selling products")
      return await getFallbackBestSellingProducts(limit) // Fallback method
    }

    if (!bestSellingData || bestSellingData.length === 0) {
      console.log("No best selling products found from function, using fallback")
      return await getFallbackBestSellingProducts(limit) // Fallback method
    }

    // Lấy thông tin chi tiết cho các sản phẩm bán chạy
    const productIds = bestSellingData.map((item) => item.product_id)

    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        short_description,
        brand_id,
        gender_id,
        perfume_type_id,
        concentration_id,
        deleted_at,
        created_at,
        updated_at,
        brand:brands(*),
        images:product_images(*)
      `,
      )
      .in("id", productIds)
      .is("deleted_at", null)

    if (productsError) {
      console.error("Error fetching best selling product details:", productsError)
      return await getFallbackBestSellingProducts(limit) // Fallback method
    }

    // Lấy thông tin variants cho các sản phẩm
    const { data: variantsData, error: variantsError } = await supabase
      .from("product_variants")
      .select("*")
      .in("product_id", productIds)
      .is("deleted_at", null)

    if (variantsError) {
      console.error("Error fetching variants for best selling products:", variantsError)
    }

    // Nhóm variants theo product_id
    const variantsByProduct = (variantsData || []).reduce(
      (acc, variant) => {
        if (!acc[variant.product_id]) {
          acc[variant.product_id] = []
        }
        acc[variant.product_id].push(variant)
        return acc
      },
      {} as Record<number, any[]>,
    )

    // Tạo map để lưu thông tin total_sold từ bestSellingData
    const totalSoldMap = bestSellingData.reduce(
      (acc, item) => {
        acc[item.product_id] = item.total_sold
        return acc
      },
      {} as Record<number, number>,
    )

    // Sắp xếp sản phẩm theo thứ tự bán chạy
    const sortedProducts = productIds
      .map((id) => {
        const product = productsData.find((p) => p.id === id)
        if (!product) return null

        const variants = variantsByProduct[product.id] || []

        // Tính giá thấp nhất từ variants
        const prices = variants.map((v) => v.price).filter((p) => p !== null && p > 0)
        const salePrices = variants.map((v) => v.sale_price).filter((p) => p !== null && p > 0)

        return {
          ...product,
          variants,
          total_sold: totalSoldMap[product.id] || 0,
          price: prices.length > 0 ? Math.min(...prices) : 0,
          sale_price: salePrices.length > 0 ? Math.min(...salePrices) : null,
        }
      })
      .filter(Boolean) as Product[]

    return sortedProducts
  } catch (error) {
    console.error("Error in getBestSellingProducts:", error)
    return await getFallbackBestSellingProducts(limit) // Fallback method
  }
}

/**
 * Phương thức dự phòng để lấy sản phẩm bán chạy khi function không hoạt động
 */
async function getFallbackBestSellingProducts(limit = 8): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()

  try {
    console.log("Using fallback method for best selling products")

    // Kiểm tra xem có bảng order_items không
    const { count: orderItemsCount, error: orderItemsCountError } = await supabase
      .from("order_items")
      .select("*", { count: "exact", head: true })

    if (orderItemsCountError) {
      console.error("Error checking order_items:", orderItemsCountError)
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    // Nếu không có order_items nào, fallback to new arrivals
    if (orderItemsCount === 0) {
      console.log("No order_items found, falling back to new arrivals")
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    // Kiểm tra xem có bảng product_variants không
    const { count: variantsCount, error: variantsCountError } = await supabase
      .from("product_variants")
      .select("*", { count: "exact", head: true })

    if (variantsCountError) {
      console.error("Error checking product_variants:", variantsCountError)
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    // Nếu không có product_variants nào, fallback to new arrivals
    if (variantsCount === 0) {
      console.log("No product_variants found, falling back to new arrivals")
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    // Lấy các order_items có số lượng cao nhất
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from("order_items")
      .select(
        `
        variant_id,
        quantity
      `,
      )
      .order("quantity", { ascending: false })
      .limit(50)

    if (orderItemsError) {
      console.error("Error fetching order items for best selling products:", orderItemsError)
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    if (!orderItemsData || orderItemsData.length === 0) {
      console.log("No order items found, falling back to new arrivals")
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    // Lấy product_id từ variant_id
    const variantIds = orderItemsData.map((item) => item.variant_id)
    const { data: variantsData, error: variantsError } = await supabase
      .from("product_variants")
      .select("id, product_id")
      .in("id", variantIds)

    if (variantsError) {
      console.error("Error fetching product_variants:", variantsError)
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    if (!variantsData || variantsData.length === 0) {
      console.log("No variants found, falling back to new arrivals")
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    // Tạo map từ variant_id đến product_id
    const variantToProductMap: Record<number, number> = {}
    variantsData.forEach((variant) => {
      variantToProductMap[variant.id] = variant.product_id
    })

    // Tính tổng số lượng bán ra cho mỗi sản phẩm
    const productSales: Record<number, number> = {}
    orderItemsData.forEach((item) => {
      const productId = variantToProductMap[item.variant_id]
      if (productId) {
        if (!productSales[productId]) {
          productSales[productId] = 0
        }
        productSales[productId] += item.quantity
      }
    })

    // Sắp xếp sản phẩm theo số lượng bán ra
    const sortedProductIds = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => Number.parseInt(id))
      .slice(0, limit)

    if (sortedProductIds.length === 0) {
      console.log("No products found after sorting, falling back to new arrivals")
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    // Lấy thông tin chi tiết cho các sản phẩm
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        short_description,
        brand_id,
        gender_id,
        perfume_type_id,
        concentration_id,
        deleted_at,
        created_at,
        updated_at,
        brand:brands(*),
        images:product_images(*)
      `,
      )
      .in("id", sortedProductIds)
      .is("deleted_at", null)

    if (productsError) {
      console.error("Error fetching best selling product details:", productsError)
      return await getNewArrivals(limit) // Fallback to new arrivals
    }

    // Lấy thông tin variants cho các sản phẩm
    const { data: allVariantsData, error: allVariantsError } = await supabase
      .from("product_variants")
      .select("*")
      .in("product_id", sortedProductIds)
      .is("deleted_at", null)

    if (allVariantsError) {
      console.error("Error fetching variants for best selling products:", allVariantsError)
    }

    // Nhóm variants theo product_id
    const variantsByProduct = (allVariantsData || []).reduce(
      (acc, variant) => {
        if (!acc[variant.product_id]) {
          acc[variant.product_id] = []
        }
        acc[variant.product_id].push(variant)
        return acc
      },
      {} as Record<number, any[]>,
    )

    // Sắp xếp sản phẩm theo thứ tự bán chạy
    const sortedProducts = sortedProductIds
      .map((id) => {
        const product = productsData.find((p) => p.id === id)
        if (!product) return null

        const variants = variantsByProduct[product.id] || []

        // Tính giá thấp nhất từ variants
        const prices = variants.map((v) => v.price).filter((p) => p !== null && p > 0)
        const salePrices = variants.map((v) => v.sale_price).filter((p) => p !== null && p > 0)

        return {
          ...product,
          variants,
          total_sold: productSales[product.id] || 0,
          price: prices.length > 0 ? Math.min(...prices) : 0,
          sale_price: salePrices.length > 0 ? Math.min(...salePrices) : null,
        }
      })
      .filter(Boolean) as Product[]

    return sortedProducts
  } catch (error) {
    console.error("Error in getFallbackBestSellingProducts:", error)
    return await getNewArrivals(limit) // Fallback to new arrivals
  }
}

/**
 * Lấy danh mục nổi bật
 */
export async function getFeaturedCategories(limit = 6): Promise<Category[]> {
  const supabase = await getSupabaseServerClient()

  try {
    // Kiểm tra xem có bảng categories không
    const { count: categoriesCount, error: categoriesCountError } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true })

    if (categoriesCountError) {
      console.error("Error checking categories:", categoriesCountError)
      return []
    }

    // Nếu không có categories nào, trả về mảng rỗng
    if (categoriesCount === 0) {
      console.log("No categories found in database")
      return []
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_featured", true)
      .order("display_order", { ascending: true })
      .limit(limit)

    if (error) {
      console.error("Error fetching featured categories:", error)
      return []
    }

    // Nếu không có danh mục nổi bật, lấy bất kỳ danh mục nào
    if (!data || data.length === 0) {
      console.log("No featured categories found, fetching any categories")
      const { data: allCategories, error: allError } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true })
        .limit(limit)

      if (allError) {
        console.error("Error fetching all categories:", allError)
        return []
      }

      return allCategories as Category[]
    }

    return data as Category[]
  } catch (error) {
    console.error("Error in getFeaturedCategories:", error)
    return []
  }
}

/**
 * Lấy thương hiệu nổi bật
 */
export async function getFeaturedBrands(limit = 8): Promise<Brand[]> {
  const supabase = await getSupabaseServerClient()

  try {
    // Kiểm tra xem có bảng brands không
    const { count: brandsCount, error: brandsCountError } = await supabase
      .from("brands")
      .select("*", { count: "exact", head: true })

    if (brandsCountError) {
      console.error("Error checking brands:", brandsCountError)
      return []
    }

    // Nếu không có brands nào, trả về mảng rỗng
    if (brandsCount === 0) {
      console.log("No brands found in database")
      return []
    }

    // Lấy các thương hiệu có logo
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .not("logo_url", "is", null)
      .order("name", { ascending: true })
      .limit(limit)

    if (error) {
      console.error("Error fetching brands with logos:", error)
      return []
    }

    // Nếu không có thương hiệu có logo, lấy bất kỳ thương hiệu nào
    if (!data || data.length === 0) {
      console.log("No brands with logos found, fetching any brands")
      const { data: allBrands, error: allError } = await supabase
        .from("brands")
        .select("*")
        .order("name", { ascending: true })
        .limit(limit)

      if (allError) {
        console.error("Error fetching all brands:", allError)
        return []
      }

      return allBrands as Brand[]
    }

    return data as Brand[]
  } catch (error) {
    console.error("Error in getFeaturedBrands:", error)
    return []
  }
}

/**
 * Lấy banner đang hoạt động
 * Lọc theo ngày hiệu lực
 */
export async function getActiveBanners(): Promise<Banner[]> {
  const supabase = await getSupabaseServerClient()

  try {
    // Kiểm tra xem có bảng banners không
    const { count: bannersCount, error: bannersCountError } = await supabase
      .from("banners")
      .select("*", { count: "exact", head: true })

    if (bannersCountError) {
      console.error("Error checking banners:", bannersCountError)
      return []
    }

    // Nếu không có banners nào, trả về mảng rỗng
    if (bannersCount === 0) {
      console.log("No banners found in database")
      return []
    }

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching active banners:", error)
      return []
    }

    return data as Banner[]
  } catch (error) {
    console.error("Error in getActiveBanners:", error)
    return []
  }
}

