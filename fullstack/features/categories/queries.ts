import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Category } from "@/lib/types/shared.types"

// Hàm server-side để lấy tất cả danh mục
export async function getAllCategories(): Promise<Category[]> {
  const supabase = getSupabaseServerClient()

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

    // Lấy tất cả danh mục, sắp xếp theo display_order
    const { data, error } = await supabase.from("categories").select("*").order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    // Tạo cấu trúc cây danh mục
    const categories = data as Category[]

    return categories
  } catch (error) {
    console.error("Error in getAllCategories:", error)
    return []
  }
}

// Hàm để tạo cấu trúc cây danh mục
export function buildCategoryTree(categories: Category[]): Category[] {
  // Tạo map để truy cập nhanh các danh mục theo ID
  const categoryMap = new Map<number, Category & { children: Category[] }>()

  // Khởi tạo map với tất cả danh mục, thêm mảng children
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] })
  })

  // Danh sách danh mục gốc (không có parent)
  const rootCategories: Category[] = []

  // Xây dựng cây
  categories.forEach((category) => {
    const categoryWithChildren = categoryMap.get(category.id)!

    if (category.parent_category_id === null) {
      // Đây là danh mục gốc
      rootCategories.push(categoryWithChildren)
    } else {
      // Đây là danh mục con
      const parent = categoryMap.get(category.parent_category_id)
      if (parent) {
        parent.children.push(categoryWithChildren)
      } else {
        // Nếu không tìm thấy parent, coi như là danh mục gốc
        rootCategories.push(categoryWithChildren)
      }
    }
  })

  return rootCategories
}

// Hàm để đếm số sản phẩm trong mỗi danh mục
export async function getCategoryProductCounts(): Promise<Record<number, number>> {
  const supabase = getSupabaseServerClient()

  try {
    const { data, error } = await supabase.from("product_categories").select("category_id, count").select("category_id")

    if (error) {
      console.error("Error fetching category product counts:", error)
      return {}
    }

    // Đếm số lượng sản phẩm cho mỗi danh mục
    const counts: Record<number, number> = {}
    data.forEach((item) => {
      counts[item.category_id] = (counts[item.category_id] || 0) + 1
    })

    return counts
  } catch (error) {
    console.error("Error in getCategoryProductCounts:", error)
    return {}
  }
}

