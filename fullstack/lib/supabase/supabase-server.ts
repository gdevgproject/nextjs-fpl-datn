import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"
import { cache } from "react"

export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies()

  return createServerClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
})

export async function getSession() {
  const supabase = createServerSupabaseClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getUserDetails() {
  const supabase = createServerSupabaseClient()
  try {
    const { data: userDetails } = await supabase.from("profiles").select("*").single()

    return userDetails
  } catch (error) {
    console.error("Error getting user details:", error)
    return null
  }
}

export async function isUserAdmin() {
  const supabase = createServerSupabaseClient()
  try {
    const { data, error } = await supabase.rpc("is_admin")
    if (error) throw error
    return !!data
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function isUserStaff() {
  const supabase = createServerSupabaseClient()
  try {
    const { data, error } = await supabase.rpc("is_staff")
    if (error) throw error
    return !!data
  } catch (error) {
    console.error("Error checking staff status:", error)
    return false
  }
}

