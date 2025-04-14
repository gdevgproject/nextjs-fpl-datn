import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Brand } from "./types"

// Hàm server-side để lấy tất cả thương hiệu
export async function getAllBrands(): Promise<Brand[]> {
  const supabase = getSupabaseServerClient()

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

    // Lấy tất cả thương hiệu, sắp xếp theo tên
    const { data, error } = await supabase.from("brands").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching brands:", error)
      return []
    }

    return data as Brand[]
  } catch (error) {
    console.error("Error in getAllBrands:", error)
    return []
  }
}

// Hàm để đếm số sản phẩm trong mỗi thương hiệu
export async function getBrandProductCounts(): Promise<Record<number, number>> {
  const supabase = getSupabaseServerClient()

  try {
    const { data, error } = await supabase.from("products").select("brand_id").is("deleted_at", null)

    if (error) {
      console.error("Error fetching brand product counts:", error)
      return {}
    }

    // Đếm số lượng sản phẩm cho mỗi thương hiệu
    const counts: Record<number, number> = {}
    data.forEach((item) => {
      if (item.brand_id) {
        counts[item.brand_id] = (counts[item.brand_id] || 0) + 1
      }
    })

    return counts
  } catch (error) {
    console.error("Error in getBrandProductCounts:", error)
    return {}
  }
}

