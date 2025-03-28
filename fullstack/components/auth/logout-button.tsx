"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { LogOut, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showIcon?: boolean
  showConfirmDialog?: boolean
}

export function LogoutButton({
  variant = "default",
  size = "default",
  className = "",
  showIcon = true,
  showConfirmDialog = true,
}: LogoutButtonProps) {
  const { signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      // Giả lập đăng xuất (không thực sự gọi API)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi tài khoản",
      })

      router.push("/dang-nhap")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Đăng xuất thất bại",
        description: "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const logoutButton = (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={showConfirmDialog ? undefined : handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className={`h-4 w-4 animate-spin ${showIcon ? "mr-2" : ""}`} />
          Đang xử lý
        </>
      ) : (
        <>
          {showIcon && <LogOut className="h-4 w-4 mr-2" />}
          Đăng xuất
        </>
      )}
    </Button>
  )

  if (!showConfirmDialog) {
    return logoutButton
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{logoutButton}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
          <AlertDialogDescription>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut} className="bg-primary hover:bg-primary/90">
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý
              </>
            ) : (
              "Đăng xuất"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

