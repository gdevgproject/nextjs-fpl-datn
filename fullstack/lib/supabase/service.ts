import { createClient } from "@supabase/supabase-js"
import type { Database } from "../types/database.types"

// Tạo Supabase client với service role key để có quyền admin
// Chỉ sử dụng trong server-side code (Server Actions, API Routes)
export const getSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables")
    throw new Error("Missing required environment variables for Supabase service client")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Hàm kiểm tra vai trò người dùng
export async function getUserRole(userId: string | undefined): Promise<"admin" | "staff" | "authenticated" | "anon"> {
  if (!userId) return "anon"

  const supabase = getSupabaseServiceClient()

  // Kiểm tra xem người dùng có phải admin hoặc staff không
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()

  if (error || !data) return "authenticated"

  return data.role as "admin" | "staff" | "authenticated"
}

