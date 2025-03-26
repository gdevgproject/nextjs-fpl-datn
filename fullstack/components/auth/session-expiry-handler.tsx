"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function SessionExpiryHandler() {
  const [showDialog, setShowDialog] = useState(false)
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  // Cập nhật hàm checkSession để xử lý tốt hơn khi tài khoản bị xóa
  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Session error:", error)
        // Có thể tài khoản đã bị xóa hoặc session không hợp lệ
        await handleSessionError()
        return
      }

      if (data.session) {
        try {
          // Kiểm tra xem profile có tồn tại không
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", data.session.user.id)
            .single()

          if (profileError && (profileError.code === "PGRST116" || profileError.message.includes("no rows returned"))) {
            await handleAccountDeleted()
            return
          }

          const expiresAt = new Date(data.session.expires_at * 1000)
          setSessionExpiresAt(expiresAt)
        } catch (error) {
          console.error("Error checking profile:", error)
          await handleSessionError()
        }
      }
    } catch (error) {
      console.error("Error checking session:", error)
      await handleSessionError()
    }
  }

  // Thêm hàm xử lý khi tài khoản bị xóa
  const handleAccountDeleted = async () => {
    try {
      // Đăng xuất người dùng
      await supabase.auth.signOut()

      // Hiển thị thông báo
      toast({
        title: "Tài khoản không tồn tại",
        description:
          "Tài khoản của bạn không còn tồn tại hoặc đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ nếu bạn cần trợ giúp.",
        variant: "destructive",
      })

      // Chuyển hướng đến trang đăng nhập
      router.push("/dang-nhap?error=account_deleted")
      router.refresh()
    } catch (error) {
      console.error("Error handling deleted account:", error)
    }
  }

  // Thêm hàm xử lý lỗi session
  const handleSessionError = async () => {
    try {
      // Đăng xuất người dùng
      await supabase.auth.signOut()

      // Hiển thị thông báo
      toast({
        title: "Phiên đăng nhập đã hết hạn",
        description: "Vui lòng đăng nhập lại để tiếp tục",
        variant: "destructive",
      })

      // Chuyển hướng đến trang đăng nhập
      router.push("/dang-nhap?error=session_invalid")
      router.refresh()
    } catch (error) {
      console.error("Error handling session error:", error)
    }
  }

  // Cập nhật thời gian kiểm tra phiên để phản ánh cấu hình phiên người dùng
  useEffect(() => {
    const interval = setInterval(checkSession, 300000) // 5 phút

    checkSession()

    return () => clearInterval(interval)
  }, [supabase.auth, router, toast])

  useEffect(() => {
    if (!sessionExpiresAt) return

    const updateTimeRemaining = () => {
      const now = new Date()
      const remaining = sessionExpiresAt.getTime() - now.getTime()
      setTimeRemaining(remaining)

      // Hiển thị cảnh báo khi còn ít hơn 10 phút
      if (remaining > 0 && remaining < 10 * 60 * 1000) {
        setShowDialog(true)
      }

      // Phiên hết hạn
      if (remaining <= 0) {
        toast({
          title: "Phiên đăng nhập đã hết hạn",
          description: "Vui lòng đăng nhập lại để tiếp tục",
          variant: "destructive",
        })

        router.push("/dang-nhap")
        router.refresh()
      }
    }

    updateTimeRemaining()
    // Cập nhật mỗi phút thay vì mỗi 30 giây
    const interval = setInterval(updateTimeRemaining, 60000) // 1 phút

    return () => clearInterval(interval)
  }, [sessionExpiresAt, router, toast])

  const handleExtendSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        throw error
      }

      if (data.session) {
        const expiresAt = new Date(data.session.expires_at * 1000)
        setSessionExpiresAt(expiresAt)
        setShowDialog(false)

        toast({
          title: "Phiên đăng nhập đã được gia hạn",
          description: "Bạn có thể tiếp tục sử dụng",
        })
      }
    } catch (error) {
      console.error("Error extending session:", error)
      toast({
        title: "Không thể gia hạn phiên đăng nhập",
        description: "Vui lòng đăng nhập lại để tiếp tục",
        variant: "destructive",
      })

      router.push("/dang-nhap")
    }
  }

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes} phút ${seconds} giây`
  }

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Phiên đăng nhập sắp hết hạn</AlertDialogTitle>
          <AlertDialogDescription>
            Phiên đăng nhập của bạn sẽ hết hạn sau {timeRemaining ? formatTimeRemaining(timeRemaining) : "vài phút"}.
            Bạn có muốn tiếp tục phiên đăng nhập không?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Đăng xuất</AlertDialogCancel>
          <AlertDialogAction onClick={handleExtendSession}>Tiếp tục phiên đăng nhập</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

