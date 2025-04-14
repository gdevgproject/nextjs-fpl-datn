import { getSupabaseServerClient } from "@/lib/supabase/server"

// Hàm lấy các tùy chọn lọc
export async function getFilterOptions(searchParams: {
  [key: string]: string | string[] | undefined
}) {
  const supabase = getSupabaseServerClient()

  try {
    // Sử dụng RPC function để lấy tất cả tùy chọn lọc trong một lần gọi API
    const { data, error } = await supabase.rpc("get_plp_filter_options")

    if (error) {
      console.error("Error fetching filter options:", error)
      throw new Error(`Failed to fetch filter options: ${error.message}`)
    }

    return {
      brands: data?.brands || [],
      categories: data?.categories || [],
      genders: data?.genders || [],
      perfumeTypes: data?.perfumeTypes || [],
      concentrations: data?.concentrations || [],
      priceRanges: data?.priceRanges || [],
    }
  } catch (error) {
    console.error("Error in getFilterOptions:", error)
    throw error
  }
}

// Hàm lấy sản phẩm theo các tham số tìm kiếm
export async function getProducts(
  searchParams: { [key: string]: string | string[] | undefined },
  page = 1,
  limit = 12,
) {
  const supabase = getSupabaseServerClient()

  try {
    // Thông tin bổ sung cho tiêu đề trang
    let categoryInfo: {
      id: number
      name: string
      description: string | null
    } | null = null
    let brandInfo: {
      id: number
      name: string
      description: string | null
    } | null = null

    // Đầu tiên, lấy thông tin danh mục hoặc thương hiệu nếu cần (chỉ một lần, và chỉ khi cần)
    if (searchParams.category) {
      const categorySlug = searchParams.category as string
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id, name, description, slug")
        .eq("slug", categorySlug)
        .single()

      if (categoryError) {
        console.error("Error fetching category:", categoryError)
        throw new Error(`Failed to fetch category: ${categoryError.message}`)
      } else if (category) {
        categoryInfo = category as {
          id: number
          name: string
          description: string | null
        }
      }
    } else if (searchParams.brand) {
      const brandId = Number.parseInt(searchParams.brand as string, 10)
      const { data: brand, error: brandError } = await supabase
        .from("brands")
        .select("id, name, description")
        .eq("id", brandId)
        .single()

      if (brandError) {
        console.error("Error fetching brand:", brandError)
        throw new Error(`Failed to fetch brand: ${brandError.message}`)
      } else if (brand) {
        brandInfo = brand as {
          id: number
          name: string
          description: string | null
        }
      }
    }

    // Xây dựng query chính với FROM products và LEFT JOIN với các bảng liên quan
    let selectQuery = `
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
      images:product_images(*),
      variants:product_variants(*)
    `

    // Nếu cần lọc theo danh mục, thêm JOIN với product_categories
    if (searchParams.category && categoryInfo) {
      selectQuery = `
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
        images:product_images(*),
        variants:product_variants(*),
        categories:product_categories(category_id)
      `
    }

    // Bắt đầu xây dựng query
    let query = supabase.from("products").select(selectQuery, { count: "exact" }).is("deleted_at", null)

    // Tìm kiếm theo từ khóa
    if (searchParams.q) {
      const searchTerm = searchParams.q as string
      query = query.or(`name.ilike.%${searchTerm}%, short_description.ilike.%${searchTerm}%`)
    }

    // Lọc theo danh mục (đã có JOIN)
    if (searchParams.category && categoryInfo) {
      query = query.filter("categories.category_id", "eq", categoryInfo.id)
    }

    // Lọc theo thương hiệu
    if (searchParams.brand) {
      query = query.eq("brand_id", Number.parseInt(searchParams.brand as string, 10))
    }

    // Lọc theo giới tính
    if (searchParams.gender) {
      query = query.eq("gender_id", Number.parseInt(searchParams.gender as string, 10))
    }

    // Lọc theo loại nước hoa
    if (searchParams.perfume_type) {
      query = query.eq("perfume_type_id", Number.parseInt(searchParams.perfume_type as string, 10))
    }

    // Lọc theo nồng độ
    if (searchParams.concentration) {
      query = query.eq("concentration_id", Number.parseInt(searchParams.concentration as string, 10))
    }

    // Lọc theo khoảng giá và sản phẩm giảm giá
    let productIdsFilter: number[] | null = null

    // Sắp xếp sản phẩm: Đặc biệt xử lý cho sắp xếp theo giá
    let priceSort: null | { column: string; ascending: boolean } = null

    if (searchParams.sort) {
      const sort = searchParams.sort as string
      switch (sort) {
        case "price_asc":
          // Lưu lại thông tin sắp xếp theo giá tăng dần, sẽ xử lý sau
          priceSort = { column: "price", ascending: true }
          break
        case "price_desc":
          // Lưu lại thông tin sắp xếp theo giá giảm dần, sẽ xử lý sau
          priceSort = { column: "price", ascending: false }
          break
        case "name_asc":
          query = query.order("name", { ascending: true })
          break
        case "name_desc":
          query = query.order("name", { ascending: false })
          break
        default:
          query = query.order("created_at", { ascending: false })
          break
      }
    } else {
      query = query.order("created_at", { ascending: false })
    }

    // Lọc khoảng giá hoặc giảm giá: Đầu tiên truy vấn các variant để lấy product_ids
    if (searchParams.minPrice || searchParams.maxPrice || searchParams.sale === "true") {
      let variantQuery = supabase
        .from("product_variants")
        .select("product_id, price, sale_price")
        .is("deleted_at", null)

      // Lọc sản phẩm giảm giá
      if (searchParams.sale === "true") {
        variantQuery = variantQuery.not("sale_price", "is", null).gt("sale_price", 0)
      }

      const { data: variants, error: variantsError } = await variantQuery

      if (variantsError) {
        console.error("Error fetching variants for price filtering:", variantsError)
        throw new Error(`Failed to fetch variants: ${variantsError.message}`)
      }

      if (!variants || variants.length === 0) {
        // Không có sản phẩm nào thỏa mãn điều kiện
        return { products: [], count: 0, categoryInfo, brandInfo }
      }

      // Lọc theo khoảng giá - Thực hiện trên dữ liệu đã lấy về
      if (searchParams.minPrice || searchParams.maxPrice) {
        const minPrice = searchParams.minPrice ? Number.parseInt(searchParams.minPrice as string) : 0
        const maxPrice = searchParams.maxPrice
          ? Number.parseInt(searchParams.maxPrice as string)
          : Number.MAX_SAFE_INTEGER

        // Tạo map lưu giá hiệu quả thấp nhất cho mỗi sản phẩm
        const productMinPriceMap = new Map<number, number>()

        // Tính giá hiệu quả cho mỗi sản phẩm (ưu tiên giá sale nếu có)
        variants.forEach((variant: any) => {
          const effectivePrice =
            variant.sale_price !== null && variant.sale_price > 0 ? variant.sale_price : variant.price

          // Nếu chưa có giá cho sản phẩm này hoặc giá mới thấp hơn giá đã lưu
          if (
            !productMinPriceMap.has(variant.product_id) ||
            effectivePrice < productMinPriceMap.get(variant.product_id)!
          ) {
            productMinPriceMap.set(variant.product_id, effectivePrice)
          }
        })

        // Lọc sản phẩm theo khoảng giá
        const filteredProductIds = Array.from(productMinPriceMap.entries())
          .filter(([_, price]) => price >= minPrice && price <= maxPrice)
          .map(([productId, _]) => productId)

        if (filteredProductIds.length === 0) {
          // Không có sản phẩm nào thỏa mãn điều kiện giá
          return { products: [], count: 0, categoryInfo, brandInfo }
        }

        // Thêm điều kiện lọc theo danh sách sản phẩm
        productIdsFilter = filteredProductIds
      } else {
        // Nếu chỉ lọc theo sale, lấy tất cả ID từ variants đã lọc
        productIdsFilter = [...new Set(variants.map((v: any) => v.product_id))]
      }

      // Thêm điều kiện lọc theo danh sách sản phẩm
      query = query.in("id", productIdsFilter)
    }

    // Phân trang
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // Thực thi query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching products:", error)
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return { products: [], count: 0, categoryInfo, brandInfo }
    }

    // Xử lý dữ liệu trả về
    let products = data.map((product: any) => {
      const variants = product.variants || []

      // Tính giá thấp nhất từ variants
      const prices = variants.map((v: any) => v.price).filter((p: any) => p !== null && p > 0)
      const salePrices = variants.map((v: any) => v.sale_price).filter((p: any) => p !== null && p > 0)

      return {
        ...product,
        price: prices.length > 0 ? Math.min(...prices) : 0,
        sale_price: salePrices.length > 0 ? Math.min(...salePrices) : null,
      }
    })

    // Sắp xếp theo giá nếu cần (sau khi đã tính toán giá từ variants)
    if (priceSort) {
      products = products.sort((a: any, b: any) => {
        // Ưu tiên giá khuyến mãi nếu có
        const priceA = a.sale_price !== null && a.sale_price > 0 ? a.sale_price : a.price
        const priceB = b.sale_price !== null && b.sale_price > 0 ? b.sale_price : b.price

        return priceSort.ascending ? priceA - priceB : priceB - priceA
      })
    }

    return { products, count: count || 0, categoryInfo, brandInfo }
  } catch (error) {
    console.error("Error in getProducts:", error)
    throw error
  }
}

