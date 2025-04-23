"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  UserCog,
  Eye,
  Shield,
  ShieldCheck,
  UserX,
  Ban,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  useUpdateUserRole,
  useUpdateUserBlockStatus,
} from "../hooks/use-users";
import type { UserExtended, UserFilter } from "../types";
import { formatPhoneNumber } from "@/lib/utils/format";

interface UsersTableProps {
  users: UserExtended[];
  filter: UserFilter;
  onFilterChange: (filter: Partial<UserFilter>) => void;
  totalCount: number;
}

export function UsersTable({
  users,
  filter,
  onFilterChange,
  totalCount,
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

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
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
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
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
                        <Avatar className="h-8 w-8">
                          {user.avatar_url ? (
                            <AvatarImage
                              src={user.avatar_url}
                              alt={user.display_name || ""}
                              className="object-cover"
                            />
                          ) : (
                            <AvatarFallback>
                              {user.display_name?.substring(0, 2) ||
                                user.email.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="font-medium">
                          {user.display_name || user.email.split("@")[0]}
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
                            <Button asChild size="icon" variant="ghost">
                              <Link href={`/admin/users/${user.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <UserCog className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {/* Role dropdown */}
                            <div className="p-2">
                              <Select
                                value={user.role}
                                onValueChange={(value) =>
                                  handleRoleChange(user.id, value)
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Change Role" />
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
                            </div>

                            {/* Block/Unblock action */}
                            {user.is_blocked ? (
                              <DropdownMenuItem
                                className="text-success-foreground"
                                onClick={() => openUnblockDialog(user.id)}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Unblock User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => openBlockDialog(user.id)}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Block User
                              </DropdownMenuItem>
                            )}
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
          Hiển thị <strong>{users.length}</strong> trong tổng số{" "}
          <strong>{totalCount}</strong> người dùng
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Hiển thị</p>
            <Select
              value={filter.perPage.toString()}
              onValueChange={handlePerPageChange}
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
              disabled={filter.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Trang trước</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={filter.page >= totalPages}
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
