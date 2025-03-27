"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogoutButton } from "@/components/auth/logout-button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogIn, UserPlus, Settings, ShoppingBag, Heart, Star, MapPin, ChevronDown } from "lucide-react"

export function AuthStatus() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Tránh hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dang-nhap">
            <LogIn className="h-4 w-4 mr-2" />
            Đăng nhập
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/dang-ky">
            <UserPlus className="h-4 w-4 mr-2" />
            Đăng ký
          </Link>
        </Button>
      </div>
    )
  }

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : user.email?.substring(0, 2).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl || ""} alt={user.displayName || user.email || "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium line-clamp-1">
              {user.displayName || user.email?.split("@")[0] || "Người dùng"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || "Người dùng"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/tai-khoan/thong-tin")}>
            <User className="mr-2 h-4 w-4" />
            <span>Thông tin tài khoản</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/tai-khoan/don-hang")}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Đơn hàng của tôi</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/tai-khoan/dia-chi")}>
            <MapPin className="mr-2 h-4 w-4" />
            <span>Địa chỉ</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/tai-khoan/yeu-thich")}>
            <Heart className="mr-2 h-4 w-4" />
            <span>Danh sách yêu thích</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/tai-khoan/danh-gia")}>
            <Star className="mr-2 h-4 w-4" />
            <span>Đánh giá của tôi</span>
          </DropdownMenuItem>
          {user.isAdmin && (
            <DropdownMenuItem onClick={() => router.push("/admin")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Quản trị viên</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <LogoutButton
          variant="ghost"
          size="sm"
          className="w-full justify-start px-2 font-normal"
          showConfirmDialog={true}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

