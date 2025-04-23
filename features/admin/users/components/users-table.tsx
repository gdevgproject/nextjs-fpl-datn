"use client";

import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MailCheck,
  MailX,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  UserCog2,
  Clock,
} from "lucide-react";
import {
  useUpdateUserRole,
  useUpdateUserBlockStatus,
} from "../hooks/use-users";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import type { UserExtended, UserFilter } from "../types";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuthQuery } from "@/features/auth/hooks";

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
    return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
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
  const { toast } = useSonnerToast();
  const updateUserRole = useUpdateUserRole();
  const updateUserBlockStatus = useUpdateUserBlockStatus();
  const { data: session } = useAuthQuery();
  const currentUserId = session?.user?.id;
  const currentUserRole = session?.user?.app_metadata?.role;

  // Block dialog state
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<UserExtended | null>(null);
  const [blockAction, setBlockAction] = useState<boolean>(false);
  const [banDuration, setBanDuration] = useState<
    "permanent" | "1day" | "7days" | "30days" | "custom"
  >("7days");
  const [customDuration, setCustomDuration] = useState<number>(1);

  // State để kiểm tra xem tài khoản hiện tại có phải là admin không
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

  // Kiểm tra quyền admin khi session thay đổi
  useEffect(() => {
    if (currentUserRole === "admin") {
      setIsCurrentUserAdmin(true);
    } else {
      setIsCurrentUserAdmin(false);
    }
  }, [currentUserRole]);

  // Pagination
  const totalPages = Math.ceil(totalCount / filter.perPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    onFilterChange({ page });
  };

  // Handle view user
  const handleViewUser = (id: string) => {
    router.push(`/admin/users/${id}`);
  };

  // Handle update role
  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      // Kiểm tra xem có đang cố gắng hạ quyền chính mình từ admin xuống không
      if (
        userId === currentUserId &&
        currentUserRole === "admin" &&
        role !== "admin"
      ) {
        toast.error("Không thể thay đổi quyền", {
          description:
            "Bạn không thể hạ quyền admin của chính mình. Hãy nhờ một admin khác thực hiện thao tác này.",
        });
        return;
      }

      await updateUserRole.mutateAsync({
        userId,
        role: role as any,
      });

      toast.success(`Đã cập nhật vai trò thành ${role}`);
    } catch (error) {
      toast.error("Lỗi khi cập nhật vai trò: " + String(error));
    }
  };

  // Open block dialog
  const openBlockDialog = (user: UserExtended, block: boolean) => {
    // Kiểm tra xem có đang cố gắng chặn chính mình không
    if (block && user.id === currentUserId) {
      toast.error("Không thể chặn", {
        description: "Bạn không thể chặn tài khoản của chính mình.",
      });
      return;
    }

    setUserToBlock(user);
    setBlockAction(block);
    setIsBlockDialogOpen(true);

    // Reset ban duration if opening dialog for blocking
    if (block) {
      setBanDuration("7days");
      setCustomDuration(1);
    }
  };

  // Handle block/unblock user (after confirmation)
  const handleBlockUser = async () => {
    if (!userToBlock) return;

    try {
      await updateUserBlockStatus.mutateAsync({
        userId: userToBlock.id,
        isBlocked: blockAction,
        banDuration: blockAction ? banDuration : undefined,
        customDuration:
          blockAction && banDuration === "custom" ? customDuration : undefined,
      });

      // Show success message with different text based on duration
      if (blockAction) {
        let message = "Đã chặn người dùng";

        if (banDuration) {
          switch (banDuration) {
            case "1day":
              message = "Đã chặn người dùng trong 1 ngày";
              break;
            case "7days":
              message = "Đã chặn người dùng trong 7 ngày";
              break;
            case "30days":
              message = "Đã chặn người dùng trong 30 ngày";
              break;
            case "custom":
              message = `Đã chặn người dùng trong ${customDuration} ngày`;
              break;
            case "permanent":
              message = "Đã chặn người dùng vĩnh viễn";
              break;
          }
        }
        toast.success(message);
      } else {
        toast.success("Đã bỏ chặn người dùng");
      }
    } catch (error) {
      toast.error(
        `Lỗi khi ${blockAction ? "chặn" : "bỏ chặn"} người dùng: ${String(
          error
        )}`
      );
    } finally {
      setIsBlockDialogOpen(false);
      setUserToBlock(null);
    }
  };

  // Get badge for user role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 gap-1"
          >
            <ShieldAlert className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "staff":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 gap-1"
          >
            <ShieldCheck className="h-3 w-3" />
            Staff
          </Badge>
        );
      case "shipper":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 gap-1"
          >
            <UserCog2 className="h-3 w-3" />
            Shipper
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
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
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px] 2xl:w-[300px]">
                Người dùng
              </TableHead>
              <TableHead className="hidden sm:table-cell">Vai trò</TableHead>
              <TableHead className="hidden lg:table-cell">
                Thời gian đăng ký
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Đăng nhập gần nhất
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                Email xác thực
              </TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="w-[80px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  Không tìm thấy người dùng nào phù hợp với bộ lọc
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className={`${isFetching ? "opacity-60" : ""}`}
                >
                  {/* User info column */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                        <AvatarImage
                          src={user.avatar_url || ""}
                          alt={user.display_name || ""}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // Fallback nếu ảnh không tải được
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling!.style.display = "flex";
                          }}
                        />
                        <AvatarFallback 
                          className="bg-primary/10 text-primary flex items-center justify-center h-full w-full text-base"
                          style={{ display: user.avatar_url ? "none" : "flex" }}
                        >
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
                              "HH:mm:ss dd/MM/yyyy",
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
                      <Badge
                        variant="destructive"
                        className="justify-center gap-1"
                      >
                        <Ban className="h-3 w-3" />
                        <span>Bị chặn</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 justify-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Hoạt động</span>
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions column */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
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
                          disabled={
                            user.role === "staff" ||
                            (user.id === currentUserId && isCurrentUserAdmin)
                          }
                        >
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                          <span>Đặt làm Staff</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(user.id, "shipper")}
                          className="flex items-center gap-2"
                          disabled={
                            user.role === "shipper" ||
                            (user.id === currentUserId && isCurrentUserAdmin)
                          }
                        >
                          <UserCog2 className="h-4 w-4 text-amber-600" />
                          <span>Đặt làm Shipper</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(user.id, "user")}
                          className="flex items-center gap-2"
                          disabled={
                            user.role === "user" ||
                            (user.id === currentUserId && isCurrentUserAdmin)
                          }
                        >
                          <span>Đặt làm User</span>
                        </DropdownMenuItem>

                        {user.id === currentUserId && isCurrentUserAdmin && (
                          <div className="px-2 py-1.5 text-xs text-amber-600">
                            Không thể tự hạ quyền Admin
                          </div>
                        )}

                        <DropdownMenuSeparator />

                        {user.is_blocked ? (
                          <DropdownMenuItem
                            onClick={() => openBlockDialog(user, false)}
                            className="flex items-center gap-2 text-green-600"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Bỏ chặn người dùng</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => openBlockDialog(user, true)}
                            className="flex items-center gap-2 text-red-600"
                            disabled={
                              user.role === "admin" || user.id === currentUserId
                            }
                          >
                            <Ban className="h-4 w-4" />
                            <span>
                              {user.id === currentUserId
                                ? "Không thể tự chặn"
                                : "Chặn người dùng"}
                            </span>
                          </DropdownMenuItem>
                        )}
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
              onClick={() =>
                handlePageChange(Math.min(totalPages, filter.page + 1))
              }
              disabled={filter.page === totalPages || isFetching}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Trang sau</span>
            </Button>
          </div>
        </div>
      )}

      {/* Block/Unblock User Confirmation Dialog */}
      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockAction
                ? "Xác nhận chặn người dùng"
                : "Xác nhận bỏ chặn người dùng"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockAction
                ? "Bạn có chắc chắn muốn chặn người dùng này? Họ sẽ không thể đăng nhập hoặc truy cập tài khoản cho đến khi được bỏ chặn."
                : "Bạn có chắc chắn muốn bỏ chặn người dùng này? Họ sẽ có thể đăng nhập và truy cập tài khoản trở lại."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* User identity confirmation section - only show for blocking action */}
          {blockAction && userToBlock && (
            <div className="mb-4 p-3 border rounded-md bg-muted">
              <h4 className="font-semibold mb-2 flex items-center gap-1.5">
                <UserCog className="h-4 w-4" />
                Xác nhận danh tính người dùng:
              </h4>
              <div className="space-y-1.5 text-sm">
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {userToBlock.email}
                </p>
                <p>
                  <span className="font-medium">Tên hiển thị:</span>{" "}
                  {userToBlock.display_name || userToBlock.email.split("@")[0]}
                </p>
                <p>
                  <span className="font-medium">Vai trò hiện tại:</span>{" "}
                  <Badge variant="outline" className="font-normal ml-1">
                    {userToBlock.role || "user"}
                  </Badge>
                </p>
                {userToBlock.phone_number && (
                  <p>
                    <span className="font-medium">Số điện thoại:</span>{" "}
                    {userToBlock.phone_number}
                  </p>
                )}
                <p>
                  <span className="font-medium">Ngày tạo tài khoản:</span>{" "}
                  {formatDate(userToBlock.created_at)}
                </p>
              </div>
            </div>
          )}

          {/* Role-based warnings */}
          {blockAction && userToBlock && (
            <div className="mb-4">
              {/* Warning for current user account */}
              {userToBlock.id === currentUserId && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Không thể tự chặn tài khoản</p>
                    <p className="text-sm">
                      Bạn không thể chặn tài khoản đang đăng nhập của chính
                      mình. Hành động này sẽ khiến bạn bị khóa khỏi hệ thống và
                      không thể quản trị.
                    </p>
                  </div>
                </div>
              )}

              {/* Warning for admin roles */}
              {userToBlock.role === "admin" && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Không thể chặn tài khoản Admin</p>
                    <p className="text-sm">
                      Việc chặn tài khoản Admin là cực kỳ nhạy cảm và có thể
                      khóa toàn bộ hệ thống quản trị. Nếu thực sự cần, vui lòng
                      thực hiện trực tiếp qua Supabase Dashboard với sự cẩn
                      trọng cao độ.
                    </p>
                  </div>
                </div>
              )}

              {/* Warning for staff roles */}
              {userToBlock.role === "staff" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      Cảnh báo: Chặn tài khoản Nhân viên
                    </p>
                    <p className="text-sm">
                      Bạn đang chặn một Nhân viên. Các tác vụ đang thực hiện của
                      họ có thể bị gián đoạn và có thể ảnh hưởng đến hoạt động
                      của hệ thống. Vui lòng đảm bảo rằng bạn có lý do chính
                      đáng và đã sắp xếp người thay thế.
                    </p>
                  </div>
                </div>
              )}

              {/* Warning for shipper roles */}
              {userToBlock.role === "shipper" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      Cảnh báo: Chặn tài khoản Người giao hàng
                    </p>
                    <p className="text-sm">
                      Bạn đang chặn một Người giao hàng. Các đơn hàng đang được
                      giao của họ sẽ bị ảnh hưởng. Vui lòng đảm bảo rằng bạn đã
                      phân công lại các đơn hàng đang được xử lý trước khi tiến
                      hành.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ban Duration Selection - only show for blocking action */}
          {blockAction && userToBlock && userToBlock.role !== "admin" && (
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <label
                  htmlFor="banDuration"
                  className="text-sm font-medium leading-none"
                >
                  Thời hạn chặn
                </label>
                <Select
                  value={banDuration}
                  onValueChange={(value: any) => setBanDuration(value)}
                >
                  <SelectTrigger id="banDuration" className="w-full">
                    <SelectValue placeholder="Chọn thời hạn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1day">1 ngày</SelectItem>
                    <SelectItem value="7days">7 ngày</SelectItem>
                    <SelectItem value="30days">30 ngày</SelectItem>
                    <SelectItem value="custom">Tùy chọn</SelectItem>
                    <SelectItem value="permanent">Vĩnh viễn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {banDuration === "custom" && (
                <div className="space-y-2">
                  <label
                    htmlFor="customDuration"
                    className="text-sm font-medium leading-none"
                  >
                    Số ngày chặn
                  </label>
                  <input
                    id="customDuration"
                    type="number"
                    min="1"
                    value={customDuration}
                    onChange={(e) =>
                      setCustomDuration(parseInt(e.target.value) || 1)
                    }
                    className="w-full p-2 border border-input rounded-md"
                  />
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUser}
              disabled={
                blockAction &&
                (userToBlock?.role === "admin" ||
                  userToBlock?.id === currentUserId)
              }
              className={
                blockAction &&
                (userToBlock?.role === "admin" ||
                  userToBlock?.id === currentUserId)
                  ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                  : blockAction
                  ? ""
                  : "bg-success text-success-foreground hover:bg-success/90"
              }
            >
              {updateUserBlockStatus.isPending
                ? "Đang xử lý..."
                : blockAction
                ? "Xác nhận chặn"
                : "Bỏ chặn người dùng"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
