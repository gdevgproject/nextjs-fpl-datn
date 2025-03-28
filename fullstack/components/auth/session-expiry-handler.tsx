"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
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
import { Loader2 } from "lucide-react"

export function SessionExpiryHandler() {
  const { user, refreshSession, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Giả lập thời gian hết hạn session
  useEffect(() => {
    if (!user) return

    // Giả lập session sẽ hết hạn sau 30 phút
    const expiryTime = 30 * 60 * 1000
    const warningTime = 5 * 60 * 1000 // Hiển thị cảnh báo trước 5 phút

    const checkSessionExpiry = () => {
      const timeRemaining = expiryTime - (Date.now() % expiryTime)

      if (timeRemaining <= warningTime) {
        setTimeLeft(Math.floor(timeRemaining / 1000))
        setShowDialog(true)
      }
    }

    // Kiểm tra mỗi phút
    const interval = setInterval(checkSessionExpiry, 60 * 1000)

    // Kiểm tra ngay khi component mount
    checkSessionExpiry()

    return () => clearInterval(interval)
  }, [user])

  // Đếm ngược thời gian còn lại
  useEffect(() => {
    if (timeLeft <= 0 || !showDialog) return

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1)

      // Tự động đăng xuất khi hết thời gian
      if (timeLeft <= 1) {
        handleSignOut()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, showDialog])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleRefreshSession = async () => {
    try {
      setIsRefreshing(true)

      // Giả lập làm mới session (không thực sự gọi API)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setShowDialog(false)

      toast({
        title: "Phiên làm việc đã được gia hạn",
        description: "Bạn có thể tiếp tục sử dụng ứng dụng.",
      })
    } catch (error) {
      console.error("Error refreshing session:", error)
      toast({
        title: "Không thể gia hạn phiên làm việc",
        description: "Vui lòng đăng nhập lại.",
        variant: "destructive",
      })
      handleSignOut()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)

      // Giả lập đăng xuất (không thực sự gọi API)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setShowDialog(false)

      toast({
        title: "Phiên làm việc đã hết hạn",
        description: "Vui lòng đăng nhập lại để tiếp tục.",
      })

      router.push("/dang-nhap?error=session_invalid")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Phiên làm việc sắp hết hạn</AlertDialogTitle>
          <AlertDialogDescription>
            Phiên làm việc của bạn sẽ hết hạn sau{" "}
            <span className="font-semibold text-primary">{formatTime(timeLeft)}</span>. Bạn có muốn tiếp tục phiên làm
            việc không?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleSignOut} disabled={isRefreshing || isSigningOut}>
            {isSigningOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng xuất
              </>
            ) : (
              "Đăng xuất"
            )}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRefreshSession}
            disabled={isRefreshing || isSigningOut}
            className="bg-primary hover:bg-primary/90"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gia hạn
              </>
            ) : (
              "Tiếp tục phiên làm việc"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

