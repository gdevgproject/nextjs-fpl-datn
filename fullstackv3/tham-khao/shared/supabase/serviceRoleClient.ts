import { createClient } from "@supabase/supabase-js"

// IMPORTANT: This client should ONLY be used in server-side code
// NEVER expose the service role key to the client
export function createServiceRoleClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
