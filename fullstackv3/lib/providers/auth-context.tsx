"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "../supabase/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Profile } from "@/features/account/types"
import { handleApiError } from "../utils/error-utils"
import { getUserRoleFromMetadata } from "../utils/auth-utils"
import type { UserRole } from "@/features/auth/types"
import { DEFAULT_AVATAR_URL } from "../constants"

type AuthState = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  role: UserRole
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  profileImageUrl: string
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  role: UserRole
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  profileImageUrl: DEFAULT_AVATAR_URL,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  role: "anon",
  signOut: async () => {},
  refreshProfile: async () => {},
  updateProfile: async () => ({ success: false }),
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Thêm state để theo dõi xem component đã mounted chưa
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    role: "anon",
  })

  const supabase = getSupabaseBrowserClient()
  const queryClient = useQueryClient()
  const router = useRouter()

  // Sử dụng React Query để fetch profile data
  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", state.user?.id],
    queryFn: async () => {
      if (!state.user) return null

      try {
        // Thêm tham số cache-busting
        const timestamp = Date.now()
        const { data, error } = await supabase.from("profiles").select("*").eq("id", state.user.id).single()

        if (error) throw error

        return data as Profile
      } catch (error) {
        console.error("Error fetching profile:", error)
        throw new Error(handleApiError(error))
      }
    },
    enabled: !!state.user && mounted, // Chỉ fetch khi đã mounted
    staleTime: 0, // Giảm staleTime để luôn fetch dữ liệu mới
    refetchOnWindowFocus: true, // Refetch khi focus lại window
  })

  // Tính toán profileImageUrl từ profile
  const profileImageUrl = useMemo(() => {
    return profile?.avatar_url || DEFAULT_AVATAR_URL
  }, [profile])

  // Fetch user session
  const fetchUserData = useCallback(async () => {
    if (!mounted) return // Chỉ fetch khi đã mounted

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // Xác định role từ app_metadata
        const role = getUserRoleFromMetadata(session.user)

        setState({
          user: session.user,
          session,
          isLoading: false,
          isAuthenticated: true,
          role,
        })

        // Fetch profile data ngay lập tức
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (!profileError && profileData) {
            // Cập nhật cache React Query với profile data
            queryClient.setQueryData(["profile", session.user.id], profileData)
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
        }
      } else {
        setState({
          user: null,
          session: null,
          isLoading: false,
          role: "anon",
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [supabase, queryClient, mounted])

  // Đánh dấu component đã mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initial fetch
  useEffect(() => {
    if (!mounted) return // Chỉ fetch khi đã mounted

    let isMounted = true

    const initAuth = async () => {
      await fetchUserData()
    }

    initAuth()

    // Update the auth state change listener to better handle automatic login

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      console.log("Auth state changed:", event, session?.user?.id)

      if (session?.user) {
        // Determine role from app_metadata
        const role = getUserRoleFromMetadata(session.user)

        // Update state immediately for UI to react quickly
        setState({
          user: session.user,
          session,
          isLoading: false,
          isAuthenticated: true,
          role,
        })

        // Prefetch profile data to have it ready in cache
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single()

            if (!profileError && profileData) {
              // Update React Query cache with profile data
              queryClient.setQueryData(["profile", session.user.id], profileData)

              // Force refresh to ensure UI is updated
              queryClient.invalidateQueries({
                queryKey: ["profile", session.user.id],
              })
            }
          } catch (error) {
            console.error("Error prefetching profile:", error)
          }
        }
      } else {
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          role: "anon",
        })

        // Clear profile data from cache
        queryClient.removeQueries({ queryKey: ["profile"] })
      }
    })

    // Xử lý đồng bộ giữa các tab
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.includes("supabase.auth.token")) {
        fetchUserData()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      isMounted = false
      subscription.unsubscribe()
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [supabase, queryClient, fetchUserData, mounted])

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        role: "anon",
      })

      // Clear user-related queries
      queryClient.removeQueries({ queryKey: ["profile"] })
      queryClient.removeQueries({ queryKey: ["addresses"] })
      queryClient.removeQueries({ queryKey: ["orders"] })
      queryClient.removeQueries({ queryKey: ["cart"] })
      queryClient.removeQueries({ queryKey: ["wishlist"] })

      // Force refresh page để đảm bảo UI được cập nhật
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }, [supabase, queryClient])

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (!state.user) return

    try {
      console.log("Bắt đầu refresh profile cho user:", state.user.id)

      // Thêm tham số cache-busting
      const timestamp = Date.now()

      // Fetch profile trực tiếp từ Supabase thay vì dùng refetch
      const { data, error } = await supabase.from("profiles").select("*").eq("id", state.user.id).single()

      if (error) {
        console.error("Lỗi khi fetch profile:", error)
        throw error
      }

      // Cập nhật cache React Query với profile data mới
      queryClient.setQueryData(["profile", state.user.id], data)

      // Force invalidate để đảm bảo UI được cập nhật
      queryClient.invalidateQueries({ queryKey: ["profile", state.user.id] })

      console.log("Profile đã được refresh thành công:", data)

      return data
    } catch (error) {
      console.error("Lỗi khi refresh profile:", error)
      throw error
    }
  }, [state.user, supabase, queryClient])

  // Update profile data
  const updateProfile = async (data: Partial<Profile>) => {
    if (!state.user) return { success: false, error: "Không có người dùng đăng nhập" }

    try {
      const { error } = await supabase.from("profiles").update(data).eq("id", state.user.id)

      if (error) throw error

      // Invalidate profile query để fetch lại profile data
      queryClient.invalidateQueries({ queryKey: ["profile", state.user.id] })
      return { success: true }
    } catch (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: handleApiError(error) }
    }
  }

  // Tạo context value
  const value: AuthContextType = useMemo(
    () => ({
      ...state,
      profile: profile || null,
      profileImageUrl,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [state, profile, profileImageUrl, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

