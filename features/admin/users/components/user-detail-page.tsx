"use client";

import { useRouter } from "next/navigation";
import { useUserDetails } from "../hooks/use-users";
import { UserDetails } from "./user-details";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface UserDetailPageProps {
  userId: string;
}

export function UserDetailPage({ userId }: UserDetailPageProps) {
  const router = useRouter();
  const { data: user, isLoading, isError, error } = useUserDetails(userId);

  return (
    <div className="container px-4 py-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/admin/users">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Chi tiết người dùng
          </h1>
          <p className="text-muted-foreground">
            Xem và quản lý thông tin chi tiết người dùng
          </p>
        </div>
      </div>

      {/* Content */}
      {isError ? (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          Đã xảy ra lỗi: {error?.message || "Không thể tải dữ liệu người dùng"}
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Đang tải thông tin người dùng...
            </p>
          </div>
        </div>
      ) : user ? (
        <UserDetails user={user} />
      ) : (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-amber-800">
          Không tìm thấy thông tin người dùng
        </div>
      )}
    </div>
  );
}
