"use client";

import { useState } from "react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, UserCog } from "lucide-react";
import { useUsers } from "../hooks/use-users";
import { UserDialog } from "./user-dialog";
import { UserDetailsDialog } from "./user-details-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

interface UserTableProps {
  search?: string;
  roleFilter?: string;
}

export function UserTable({ search, roleFilter }: UserTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError } = useUsers({
    search,
    roleFilter,
    page,
    pageSize,
  });

  const [editUser, setEditUser] = useState<any>(null);
  const [viewUser, setViewUser] = useState<any>(null);
  const [deleteUser, setDeleteUser] = useState<any>(null);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      case "staff":
        return <Badge variant="default">Nhân viên</Badge>;
      case "shipper":
        return <Badge variant="outline">Người giao hàng</Badge>;
      default:
        return <Badge variant="secondary">Khách hàng</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-4 text-red-500">
        Đã xảy ra lỗi khi tải dữ liệu người dùng
      </div>
    );
  }

  const users = data?.data || [];
  const totalUsers = data?.count || 0;
  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead className="w-[250px]">Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Không tìm thấy người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{(page - 1) * pageSize + index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={user.avatar_url || ""}
                          alt={user.display_name || ""}
                        />
                        <AvatarFallback>
                          {(user.display_name || user.email || "")
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.display_name || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone_number || "Chưa cập nhật"}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewUser(user)}>
                          <UserCog className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditUser(user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteUser(user)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Trước
          </Button>
          <div className="text-sm">
            Trang {page} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Dialogs */}
      {editUser && (
        <UserDialog
          open={!!editUser}
          onOpenChange={(open) => !open && setEditUser(null)}
          user={editUser}
        />
      )}

      {viewUser && (
        <UserDetailsDialog
          open={!!viewUser}
          onOpenChange={(open) => !open && setViewUser(null)}
          user={viewUser}
        />
      )}

      {deleteUser && (
        <DeleteUserDialog
          open={!!deleteUser}
          onOpenChange={(open) => !open && setDeleteUser(null)}
          user={deleteUser}
        />
      )}
    </div>
  );
}