// Hàm lấy sản phẩm theo slug
export async function getProductBySlug(slug: string) {
  const supabase = getSupabaseServerClient()

  try {
    // Lấy thông tin sản phẩm
    const { data, error } = await supabase
      .from("products")
      .select(
        `
      *,
      brand:brands(*),
      gender:genders(*),
      perfume_type:perfume_types(*),
      concentration:concentrations(*),
      images:product_images(*),
      variants:product_variants(*),
      product_scents:product_scents(scent_type, scent:scents(*)),
      product_ingredients:product_ingredients(ingredient:ingredients(*))
    `,
      )
      .eq("slug", slug)
      .is("deleted_at", null)
      .single()

    if (error) {
      console.error("Error fetching product by slug:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getProductBySlug:", error)
    return null
  }
}

// Hàm lấy đánh giá của sản phẩm
export async function getProductReviews(productId: number) {
  const supabase = getSupabaseServerClient()

  try {
    // First, fetch the reviews for the product
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(
        `
    *,
    replies:review_replies(*)
  `,
      )
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching product reviews:", error)
      return []
    }

    if (!reviews || reviews.length === 0) {
      return []
    }

    // Extract user IDs from reviews
    const userIds = reviews.map((review: any) => review.user_id)

    // Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", userIds)

    if (profilesError) {
      console.error("Error fetching profiles for reviews:", profilesError)
      // Return reviews without profile data
      return reviews
    }

    // Create a map of user_id to profile
    const profileMap = (profiles || []).reduce(
      (map: Record<string, any>, profile: any) => {
        map[profile.id] = profile
        return map
      },
      {} as Record<string, any>,
    )

    // Combine reviews with profiles
    const reviewsWithProfiles = reviews.map((review: any) => ({
      ...review,
      profiles: profileMap[review.user_id] || null,
    }))

    return reviewsWithProfiles
  } catch (error) {
    console.error("Error in getProductReviews:", error)
    return []
  }
}

