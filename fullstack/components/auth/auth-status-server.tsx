import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

/**
 * Server component to check if a user is authenticated
 * Use this in server components where you need to check auth status
 */
export async function getAuthStatus() {
  const supabase = createServerComponentClient<Database>({ cookies })

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      return { isAuthenticated: false, user: null, session: null }
    }

    if (!session) {
      return { isAuthenticated: false, user: null, session: null }
    }

    return {
      isAuthenticated: true,
      user: session.user,
      session,
    }
  } catch (error) {
    console.error("Unexpected error getting auth status:", error)
    return { isAuthenticated: false, user: null, session: null }
  }
}

/**
 * Server component to check if a user is an admin
 */
export async function isAdminServer() {
  const supabase = createServerComponentClient<Database>({ cookies })

  try {
    const { data, error } = await supabase.rpc("is_admin")

    if (error) {
      console.error("Error checking admin status:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Unexpected error checking admin status:", error)
    return false
  }
}

/**
 * Server component to check if a user is a staff member
 */
export async function isStaffServer() {
  const supabase = createServerComponentClient<Database>({ cookies })

  try {
    const { data, error } = await supabase.rpc("is_staff")

    if (error) {
      console.error("Error checking staff status:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Unexpected error checking staff status:", error)
    return false
  }
}

/**
 * Server component to get user profile
 */
export async function getUserProfileServer() {
  const supabase = createServerComponentClient<Database>({ cookies })

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return null
    }

    const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Unexpected error fetching profile:", error)
    return null
  }
}

