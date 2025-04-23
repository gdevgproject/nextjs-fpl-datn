"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useUpdateUserRole,
  useUpdateUserBlockStatus,
} from "../hooks/use-users";
import { formatPhoneNumber } from "@/lib/utils/format";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { UserExtended, UserFilter } from "../types";

interface UsersTableProps {
  users: UserExtended[];
  filter: UserFilter;
  onFilterChange: (filter: Partial<UserFilter>) => void;
  totalCount: number;
  isFetching?: boolean;
}

export function UsersTable({
  users,
  filter,
  onFilterChange,
  totalCount,
  isFetching = false,
}: UsersTableProps) {
  const [userToUpdate, setUserToUpdate] = useState<{
    userId: string;
    action: "block" | "unblock" | null;
  }>({ userId: "", action: null });
  const [banDuration, setBanDuration] = useState<
    "permanent" | "1day" | "7days" | "30days" | "custom"
  >("permanent");
  const [customDuration, setCustomDuration] = useState<number>(1);

  const updateUserRole = useUpdateUserRole();
  const updateUserBlockStatus = useUpdateUserBlockStatus();

  // Pagination handlers
  const totalPages = Math.ceil(totalCount / filter.perPage);

  const handleNextPage = () => {
    if (filter.page < totalPages) {
      onFilterChange({ page: filter.page + 1 });
    }
  };

  const handlePrevPage = () => {
    if (filter.page > 1) {
      onFilterChange({ page: filter.page - 1 });
    }
  };

  const handlePerPageChange = (value: string) => {
    onFilterChange({ perPage: Number(value), page: 1 });
  };

  // Role update handler
  const handleRoleChange = (userId: string, role: string) => {
    updateUserRole.mutate({
      userId,
      role: role as "user" | "admin" | "staff" | "shipper",
    });
  };

  // Block/Unblock handlers
  const handleBlockUser = () => {
    if (userToUpdate.userId && userToUpdate.action === "block") {
      updateUserBlockStatus.mutate({
        userId: userToUpdate.userId,
        isBlocked: true,
        banDuration: banDuration,
        customDuration: banDuration === "custom" ? customDuration : undefined,
      });
    }
    setUserToUpdate({ userId: "", action: null });
    // Reset the ban duration after blocking
    setBanDuration("permanent");
    setCustomDuration(1);
  };

  const handleUnblockUser = () => {
    if (userToUpdate.userId && userToUpdate.action === "unblock") {
      updateUserBlockStatus.mutate({
        userId: userToUpdate.userId,
        isBlocked: false,
      });
    }
    setUserToUpdate({ userId: "", action: null });
  };

  const openBlockDialog = (userId: string) => {
    setUserToUpdate({ userId, action: "block" });
  };

  const openUnblockDialog = (userId: string) => {
    setUserToUpdate({ userId, action: "unblock" });
  };

  const closeDialog = () => {
    setUserToUpdate({ userId: "", action: null });
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "staff":
        return "purple";
      case "shipper":
        return "blue";
      default:
        return "secondary";
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (isBlocked: boolean) => {
    return isBlocked ? "destructive" : "success";
  };

  // UI feedback for loading state
  const isLoading = users.length === 0 && isFetching;

  // Function to get user initials for avatar
  const getUserInitials = (user: UserExtended): string => {
    if (user.display_name) {
      return user.display_name.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="overflow-auto" style={{ maxHeight: "600px" }}>
          <table className="min-w-full divide-y divide-border">
            <thead className="sticky top-0 bg-background z-10">
              <tr className="bg-muted/50">
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                  Phone
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                  Created
                </th>
                <th className="px-4 py-3.5 text-right text-sm font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {isLoading ? (
                // Loading skeletons
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={`skeleton-${index}`} className="hover:bg-muted/50">
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </td>
                    </tr>
                  ))
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-8 w-8 border border-border">
                          {user.avatar_url ? (
                            <AvatarImage
                              src={user.avatar_url}
                              alt={user.display_name || ""}
                              className="object-cover"
                            />
                          ) : (
                            <AvatarFallback>
                              {getUserInitials(user)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="font-medium">
                          {user.display_name || user.email?.split("@")[0]}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {user.phone_number
                        ? formatPhoneNumber(user.phone_number)
                        : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <Badge variant={getStatusBadgeVariant(user.is_blocked)}>
                        {user.is_blocked ? "Blocked" : "Active"}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      {format(new Date(user.created_at), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="h-8 w-8"
                            >
                              <Link href={`/admin/users/${user.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Xem chi tiết</span>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Xem chi tiết</TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <span className="sr-only">Mở menu</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer"
                            >
                              <Link href={`/admin/users/${user.id}`}>
                                Xem chi tiết
                              </Link>
                            </DropdownMenuItem>
                            {user.is_blocked ? (
                              <DropdownMenuItem
                                className="cursor-pointer text-success"
                                onClick={() => openUnblockDialog(user.id)}
                              >
                                Bỏ chặn người dùng
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer text-destructive"
                                onClick={() => openBlockDialog(user.id)}
                              >
                                Chặn người dùng
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem className="cursor-pointer">
                              <Select
                                value={user.role}
                                onValueChange={(value) =>
                                  handleRoleChange(user.id, value)
                                }
                              >
                                <SelectTrigger className="h-8 border-0 bg-transparent p-0 shadow-none focus:ring-0 focus-visible:ring-0 z-20">
                                  <SelectValue
                                    placeholder={`Đổi vai trò (${user.role})`}
                                    className="text-xs"
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="staff">Staff</SelectItem>
                                  <SelectItem value="shipper">
                                    Shipper
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị{" "}
          <span className="font-medium">
            {isFetching ? "..." : users.length}
          </span>{" "}
          trong tổng số{" "}
          <span className="font-medium">{isFetching ? "..." : totalCount}</span>{" "}
          người dùng
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Hiển thị</p>
            <Select
              value={filter.perPage.toString()}
              onValueChange={handlePerPageChange}
              disabled={isFetching}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={filter.perPage.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Trang {filter.page} / {Math.max(1, totalPages)}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={filter.page === 1 || isFetching}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Trang trước</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={filter.page >= totalPages || isFetching}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Trang sau</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Block User Dialog */}
      <AlertDialog
        open={userToUpdate.action === "block"}
        onOpenChange={closeDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận chặn người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn chặn người dùng này? Họ sẽ không thể đăng
              nhập hoặc truy cập tài khoản cho đến khi được bỏ chặn.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* User identity confirmation */}
          {userToUpdate.userId && (
            <div className="mb-4 p-3 border rounded-md bg-muted">
              <h4 className="font-semibold mb-2">Thông tin người dùng:</h4>
              {users
                .filter((user) => user.id === userToUpdate.userId)
                .map((user) => (
                  <div key={user.id} className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Email:</span> {user.email}
                    </p>
                    <p>
                      <span className="font-medium">Tên hiển thị:</span>{" "}
                      {user.display_name || user.email.split("@")[0]}
                    </p>
                    <p>
                      <span className="font-medium">Vai trò:</span> {user.role}
                    </p>

                    {/* Warning for important roles */}
                    {(user.role === "staff" || user.role === "shipper") && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
                        <p className="flex items-center gap-1 font-medium">
                          <AlertTriangle className="h-4 w-4" /> Cảnh báo:
                        </p>
                        <p>
                          Bạn đang chặn một{" "}
                          {user.role === "staff"
                            ? "Nhân viên"
                            : "Người giao hàng"}
                          . Các tác vụ đang thực hiện của họ có thể bị gián
                          đoạn.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Thời gian chặn</p>
            <Select
              value={banDuration}
              onValueChange={(value) =>
                setBanDuration(
                  value as "permanent" | "1day" | "7days" | "30days" | "custom"
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn thời gian chặn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permanent">Vĩnh viễn</SelectItem>
                <SelectItem value="1day">1 ngày</SelectItem>
                <SelectItem value="7days">7 ngày</SelectItem>
                <SelectItem value="30days">30 ngày</SelectItem>
                <SelectItem value="custom">Tùy chỉnh</SelectItem>
              </SelectContent>
            </Select>
            {banDuration === "custom" && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Số ngày</p>
                <input
                  type="number"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(Number(e.target.value))}
                  className="w-full border rounded-md p-2"
                  min={1}
                />
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updateUserBlockStatus.isPending
                ? "Đang xử lý..."
                : "Chặn người dùng"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unblock User Dialog */}
      <AlertDialog
        open={userToUpdate.action === "unblock"}
        onOpenChange={closeDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận bỏ chặn người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn bỏ chặn người dùng này? Họ sẽ có thể đăng
              nhập và truy cập tài khoản trở lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnblockUser}
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              {updateUserBlockStatus.isPending
                ? "Đang xử lý..."
                : "Bỏ chặn người dùng"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
