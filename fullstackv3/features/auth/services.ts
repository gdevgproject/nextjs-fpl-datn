import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Lấy profile theo userId (server)
export async function getProfileById(userId: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

// Lấy user theo email (server, dùng cho kiểm tra đăng ký)
export async function getUserByEmail(email: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;
  return data.users.find((u: User) => u.email === email) || null;
}

// Lấy session phía server
export async function getSessionServer() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Lấy session phía client
export async function getSessionClient() {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
