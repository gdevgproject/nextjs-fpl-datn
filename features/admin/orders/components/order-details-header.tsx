"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrderWithRelations } from "../types";
import { useAuthQuery } from "@/features/auth/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderCancelDialog } from "./order-cancel-dialog";
import { OrderStatusSelect } from "./order-status-select";
import { AssignShipperDialog } from "./assign-shipper-dialog";
import { formatCurrency } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Receipt,
  MoreVertical,
  Printer,
  FileText,
} from "lucide-react";

interface OrderDetailsHeaderProps {
  order: OrderWithRelations;
  onRefresh?: () => void;
}

export function OrderDetailsHeader({
  order,
  onRefresh,
}: OrderDetailsHeaderProps) {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAssignShipperDialog, setShowAssignShipperDialog] = useState(false);

  // Get authentication session to determine user role
  const { data: session } = useAuthQuery();
  const userRole = session?.user?.app_metadata?.role || "authenticated";
  const isShipper = userRole === "shipper";
  const currentUserId = session?.user?.id;

  // Determine if shipper can update status
  const canUpdateStatus = () => {
    if (!isShipper) return true; // Admin or staff can always update

    // Shipper can only update if:
    // 1. The order is assigned to them
    // 2. The order is in "Đang giao" status and they can mark it as "Đã giao"
    if (order.assigned_shipper_id === currentUserId) {
      if (order.order_statuses?.name === "Đang giao") {
        return true;
      }
    }
    return false;
  };

  // Các quyền thực hiện thao tác khác
  const canAssignShipper = !isShipper; // Shipper KHÔNG được phép gán/thay đổi shipper
  const canCancelOrder = !isShipper; // Shipper KHÔNG được phép hủy đơn hàng
  const canAccessOtherActions = !isShipper; // Admin/staff có quyền thực hiện các thao tác khác

  return (
    <div className="bg-background border-b sticky top-0 z-10">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              title="Quay lại"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Quay lại</span>
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">
                Đơn hàng #{order.id || "-"}
              </h1>

              {/* Order status badge */}
              <Badge
                variant="outline"
                className={`px-2.5 py-0.5 text-xs ${
                  order.order_statuses?.name === "Đã hủy"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : order.order_statuses?.name === "Đã hoàn thành"
                    ? "bg-green-500/10 text-green-600 border-green-200 dark:text-green-400 dark:border-green-900"
                    : order.order_statuses?.name === "Đã giao"
                    ? "bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-900"
                    : order.order_statuses?.name === "Đang giao"
                    ? "bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-900"
                    : "bg-primary/10 text-primary border-primary/20"
                }`}
              >
                {order.order_statuses?.name || "Chưa xác định"}
              </Badge>

              {/* Payment status badge */}
              <Badge
                variant="outline"
                className={`px-2.5 py-0.5 text-xs ${
                  order.payment_status === "Paid"
                    ? "bg-green-500/10 text-green-600 border-green-200 dark:text-green-400 dark:border-green-900"
                    : "bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-900"
                }`}
              >
                {order.payment_status === "Paid"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status Update Dropdown */}
            {canUpdateStatus() && (
              <OrderStatusSelect
                order={order}
                onSuccess={onRefresh}
                disabled={!canUpdateStatus()}
              />
            )}

            {/* Assign Shipper Button - KHÔNG hiển thị cho shipper */}
            {canAssignShipper && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssignShipperDialog(true)}
                className="hidden sm:flex"
              >
                {order.assigned_shipper_id
                  ? "Đổi người giao hàng"
                  : "Gán người giao hàng"}
              </Button>
            )}

            {/* Cancel Order Button - KHÔNG hiển thị cho shipper */}
            {canCancelOrder && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
                className="hidden sm:flex"
                disabled={
                  order.order_statuses?.name === "Đã hủy" ||
                  order.order_statuses?.name === "Đã giao" ||
                  order.order_statuses?.name === "Đã hoàn thành" ||
                  order.order_statuses?.name === "Đang giao"
                }
                title={
                  order.order_statuses?.name === "Đã hủy"
                    ? "Đơn hàng đã bị hủy"
                    : order.order_statuses?.name === "Đã giao" ||
                      order.order_statuses?.name === "Đã hoàn thành" ||
                      order.order_statuses?.name === "Đang giao"
                    ? "Không thể hủy đơn hàng ở trạng thái này"
                    : "Hủy đơn hàng"
                }
              >
                Hủy đơn hàng
              </Button>
            )}

            {/* More Actions - Admin/Staff */}
            {canAccessOtherActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Thao tác khác</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Menu option for assign shipper - KHÔNG hiển thị cho shipper */}
                  <DropdownMenuItem
                    onClick={() => setShowAssignShipperDialog(true)}
                    className="sm:hidden"
                  >
                    {order.assigned_shipper_id
                      ? "Đổi người giao hàng"
                      : "Gán người giao hàng"}
                  </DropdownMenuItem>

                  {/* Menu option for cancel order - KHÔNG hiển thị cho shipper */}
                  <DropdownMenuItem
                    onClick={() => setShowCancelDialog(true)}
                    className="sm:hidden"
                    disabled={
                      order.order_statuses?.name === "Đã hủy" ||
                      order.order_statuses?.name === "Đã giao" ||
                      order.order_statuses?.name === "Đã hoàn thành" ||
                      order.order_statuses?.name === "Đang giao"
                    }
                  >
                    Hủy đơn hàng
                  </DropdownMenuItem>

                  {/* Common actions for all roles */}
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/orders/${order.id}/in-hoa-don`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      In hóa đơn
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/orders/${order.id}/in-phieu-giao-hang`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      In phiếu giao hàng
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/tra-cuu-don-hang/${order.access_token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Xem đơn hàng (Public)
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Simplified actions for shipper */}
            {isShipper && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Thao tác</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/orders/${order.id}/in-phieu-giao-hang`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      In phiếu giao hàng
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/tra-cuu-don-hang/${order.access_token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Xem đơn hàng (Public)
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2">
          <div className="text-muted-foreground">
            <span>Đặt hàng: {formatDate(order.order_date)}</span>
            <span className="mx-2">•</span>
            <span>Tổng cộng: {formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Dialogs - Chỉ hiển thị nếu không phải là shipper */}
      {!isShipper && (
        <>
          <OrderCancelDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            orderId={order.id}
            onSuccess={onRefresh}
          />

          <AssignShipperDialog
            open={showAssignShipperDialog}
            onOpenChange={setShowAssignShipperDialog}
            order={order}
            onSuccess={onRefresh}
          />
        </>
      )}
    </div>
  );
}
