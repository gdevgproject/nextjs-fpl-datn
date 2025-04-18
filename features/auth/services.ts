import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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

// Lấy profile theo userId (client)
export async function getProfileByIdClient(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
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
