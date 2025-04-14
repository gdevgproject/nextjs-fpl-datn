"use client"

import { memo } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/providers/auth-context"
import { CircleUser, LogIn, LogOut, Package, Heart, User, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { DEFAULT_AVATAR_URL } from "@/lib/constants"

// Using memo to prevent unnecessary re-renders
export const UserNav = memo(function UserNav() {
  const { isAuthenticated, profile, signOut, profileImageUrl, role } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Handle logout with proper state cleanup
  const handleSignOut = async () => {
    try {
      // Pre-emptively clear cache
      if (profile?.id) {
        queryClient.removeQueries({ queryKey: ["profile"] })
        queryClient.removeQueries({ queryKey: ["addresses"] })
        queryClient.removeQueries({ queryKey: ["orders"] })
        queryClient.removeQueries({ queryKey: ["cart"] })
        queryClient.removeQueries({ queryKey: ["wishlist"] })
      }

      // Call the auth context signOut function
      await signOut()

      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi tài khoản.",
      })
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Lỗi đăng xuất",
        description: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  // Show login button if not authenticated
  if (!isAuthenticated) {
    return (
      <Link href="/dang-nhap">
        <Button variant="ghost" size="icon">
          <LogIn className="h-5 w-5" />
          <span className="sr-only">Đăng nhập</span>
        </Button>
      </Link>
    )
  }

  // Display dropdown menu for authenticated users
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={profileImageUrl}
              alt={profile?.display_name || "Avatar"}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement
                target.src = DEFAULT_AVATAR_URL
              }}
            />
            <AvatarFallback>
              <CircleUser className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.display_name || "Người dùng"}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile?.phone_number || ""}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan">
              <User className="mr-2 h-4 w-4" />
              <span>Tài khoản</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/don-hang">
              <Package className="mr-2 h-4 w-4" />
              <span>Đơn hàng</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/yeu-thich">
              <Heart className="mr-2 h-4 w-4" />
              <span>Yêu thích</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* Admin Dashboard link - only visible for admin/staff users */}
        {role === "admin" || role === "staff" ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Quản trị</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

