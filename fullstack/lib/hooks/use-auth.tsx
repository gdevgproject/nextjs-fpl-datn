"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { createClientSupabaseClient } from "@/lib/supabase/supabase-client"
import { useRouter } from "next/navigation"
import type { Tables } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"
import { savePendingConfirmationEmail } from "@/lib/auth/auth-utils"

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
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; cooldown?: number }>
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

  // Cập nhật hàm handleDeletedAccount để xử lý tốt hơn khi tài khoản bị xóa
  const handleDeletedAccount = async () => {
    try {
      // Đăng xuất người dùng
      await supabase.auth.signOut()

      // Xóa dữ liệu người dùng khỏi state
      setUser(null)
      setProfile(null)
      setSession(null)
      setIsAdmin(false)
      setIsStaff(false)

      // Hiển thị thông báo cho người dùng
      toast({
        title: "Phiên đăng nhập đã hết hạn",
        description:
          "Tài khoản của bạn không còn tồn tại hoặc đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ nếu bạn cần trợ giúp.",
        variant: "destructive",
      })

      // Chuyển hướng người dùng đến trang đăng nhập
      router.push("/dang-nhap?error=account_deleted")
      router.refresh()
    } catch (error) {
      console.error("Error handling deleted account:", error)
    }
  }

  // Cập nhật phần xử lý lỗi trong getInitialSession
  const getInitialSession = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      // Kiểm tra lỗi session
      if (sessionError) {
        console.error("Error getting session:", sessionError)
        await handleDeletedAccount()
        return
      }

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        try {
          await fetchUserProfile(session.user.id)
          await checkUserRoles()
        } catch (error) {
          // Nếu có lỗi khi lấy profile hoặc kiểm tra quyền, có thể tài khoản đã bị xóa
          if (
            error instanceof Error &&
            (error.message.includes("user does not exist") ||
              error.message.includes("no rows returned") ||
              error.message.includes("JWT subject not found"))
          ) {
            await handleDeletedAccount()
          } else {
            console.error("Error initializing user data:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error getting initial session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
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

  // Cập nhật hàm fetchUserProfile để xử lý lỗi tốt hơn
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        // Kiểm tra nếu lỗi là do không tìm thấy profile (tài khoản đã bị xóa)
        if (error.code === "PGRST116" || error.message.includes("no rows returned")) {
          // Đăng xuất người dùng vì tài khoản không còn tồn tại
          await handleDeletedAccount()
          return
        }
        throw error
      }

      setProfile(data)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      setProfile(null)
      throw error // Ném lỗi để có thể xử lý ở cấp cao hơn
    }
  }

  // Cập nhật hàm checkUserRoles để xử lý lỗi tốt hơn
  const checkUserRoles = async () => {
    try {
      // Check if user is admin
      const { data: isAdminData, error: isAdminError } = await supabase.rpc("is_admin")

      // Nếu lỗi là do không tìm thấy người dùng, xử lý tài khoản bị xóa
      if (
        isAdminError &&
        (isAdminError.message.includes("user does not exist") || isAdminError.message.includes("JWT subject not found"))
      ) {
        await handleDeletedAccount()
        return
      }

      if (isAdminError) throw isAdminError
      setIsAdmin(!!isAdminData)

      // Check if user is staff
      const { data: isStaffData, error: isStaffError } = await supabase.rpc("is_staff")

      // Nếu lỗi là do không tìm thấy người dùng, xử lý tài khoản bị xóa
      if (
        isStaffError &&
        (isStaffError.message.includes("user does not exist") || isStaffError.message.includes("JWT subject not found"))
      ) {
        await handleDeletedAccount()
        return
      }

      if (isStaffError) throw isStaffError
      setIsStaff(!!isStaffData)
    } catch (error) {
      console.error("Error checking user roles:", error)
      setIsAdmin(false)
      setIsStaff(false)
      throw error // Ném lỗi để có thể xử lý ở cấp cao hơn
    }
  }

  // Cập nhật hàm signUp để phản ánh cấu hình xác nhận email
  const signUp = async (email: string, password: string, metadata: { display_name: string; phone_number: string }) => {
    try {
      setIsLoading(true)

      // Cấu hình URL chuyển hướng
      const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=signup&next=/xac-nhan-email`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Kiểm tra nếu người dùng đã tồn tại nhưng chưa xác nhận email
      if (data.user && !data.user.email_confirmed_at) {
        // Lưu email đang chờ xác nhận
        savePendingConfirmationEmail(email)
        return { success: true }
      }

      // Nếu người dùng đã tồn tại và đã xác nhận email
      if (data.user && data.user.email_confirmed_at) {
        return {
          success: false,
          error: "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.",
        }
      }

      // Lưu email đang chờ xác nhận
      savePendingConfirmationEmail(email)
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

  const signInWithMagicLink = async (email: string) => {
    try {
      setIsLoading(true)

      // Cấu hình URL chuyển hướng
      const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Error signing in with magic link:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Đã xảy ra lỗi khi gửi liên kết đăng nhập",
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Cập nhật hàm signOut trong useAuth để xử lý đăng xuất tốt hơn
  // Tìm hàm signOut trong file và thay thế bằng đoạn code sau

  const signOut = async () => {
    try {
      setIsLoading(true)

      // Lưu trữ state hiện tại để khôi phục nếu cần
      const currentUser = user
      const currentProfile = profile

      // Đăng xuất khỏi Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Supabase signOut error:", error)
        throw error
      }

      // Xóa dữ liệu người dùng khỏi state ngay lập tức
      setUser(null)
      setProfile(null)
      setSession(null)
      setIsAdmin(false)
      setIsStaff(false)

      // Xóa dữ liệu liên quan đến auth khỏi localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("supabase.auth.token")
        localStorage.removeItem("pendingConfirmationEmail")
      }

      // Hiển thị thông báo thành công
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi tài khoản",
        variant: "default",
      })
    } catch (error) {
      console.error("Error signing out:", error)

      // Hiển thị thông báo lỗi
      toast({
        title: "Lỗi đăng xuất",
        description: "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.",
        variant: "destructive",
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Cập nhật hàm resetPassword để xử lý giới hạn tốc độ gửi email
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true)
      console.log("Bắt đầu đặt lại mật khẩu cho email:", email)

      // Cấu hình URL chuyển hướng
      const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`
      console.log("URL chuyển hướng đặt lại mật khẩu:", redirectTo)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      })

      if (error) {
        console.error("Lỗi đặt lại mật khẩu:", error.message)

        // Xử lý lỗi cooldown
        if (error.message.includes("security purposes") && error.message.includes("after")) {
          // Trích xuất thời gian cooldown từ thông báo lỗi
          const secondsMatch = error.message.match(/(\d+) seconds?/)
          const cooldown = secondsMatch && secondsMatch[1] ? Number.parseInt(secondsMatch[1], 10) : 1800

          return {
            success: false,
            error: `Vì lý do bảo mật, bạn chỉ có thể yêu cầu sau ${cooldown} giây nữa.`,
            cooldown: cooldown,
          }
        }

        // Xử lý lỗi giới hạn tốc độ
        if (error.message.includes("rate limit") || error.message.includes("too many requests")) {
          return {
            success: false,
            error: "Đã vượt quá giới hạn gửi email. Vui lòng thử lại sau 30 phút.",
            cooldown: 1800, // 30 phút
          }
        }

        return { success: false, error: error.message }
      }

      console.log("Đã gửi email đặt lại mật khẩu thành công")
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
      console.log("Bắt đầu cập nhật mật khẩu mới")

      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        console.error("Lỗi cập nhật mật khẩu:", error.message)
        return { success: false, error: error.message }
      }

      console.log("Cập nhật mật khẩu thành công")

      // Đăng xuất sau khi cập nhật mật khẩu thành công
      // Điều này đảm bảo người dùng đăng nhập lại với mật khẩu mới
      await supabase.auth.signOut()

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
    signInWithMagicLink,
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

