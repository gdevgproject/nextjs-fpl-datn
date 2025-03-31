"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient, type Session, type User } from "@supabase/auth-helpers-nextjs"
import type { Provider } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
// Import the cleanup function
import { cleanupAuthState, getErrorMessage, signInWithProvider } from "@/lib/auth/auth-utils"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean
  isStaff: boolean
}

interface AuthContextType extends AuthState {
  signUp: (
    email: string,
    password: string,
    metadata?: { [key: string]: any },
  ) => Promise<{ success: boolean; error: string | null }>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error: string | null }>
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error: string | null }>
  signInWithProvider: (provider: Provider) => Promise<{ success: boolean; error: string | null }>
  signOut: () => Promise<{ success: boolean; error: string | null }>
  resetPassword: (email: string) => Promise<{ success: boolean; error: string | null }>
  updatePassword: (password: string) => Promise<{ success: boolean; error: string | null }>
  refreshSession: () => Promise<void>
}

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isStaff: false,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

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

  // Check if user is admin
  const checkIsAdmin = async () => {
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

  // Check if user is staff
  const checkIsStaff = async () => {
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

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }))

        // Get current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (session) {
          // Get user profile
          const profile = await fetchProfile(session.user.id)

          // Check roles
          const [isAdmin, isStaff] = await Promise.all([checkIsAdmin(), checkIsStaff()])

          setState({
            user: session.user,
            session,
            profile,
            isLoading: false,
            isAdmin,
            isStaff,
          })
        } else {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isAdmin: false,
            isStaff: false,
          })
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isAdmin: false,
          isStaff: false,
        })
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session) {
          const profile = await fetchProfile(session.user.id)

          // Check roles
          const [isAdmin, isStaff] = await Promise.all([checkIsAdmin(), checkIsStaff()])

          setState({
            user: session.user,
            session,
            profile,
            isLoading: false,
            isAdmin,
            isStaff,
          })
        }
      } else if (event === "SIGNED_OUT") {
        // Ensure we clear the state completely
        setState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isAdmin: false,
          isStaff: false,
        })

        // Don't redirect here if we're already handling it in the signOut function
        // This prevents double redirects
      } else if (event === "USER_DELETED") {
        setState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isAdmin: false,
          isStaff: false,
        })

        // Redirect to home page and show a message
        router.push("/")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  // Sign up
  const signUp = async (email: string, password: string, metadata?: { [key: string]: any }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: metadata,
        },
      })

      if (error) {
        return { success: false, error: getErrorMessage(error) }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      return { success: false, error: getErrorMessage(error) }
    }
  }

  // Sign in
  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Set session expiry based on remember me option
          // Default is 1 hour, extended to 30 days if remember me is checked
          expiresIn: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60,
        },
      })

      if (error) {
        return { success: false, error: getErrorMessage(error) }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, error: getErrorMessage(error) }
    }
  }

  // Sign in with magic link
  const signInWithMagicLink = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { success: false, error: getErrorMessage(error) }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error("Magic link error:", error)
      return { success: false, error: getErrorMessage(error) }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      // Set loading state first
      setState((prev) => ({ ...prev, isLoading: true }))

      // Call Supabase signOut
      const { error } = await supabase.auth.signOut()

      // Clean up auth state regardless of Supabase response
      cleanupAuthState()

      if (error) {
        // Reset loading state on error
        setState((prev) => ({ ...prev, isLoading: false }))
        return { success: false, error: getErrorMessage(error) }
      }

      // Manually clear state immediately
      setState({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isAdmin: false,
        isStaff: false,
      })

      // Use router.push instead of router.refresh
      router.push("/")

      return { success: true, error: null }
    } catch (error) {
      console.error("Sign out error:", error)
      // Reset loading state on error
      setState((prev) => ({ ...prev, isLoading: false }))
      return { success: false, error: getErrorMessage(error) }
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dat-lai-mat-khau`,
      })

      if (error) {
        return { success: false, error: getErrorMessage(error) }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error("Reset password error:", error)
      return { success: false, error: getErrorMessage(error) }
    }
  }

  // Update password
  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        return { success: false, error: getErrorMessage(error) }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error("Update password error:", error)
      return { success: false, error: getErrorMessage(error) }
    }
  }

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Session refresh error:", error)
        return
      }

      const { session } = data

      if (session) {
        const profile = await fetchProfile(session.user.id)

        // Check roles
        const [isAdmin, isStaff] = await Promise.all([checkIsAdmin(), checkIsStaff()])

        setState({
          user: session.user,
          session,
          profile,
          isLoading: false,
          isAdmin,
          isStaff,
        })
      }
    } catch (error) {
      console.error("Unexpected session refresh error:", error)
    }
  }

  const value = {
    ...state,
    signUp,
    signIn,
    signInWithMagicLink,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

