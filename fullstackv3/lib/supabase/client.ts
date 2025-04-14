import { createBrowserClient } from "@supabase/ssr"

// Sử dụng một biến để theo dõi xem client đã được khởi tạo chưa
let isInitialized = false
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export const getSupabaseBrowserClient = () => {
  // Chỉ tạo client nếu đang ở client-side
  if (typeof window !== "undefined" && !isInitialized) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables")
    }

    supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    isInitialized = true
  }

  return supabaseClient!
}

