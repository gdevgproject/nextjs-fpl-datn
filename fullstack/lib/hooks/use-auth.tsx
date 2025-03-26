"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { createClientSupabaseClient } from "@/lib/supabase/supabase-client"
import { useRouter } from "next/navigation"
import type { Tables } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"

type AuthContextType = {
  user: User | null
  profile: Tables<"profiles"> | null
  isLoading: boolean
  isAdmin: boolean
  isStaff: boolean
  signUp: (
    email: string,
    password: string,
    metadata: { display_name: string; phone_number: string },
  ) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isStaff, setIsStaff] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchUserProfile(session.user.id)
          await checkUserRoles()
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
        await checkUserRoles()
      } else {
        setProfile(null)
        setIsAdmin(false)
        setIsStaff(false)
      }

      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        throw error
      }

      setProfile(data)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      setProfile(null)
    }
  }

  const checkUserRoles = async () => {
    try {
      // Check if user is admin
      const { data: isAdminData, error: isAdminError } = await supabase.rpc("is_admin")
      if (isAdminError) throw isAdminError
      setIsAdmin(!!isAdminData)

      // Check if user is staff
      const { data: isStaffData, error: isStaffError } = await supabase.rpc("is_staff")
      if (isStaffError) throw isStaffError
      setIsStaff(!!isStaffData)
    } catch (error) {
      console.error("Error checking user roles:", error)
      setIsAdmin(false)
      setIsStaff(false)
    }
  }

  const signUp = async (email: string, password: string, metadata: { display_name: string; phone_number: string }) => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/xac-nhan-email`,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Error signing up:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Đã xảy ra lỗi khi đăng ký",
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Error signing in:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Đã xảy ra lỗi khi đăng nhập",
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()

      // Clear any auth-related local storage
      localStorage.removeItem("supabase.auth.token")

      // Show success toast
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi tài khoản",
        variant: "default",
      })

      // Redirect to home page
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Lỗi đăng xuất",
        description: "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dat-lai-mat-khau`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Error resetting password:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Đã xảy ra lỗi khi yêu cầu đặt lại mật khẩu",
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true)

      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Error updating password:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật mật khẩu",
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      setIsLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
        await checkUserRoles()
      }
    } catch (error) {
      console.error("Error refreshing session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    profile,
    isLoading,
    isAdmin,
    isStaff,
    signUp,
    signIn,
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

