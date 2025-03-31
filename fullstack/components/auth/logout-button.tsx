"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast" // Fixed import path

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({
  variant = "default",
  size = "default",
  className = "",
  children = "Đăng xuất",
}: LogoutButtonProps) {
  const { signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      setIsLoading(true)

      const { success, error } = await signOut()

      if (!success && error) {
        toast({
          title: "Lỗi đăng xuất",
          description: error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Lỗi đăng xuất",
        description: "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      // Even if there's an error, we should stop the loading state
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleLogout} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang đăng xuất...
        </>
      ) : (
        children
      )}
    </Button>
  )
}

