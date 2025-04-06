import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// Hàm tạo Supabase client từ cookies
export const createClient = async () => {
  // Chờ lấy cookies từ Next.js headers
  const cookieStore = await cookies(); // await để lấy giá trị cookie chính xác

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Kiểm tra biến môi trường
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  // Trả về client Supabase với cấu hình cookies
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Lấy giá trị cookie
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      // Set giá trị cookie
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          console.warn("Cookie couldn't be set:", error);
        }
      },
      // Remove cookie
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch (error) {
          console.warn("Cookie couldn't be removed:", error);
        }
      },
    },
  });
};

// Hàm tạo client với Service Role (quyền admin, bypass RLS)
export const createServiceRoleClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase service role environment variables");
  }

  return createServiceClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Helper cho server actions dùng dễ
export const getSupabaseServerClient = async () => {
  // Chắc chắn hàm này là async
  const supabaseClient = await createClient(); // Chờ để lấy client
  return supabaseClient;
};
