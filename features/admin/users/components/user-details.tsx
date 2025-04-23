"use client";

import { useState, memo, Suspense, lazy, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  UserCog,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  Ban,
  Check,
  MapPin,
  ShoppingBag,
  Star,
  Heart,
  RefreshCcw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useSendPasswordReset,
} from "../hooks/use-users";
import { formatPhoneNumber } from "@/lib/utils/format";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthQuery } from "@/features/auth/hooks";

// Lazy load tab contents for better performance
const UserAddressesTab = lazy(() => import("./user-tabs/user-addresses-tab"));
const UserOrdersTab = lazy(() => import("./user-tabs/user-orders-tab"));
const UserReviewsTab = lazy(() => import("./user-tabs/user-reviews-tab"));
const UserWishlistsTab = lazy(() => import("./user-tabs/user-wishlists-tab"));

// Render loading fallback for suspense
const TabLoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

interface UserDetailsProps {
  user: any; // Detailed user object with all related data
  isFetching?: boolean;
}

function UserDetailsComponent({ user, isFetching = false }: UserDetailsProps) {
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [banDuration, setBanDuration] = useState<
    "permanent" | "1day" | "7days" | "30days" | "custom"
  >("permanent");
  const [customDuration, setCustomDuration] = useState<number>(1);
  const [activeTab, setActiveTab] = useState("addresses");
  const [isSelfAccount, setIsSelfAccount] = useState(false);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

  const { data: session } = useAuthQuery();
  const currentUserId = session?.user?.id;
  const currentUserRole = session?.user?.app_metadata?.role;

  // Kiểm tra xem đây có phải là tài khoản đang đăng nhập hay không và có phải admin không
  useEffect(() => {
    if (currentUserId && user?.id) {
      setIsSelfAccount(currentUserId === user.id);
    }

    if (currentUserRole === "admin") {
      setIsCurrentUserAdmin(true);
    }
  }, [currentUserId, user?.id, currentUserRole]);

  const updateUserRole = useUpdateUserRole();
  const updateUserBlockStatus = useUpdateUserBlockStatus();
  const sendPasswordReset = useSendPasswordReset();
  const { toast } = useSonnerToast();

  // Role update handler
  const handleRoleChange = (role: string) => {
    // Ngăn chặn admin hạ quyền chính mình
    if (isSelfAccount && isCurrentUserAdmin && role !== "admin") {
      toast.error("Không thể thay đổi quyền", {
        description:
          "Bạn không thể hạ quyền admin của chính mình. Hãy nhờ một admin khác thực hiện thao tác này.",
      });
      return;
    }

    updateUserRole.mutate({
      userId: user.id,
      role: role as "user" | "admin" | "staff" | "shipper",
    });
  };

  // Block/Unblock handlers
  const handleBlockUser = () => {
    // Kiểm tra nếu đang tự chặn tài khoản của chính mình
    if (isSelfAccount) {
      toast.error("Không thể chặn", {
        description: "Bạn không thể chặn tài khoản của chính mình.",
      });
      setIsBlockDialogOpen(false);
      return;
    }

    updateUserBlockStatus.mutate({
      userId: user.id,
      isBlocked: true,
      banDuration: banDuration,
      customDuration: banDuration === "custom" ? customDuration : undefined,
    });
    setIsBlockDialogOpen(false);
    // Reset the ban duration after blocking
    setBanDuration("permanent");
    setCustomDuration(1);
  };

  const handleUnblockUser = () => {
    updateUserBlockStatus.mutate({
      userId: user.id,
      isBlocked: false,
    });
    setIsUnblockDialogOpen(false);
  };

  // Send password reset handler
  const handleSendPasswordReset = () => {
    sendPasswordReset.mutate(user.email);
    setIsResetPasswordDialogOpen(false);
  };

  // Format date helper
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  // Get user status label
  const getUserStatus = () => {
    if (user.is_blocked) return "Bị chặn";
    if (!user.email_confirmed_at) return "Chưa xác thực email";
    return "Hoạt động";
  };

  // Get user status variant for badge
  const getUserStatusVariant = () => {
    if (user.is_blocked) return "destructive";
    if (!user.email_confirmed_at) return "warning";
    return "success";
  };

  // Handle tab change with dynamic loading
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-6">
      {/* Basic User Info Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Thông tin người dùng</CardTitle>
          <CardDescription>
            Thông tin cơ bản và trạng thái tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start gap-3 md:w-1/3">
              <Avatar className="h-24 w-24">
                {isFetching ? (
                  <Skeleton className="h-full w-full rounded-full" />
                ) : user.avatar_url ? (
                  <AvatarImage
                    src={user.avatar_url}
                    alt={user.display_name || ""}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-xl">
                    {user.display_name?.substring(0, 2) ||
                      user.email.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              <h3 className="text-xl font-semibold">
                {isFetching ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  user.display_name || user.email.split("@")[0]
                )}
              </h3>

              {isFetching ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <Badge variant={getUserStatusVariant()}>
                  {getUserStatus()}
                </Badge>
              )}
            </div>

            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {isFetching ? <Skeleton className="h-4 w-32" /> : user.email}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {isFetching ? (
                    <Skeleton className="h-4 w-24" />
                  ) : user.phone_number ? (
                    formatPhoneNumber(user.phone_number)
                  ) : (
                    "Chưa cung cấp"
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Ngày tạo tài khoản
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {isFetching ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    formatDate(user.created_at)
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Đăng nhập gần nhất
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {isFetching ? (
                    <Skeleton className="h-4 w-32" />
                  ) : user.last_sign_in_at ? (
                    formatDate(user.last_sign_in_at)
                  ) : (
                    "Chưa đăng nhập"
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vai trò</p>
                <div className="mt-1">
                  {isFetching ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={user.role || "user"}
                      onValueChange={handleRoleChange}
                      disabled={
                        updateUserRole.isPending ||
                        (isSelfAccount && isCurrentUserAdmin)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="shipper">Shipper</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {isSelfAccount && isCurrentUserAdmin && (
                    <p className="text-xs text-amber-600 mt-1.5">
                      Không thể tự hạ quyền Admin. Hãy nhờ Admin khác thực hiện
                      thay đổi này.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Giới tính</p>
                <p className="flex items-center gap-2">
                  {isFetching ? (
                    <Skeleton className="h-4 w-16" />
                  ) : (
                    user.gender || "Chưa cung cấp"
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            {isFetching ? (
              <>
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-56" />
              </>
            ) : user.is_blocked ? (
              <Button
                variant="success"
                onClick={() => setIsUnblockDialogOpen(true)}
                disabled={updateUserBlockStatus.isPending}
              >
                <Check className="mr-2 h-4 w-4" />
                Bỏ chặn người dùng
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setIsBlockDialogOpen(true)}
                disabled={updateUserBlockStatus.isPending || isSelfAccount}
              >
                <Ban className="mr-2 h-4 w-4" />
                {isSelfAccount ? "Không thể tự chặn" : "Chặn người dùng"}
              </Button>
            )}

            {!isFetching && (
              <Button
                variant="outline"
                onClick={() => setIsResetPasswordDialogOpen(true)}
                disabled={sendPasswordReset.isPending}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Gửi email đặt lại mật khẩu
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Tabs for Addresses, Orders, Reviews, Wishlists */}
      <Tabs
        defaultValue="addresses"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="addresses">
            <MapPin className="mr-2 h-4 w-4" />
            Địa chỉ
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Đơn hàng
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="mr-2 h-4 w-4" />
            Đánh giá
          </TabsTrigger>
          <TabsTrigger value="wishlists">
            <Heart className="mr-2 h-4 w-4" />
            Yêu thích
          </TabsTrigger>
        </TabsList>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Suspense fallback={<TabLoadingFallback />}>
            <UserAddressesTab
              addresses={user.addresses || []}
              isLoading={isFetching}
            />
          </Suspense>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Suspense fallback={<TabLoadingFallback />}>
            <UserOrdersTab orders={user.orders || []} isLoading={isFetching} />
          </Suspense>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Suspense fallback={<TabLoadingFallback />}>
            <UserReviewsTab
              reviews={user.reviews || []}
              isLoading={isFetching}
            />
          </Suspense>
        </TabsContent>

        {/* Wishlists Tab */}
        <TabsContent value="wishlists">
          <Suspense fallback={<TabLoadingFallback />}>
            <UserWishlistsTab
              wishlists={user.wishlists || []}
              isLoading={isFetching}
            />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Block User Dialog */}
      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận chặn người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn chặn người dùng này? Họ sẽ không thể đăng
              nhập hoặc truy cập tài khoản cho đến khi được bỏ chặn.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* User identity confirmation - Enhanced with more details */}
          <div className="mb-4 p-3 border rounded-md bg-muted">
            <h4 className="font-semibold mb-2 flex items-center gap-1.5">
              <UserCog className="h-4 w-4" />
              Xác nhận danh tính người dùng:
            </h4>
            <div className="space-y-1.5 text-sm">
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">Tên hiển thị:</span>{" "}
                {user.display_name || user.email.split("@")[0]}
              </p>
              <p>
                <span className="font-medium">Vai trò hiện tại:</span>{" "}
                <Badge variant="outline" className="font-normal ml-1">
                  {user.role || "user"}
                </Badge>
              </p>
              {user.phone_number && (
                <p>
                  <span className="font-medium">Số điện thoại:</span>{" "}
                  {formatPhoneNumber(user.phone_number)}
                </p>
              )}
              <p>
                <span className="font-medium">Ngày tạo tài khoản:</span>{" "}
                {formatDate(user.created_at)}
              </p>
            </div>
          </div>

          {/* Role-based warnings with enhanced messages */}
          <div className="mb-4">
            {/* Warning for self-account */}
            {isSelfAccount && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Không thể tự chặn tài khoản</p>
                  <p className="text-sm">
                    Bạn không thể chặn tài khoản đang đăng nhập của chính mình.
                    Hành động này sẽ khiến bạn bị khóa khỏi hệ thống và không
                    thể quản trị.
                  </p>
                </div>
              </div>
            )}

            {/* Warning for admin roles - High severity */}
            {user.role === "admin" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Không thể chặn tài khoản Admin</p>
                  <p className="text-sm">
                    Việc chặn tài khoản Admin là cực kỳ nhạy cảm và có thể khóa
                    toàn bộ hệ thống quản trị. Nếu thực sự cần, vui lòng thực
                    hiện trực tiếp qua Supabase Dashboard với sự cẩn trọng cao
                    độ.
                  </p>
                </div>
              </div>
            )}

            {/* Warning for staff roles - Medium severity */}
            {user.role === "staff" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    Cảnh báo: Chặn tài khoản Nhân viên
                  </p>
                  <p className="text-sm">
                    Bạn đang chặn một Nhân viên. Các tác vụ đang thực hiện của
                    họ có thể bị gián đoạn và có thể ảnh hưởng đến hoạt động của
                    hệ thống. Vui lòng đảm bảo rằng bạn có lý do chính đáng và
                    đã sắp xếp người thay thế.
                  </p>
                </div>
              </div>
            )}

            {/* Warning for shipper roles - Medium severity */}
            {user.role === "shipper" && (
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

          {/* Ban Duration Selection */}
          <div className="space-y-4">
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
                  onChange={(e) => setCustomDuration(parseInt(e.target.value))}
                  className="w-full p-2 border border-input rounded-md"
                />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUser}
              disabled={user.role === "admin" || isSelfAccount}
              className={
                user.role === "admin" || isSelfAccount
                  ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                  : ""
              }
            >
              Xác nhận chặn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unblock User Dialog */}
      <AlertDialog
        open={isUnblockDialogOpen}
        onOpenChange={setIsUnblockDialogOpen}
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

      {/* Reset Password Dialog */}
      <AlertDialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gửi email đặt lại mật khẩu</AlertDialogTitle>
            <AlertDialogDescription>
              Một email đặt lại mật khẩu sẽ được gửi đến {user.email}. Người
              dùng sẽ có thể đặt mật khẩu mới thông qua liên kết trong email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendPasswordReset}>
              {sendPasswordReset.isPending ? "Đang gửi..." : "Gửi email"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export const UserDetails = memo(UserDetailsComponent);
