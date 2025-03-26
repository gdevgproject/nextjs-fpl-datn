"use client"

import { useState } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"
import { LogOut, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface LogoutButtonProps extends ButtonProps {
  showIcon?: boolean
}

export function LogoutButton({ showIcon = true, children, ...props }: LogoutButtonProps) {
  const { signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      // Thêm timeout để đảm bảo không bị treo quá lâu nếu có lỗi
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Đăng xuất bị timeout")), 5000),
      )

      // Chạy cả hai promise và lấy kết quả của cái hoàn thành trước
      await Promise.race([signOut(), timeoutPromise])

      // Chuyển hướng về trang chủ sau khi đăng xuất
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)

      // Hiển thị thông báo lỗi
      toast({
        title: "Lỗi đăng xuất",
        description: "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại hoặc làm mới trang.",
        variant: "destructive",
      })

      // Nếu bị timeout, tự động làm mới trang
      if (error instanceof Error && error.message === "Đăng xuất bị timeout") {
        window.location.reload()
      }
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button variant="ghost" onClick={handleLogout} disabled={isLoggingOut} {...props}>
      {isLoggingOut ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : showIcon ? (
        <LogOut className="h-4 w-4 mr-2" />
      ) : null}
      {children || "Đăng xuất"}
    </Button>
  )
}

