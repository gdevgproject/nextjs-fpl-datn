"use client"

import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogoutButton } from "@/components/auth/logout-button"
import { User, Package, Heart, Star, Settings, ShoppingCart, LogIn } from "lucide-react"

export function AuthStatus() {
  const { user, profile, isAdmin, isStaff } = useAuth()

  if (!user) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/dang-nhap">
          <LogIn className="h-4 w-4 mr-2" />
          Đăng nhập
        </Link>
      </Button>
    )
  }

  const initials = profile?.display_name
    ? profile.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : user.email?.substring(0, 2).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.display_name || ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.display_name || "Người dùng"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/thong-tin">
              <User className="mr-2 h-4 w-4" />
              <span>Thông tin tài khoản</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/don-hang">
              <Package className="mr-2 h-4 w-4" />
              <span>Đơn hàng của tôi</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/yeu-thich">
              <Heart className="mr-2 h-4 w-4" />
              <span>Danh sách yêu thích</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tai-khoan/danh-gia">
              <Star className="mr-2 h-4 w-4" />
              <span>Đánh giá của tôi</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/gio-hang">
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>Giỏ hàng</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {(isAdmin || isStaff) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Quản trị</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <LogoutButton className="w-full justify-start" />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

