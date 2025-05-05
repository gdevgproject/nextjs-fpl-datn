"use client";

import { useState, useEffect, useMemo } from "react";
import { useOrderStatuses } from "../hooks/use-order-statuses";
import { useUpdateOrderStatus } from "../hooks/use-update-order-status";
import { useAuthQuery } from "@/features/auth/hooks";
import { OrderWithRelations } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
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
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

interface OrderStatusSelectProps {
  order: OrderWithRelations;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function OrderStatusSelect({
  order,
  onSuccess,
  disabled = false,
}: OrderStatusSelectProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(
    order.order_status_id?.toString() || ""
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmType, setConfirmType] = useState<
    "warning" | "error" | "info" | ""
  >("");

  // Get authentication session to determine user role
  const { data: session } = useAuthQuery();
  const userRole = session?.user?.app_metadata?.role || "authenticated";
  const isShipper = userRole === "shipper";
  const currentUserId = session?.user?.id;

  const { toast } = useSonnerToast();
  const { data: statusesResponse } = useOrderStatuses();
  const allStatuses = statusesResponse?.data || [];

  // Use memo to filter available statuses based on role
  const availableStatuses = useMemo(() => {
    if (isShipper) {
      // Shipper can only update from "Đang giao" to "Đã giao"
      if (order.order_statuses?.name === "Đang giao") {
        return allStatuses.filter(
          (s) => s.name === "Đã giao" || s.id === order.order_status_id
        );
      }
      // No other transitions allowed for shipper
      return allStatuses.filter((s) => s.id === order.order_status_id);
    }

    // Admin/Staff can access all statuses
    return allStatuses;
  }, [
    allStatuses,
    isShipper,
    order.order_status_id,
    order.order_statuses?.name,
  ]);

  const {
    updateOrderStatus,
    isUpdating,
    validationResult,
    checkValidation,
    resetValidation,
  } = useUpdateOrderStatus();

  // Reset selected status when order changes
  useEffect(() => {
    setSelectedStatus(order.order_status_id?.toString() || "");
  }, [order.order_status_id]);

  // Handle status change attempt
  const handleStatusChange = (value: string) => {
    const newStatusId = Number(value);
    if (newStatusId === order.order_status_id) return;

    // Validate the status transition
    const validation = checkValidation(order, newStatusId, allStatuses);

    // If validation has warnings or errors, show confirmation dialog
    if (validation.error) {
      setConfirmMessage(validation.error);
      setConfirmType(validation.warningLevel || "warning");

      // Only proceed to confirmation if validation is ok or has warnings
      if (validation.isValid) {
        setSelectedStatus(value);
        setShowConfirmDialog(true);
      } else {
        // Reset to current status if not valid
        setSelectedStatus(order.order_status_id?.toString() || "");

        // Show toast error instead of dialog for invalid transitions
        toast.error("Không thể cập nhật trạng thái", {
          description: validation.error,
        });
      }
    } else {
      // No warnings, proceed directly
      setSelectedStatus(value);
      handleConfirmStatusChange(newStatusId);
    }
  };

  // Handle confirmed status change
  const handleConfirmStatusChange = async (statusId?: number) => {
    try {
      const newStatusId = statusId || Number(selectedStatus);
      if (!newStatusId || newStatusId === order.order_status_id) return;

      await updateOrderStatus({
        id: order.id,
        data: { order_status_id: newStatusId },
        order,
        allStatuses,
      });

      // Show success message
      const newStatus = allStatuses.find((s) => s.id === newStatusId);
      toast.success("Trạng thái đơn hàng đã được cập nhật", {
        description: `Đơn hàng #${order.id} đã được cập nhật sang "${
          newStatus?.name || "trạng thái mới"
        }"`,
      });

      // Trigger callback for refresh
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Lỗi khi cập nhật trạng thái", {
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
      });
    } finally {
      setShowConfirmDialog(false);
      resetValidation();
    }
  };

  // Handle cancel dialog
  const handleCancelDialog = () => {
    setShowConfirmDialog(false);
    setSelectedStatus(order.order_status_id?.toString() || "");
    resetValidation();
  };

  return (
    <>
      <Select
        value={selectedStatus}
        onValueChange={handleStatusChange}
        disabled={disabled || isUpdating}
      >
        <SelectTrigger
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "w-[160px] justify-between px-3 py-1 h-9"
          )}
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Đang cập nhật...</span>
            </>
          ) : (
            <SelectValue placeholder="Cập nhật trạng thái" />
          )}
        </SelectTrigger>
        <SelectContent>
          {availableStatuses.map((status) => (
            <SelectItem
              key={status.id}
              value={status.id.toString()}
              disabled={status.id === order.order_status_id}
            >
              {status.name}
              {status.id === order.order_status_id && " (hiện tại)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmType === "warning" || confirmType === "info" ? (
                <AlertCircle
                  className={`h-5 w-5 ${
                    confirmType === "warning"
                      ? "text-amber-500"
                      : "text-blue-500"
                  }`}
                />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              Xác nhận thay đổi trạng thái
            </AlertDialogTitle>
            <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDialog}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmStatusChange()}
              className={cn(
                buttonVariants({
                  variant:
                    confirmType === "warning"
                      ? "warning"
                      : confirmType === "error"
                      ? "destructive"
                      : "default",
                })
              )}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận thay đổi"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
