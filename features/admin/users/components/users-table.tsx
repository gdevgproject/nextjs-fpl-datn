"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  MailCheck,
  MailX,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  UserCog2,
  Clock,
} from "lucide-react";
import { useUpdateUserRole, useUpdateUserBlockStatus } from "../hooks/use-users";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import type { UserExtended, UserFilter } from "../types";
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface UsersTableProps {
  users: UserExtended[];
  filter: UserFilter;
  onFilterChange: (filter: Partial<UserFilter>) => void;
  totalCount: number;
  isFetching: boolean;
}

// Format date in a user-friendly way
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "Chưa có";
  
  try {
    const date = new Date(dateStr);
    // If date is today, show relative time
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    }
    
    // If date is within last week, show day and time
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    if (date > lastWeek) {
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    }
    
    // Otherwise show full date
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  } catch (error) {
    return "Định dạng lỗi";
  }
};

export function UsersTable({
  users,
  filter,
  onFilterChange,
  totalCount,
  isFetching,
}: UsersTableProps) {
  const router = useRouter();
  const toast = useSonnerToast();
  const updateUserRole = useUpdateUserRole();
  const updateUserBlockStatus = useUpdateUserBlockStatus();
  
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Pagination
  const totalPages = Math.ceil(totalCount / filter.perPage);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    onFilterChange({ page });
  };
  
  // Handle select all
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };
  
  // Handle select one
  const handleSelectOne = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };
  
  // Handle view user
  const handleViewUser = (id: string) => {
    router.push(`/admin/users/${id}`);
  };
  
  // Handle update role
  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await updateUserRole.mutateAsync({
        userId,
        role: role as any,
      });
      
      toast.success(`Đã cập nhật vai trò thành ${role}`);
    } catch (error) {
      toast.error("Lỗi khi cập nhật vai trò: " + String(error));
    }
  };
  
  // Handle block/unblock user
  const handleBlockUser = async (userId: string, block: boolean) => {
    try {
      await updateUserBlockStatus.mutateAsync({
        userId,
        isBlocked: block,
        banDuration: block ? "7days" : undefined,
      });
      
      toast.success(block ? "Đã chặn người dùng" : "Đã bỏ chặn người dùng");
    } catch (error) {
      toast.error(
        `Lỗi khi ${block ? "chặn" : "bỏ chặn"} người dùng: ${String(error)}`
      );
    }
  };

  // Get badge for user role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
            <ShieldAlert className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "staff":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <ShieldCheck className="h-3 w-3" />
            Staff
          </Badge>
        );
      case "shipper":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
            <UserCog2 className="h-3 w-3" />
            Shipper
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            User
          </Badge>
        );
    }
  };

  // Create pagination items
  const getPaginationItems = () => {
    // Always show first page, last page, and pages around current page
    const items: (number | "ellipsis")[] = [];
    const currentPage = filter.page;
    
    if (totalPages <= 5) {
      // Show all pages if there are 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always show first page
      items.push(1);
      
      if (currentPage > 3) {
        items.push("ellipsis");
      }
      
      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        items.push("ellipsis");
      }
      
      // Always show last page
      items.push(totalPages);
    }
    
    return items;
  };
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Chọn tất cả"
                  className="translate-y-[2px]"
                />
              </TableHead>
              <TableHead className="w-[250px] 2xl:w-[300px]">Người dùng</TableHead>
              <TableHead className="hidden sm:table-cell">Vai trò</TableHead>
              <TableHead className="hidden lg:table-cell">Thời gian đăng ký</TableHead>
              <TableHead className="hidden md:table-cell">Đăng nhập gần nhất</TableHead>
              <TableHead className="hidden lg:table-cell">Email xác thực</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="w-[100px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center"
                >
                  Không tìm thấy người dùng nào phù hợp với bộ lọc
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className={`${isFetching ? "opacity-60" : ""} ${
                    selectedUsers.includes(user.id) ? "bg-muted/50" : ""
                  }`}
                >
                  {/* Checkbox column */}
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleSelectOne(user.id)}
                      aria-label={`Chọn ${user.email}`}
                      className="translate-y-[2px]"
                    />
                  </TableCell>
                  
                  {/* User info column */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={user.avatar_url || ""}
                          alt={user.display_name || ""}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {(user.display_name?.[0] || user.email[0]).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <div className="font-medium text-sm">
                          {user.display_name || user.email.split("@")[0]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                        {user.phone_number && (
                          <div className="text-xs text-muted-foreground hidden sm:block md:hidden">
                            {user.phone_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Role column */}
                  <TableCell className="hidden sm:table-cell">
                    {getRoleBadge(user.role)}
                  </TableCell>
                  
                  {/* Registration time column */}
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{formatDate(user.created_at)}</span>
                    </div>
                  </TableCell>
                  
                  {/* Last login column */}
                  <TableCell className="hidden md:table-cell">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm">
                          {user.last_sign_in_at
                            ? formatDate(user.last_sign_in_at)
                            : "Chưa đăng nhập"}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        {user.last_sign_in_at
                          ? `Đăng nhập lúc ${format(
                              new Date(user.last_sign_in_at),
                              'HH:mm:ss dd/MM/yyyy',
                              { locale: vi }
                            )}`
                          : "Chưa từng đăng nhập vào hệ thống"}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  
                  {/* Email verification column */}
                  <TableCell className="hidden lg:table-cell">
                    {user.email_confirmed_at ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <MailCheck className="h-4 w-4" />
                        <span>Đã xác thực</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600">
                        <MailX className="h-4 w-4" />
                        <span>Chưa xác thực</span>
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Status column */}
                  <TableCell className="text-center">
                    {user.is_blocked ? (
                      <Badge variant="destructive" className="justify-center gap-1">
                        <Ban className="h-3 w-3" />
                        <span>Bị chặn</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 justify-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Hoạt động</span>
                      </Badge>
                    )}
                  </TableCell>
                  
                  {/* Actions column */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleViewUser(user.id)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Xem chi tiết</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuLabel>Phân quyền</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(user.id, "admin")}
                          className="flex items-center gap-2"
                          disabled={user.role === "admin"}
                        >
                          <ShieldAlert className="h-4 w-4 text-red-600" />
                          <span>Đặt làm Admin</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(user.id, "staff")}
                          className="flex items-center gap-2"
                          disabled={user.role === "staff"}
                        >
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                          <span>Đặt làm Staff</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(user.id, "shipper")}
                          className="flex items-center gap-2"
                          disabled={user.role === "shipper"}
                        >
                          <UserCog2 className="h-4 w-4 text-amber-600" />
                          <span>Đặt làm Shipper</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(user.id, "user")}
                          className="flex items-center gap-2"
                          disabled={user.role === "user"}
                        >
                          <span>Đặt làm User</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {user.is_blocked ? (
                          <DropdownMenuItem
                            onClick={() => handleBlockUser(user.id, false)}
                            className="flex items-center gap-2 text-green-600"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Bỏ chặn người dùng</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleBlockUser(user.id, true)}
                            className="flex items-center gap-2 text-red-600"
                          >
                            <Ban className="h-4 w-4" />
                            <span>Chặn người dùng</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          <span>Sửa thông tin</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Hiển thị {users.length} / {totalCount} người dùng
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, filter.page - 1))}
              disabled={filter.page === 1 || isFetching}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Trang trước</span>
            </Button>
            
            {getPaginationItems().map((item, index) => {
              if (item === "ellipsis") {
                return (
                  <div key={`ellipsis-${index}`} className="px-2">
                    ...
                  </div>
                );
              }
              
              return (
                <Button
                  key={item}
                  variant={filter.page === item ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(item)}
                  disabled={isFetching}
                  className="h-8 w-8 p-0"
                >
                  {item}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, filter.page + 1))}
              disabled={filter.page === totalPages || isFetching}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Trang sau</span>
            </Button>
          </div>
        </div>
      )}
      
      {/* Bulk actions when users are selected */}
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border shadow-lg rounded-lg p-3 flex items-center gap-3 z-10">
          <span className="text-sm font-medium">
            Đã chọn {selectedUsers.length} người dùng
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedUsers([])}>
              Bỏ chọn
            </Button>
            <Button size="sm" variant="default">
              Gửi email
            </Button>
            <Button size="sm" variant="destructive">
              <Ban className="h-4 w-4 mr-1" />
              Chặn người dùng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
