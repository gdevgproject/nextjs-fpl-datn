"use client"

import { useState } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"
import { LogOut, Loader2 } from "lucide-react"

interface LogoutButtonProps extends ButtonProps {
  showIcon?: boolean
}

export function LogoutButton({ showIcon = true, children, ...props }: LogoutButtonProps) {
  const { signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
    } catch (error) {
      console.error("Error logging out:", error)
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