// Hàm kiểm tra người dùng đã mua sản phẩm chưa
export async function hasUserPurchasedProduct(productId: number) {
  const supabase = getSupabaseServerClient()

  try {
    // Kiểm tra session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return false
    }

    // Sử dụng RPC function đã định nghĩa trong database
    const { data, error } = await supabase.rpc("has_user_purchased_product", {
      p_product_id: productId,
    })

    if (error) {
      console.error("Error checking if user purchased product:", error)
      return false
    }

    return data || false
  } catch (error) {
    console.error("Error in hasUserPurchasedProduct:", error)
    return false
  }
}

// Hàm lấy sản phẩm liên quan
export async function getRelatedProducts(productId: number, brandId: number | null, limit = 4) {
  const supabase = getSupabaseServerClient()

  try {
    // Bắt đầu xây dựng query
    let query = supabase
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
     images:product_images(*),
     variants:product_variants(*)
   `,
      )
      .neq("id", productId)
      .is("deleted_at", null)
      .limit(limit)

    // Nếu có brandId, lấy sản phẩm cùng thương hiệu
    if (brandId) {
      query = query.eq("brand_id", brandId)
    }

    // Thực thi query
    const { data: initialData, error } = await query

    if (error) {
      console.error("Error fetching related products:", error)
      return []
    }

    // Sử dụng biến mới để lưu kết quả
    let resultData = initialData || []

    // Nếu không đủ sản phẩm liên quan, lấy thêm sản phẩm mới nhất
    if (!initialData || initialData.length < limit) {
      const remainingLimit = limit - (initialData?.length || 0)
      const { data: newProducts, error: newError } = await supabase
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
       images:product_images(*),
       variants:product_variants(*)
     `,
        )
        .neq("id", productId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(remainingLimit)

      if (newError) {
        console.error("Error fetching additional related products:", newError)
      } else if (newProducts) {
        // Kết hợp hai danh sách sản phẩm
        const combinedProducts = [...resultData, ...newProducts]
        // Loại bỏ các sản phẩm trùng lặp
        resultData = combinedProducts.filter(
          (product: any, index: number, self: any[]) => index === self.findIndex((p) => p.id === product.id),
        )
      }
    }

    // Xử lý dữ liệu trả về
    const products = resultData.map((product: any) => {
      const variants = product.variants || []

      // Tính giá thấp nhất từ variants
      const prices = variants.map((v: any) => v.price).filter((p: any) => p !== null && p > 0)
      const salePrices = variants.map((v: any) => v.sale_price).filter((p: any) => p !== null && p > 0)

      return {
        ...product,
        price: prices.length > 0 ? Math.min(...prices) : 0,
        sale_price: salePrices.length > 0 ? Math.min(...salePrices) : null,
      }
    })

    return products
  } catch (error) {
    console.error("Error in getRelatedProducts:", error)
    return []
  }
}

