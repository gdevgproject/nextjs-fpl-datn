"use client"

import { useAuth } from "@/features/auth/context/auth-context"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logOut } from "@/features/auth/actions"
import { Icons } from "@/components/ui/icons" // Import spinner icon
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export default function UserAuthState() {
  const { user } = useAuth()
  const [isPending, startTransision] = useTransition()
  const queryClient = useQueryClient()

  async function removeUser() {
    startTransision(async () => {
      try {
        await logOut()
        queryClient.invalidateQueries({ queryKey: ["user"] })
        toast.success("Đăng xuất thành công!")
      } catch (error) {
        toast.error("Đăng xuất thất bại")
      }
    })
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger disabled={isPending}>
            <Avatar className="relative">
              {isPending && (
                <div className="absolute top-0 right-0 w-full h-full flex items-center justify-center bg-slate-400">
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                </div>
              )}
              <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt="User Avatar" />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={"/dashboard"}>Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <button onClick={removeUser} disabled={isPending}>
                {isPending ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : "Log Out"}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href={"/login"}>
          <Button disabled={isPending}>
            {isPending ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : "Verify Now"}
          </Button>
        </Link>
      )}
    </div>
  )
}
