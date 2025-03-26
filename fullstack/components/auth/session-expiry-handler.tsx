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

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        const expiresAt = new Date(data.session.expires_at * 1000)
        setSessionExpiresAt(expiresAt)
      }
    }

    checkSession()

    const interval = setInterval(checkSession, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [supabase.auth])

  useEffect(() => {
    if (!sessionExpiresAt) return

    const updateTimeRemaining = () => {
      const now = new Date()
      const remaining = sessionExpiresAt.getTime() - now.getTime()
      setTimeRemaining(remaining)

      // Show warning dialog when less than 5 minutes remaining
      if (remaining > 0 && remaining < 5 * 60 * 1000) {
        setShowDialog(true)
      }

      // Session expired
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
    const interval = setInterval(updateTimeRemaining, 30000) // Update every 30 seconds

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

