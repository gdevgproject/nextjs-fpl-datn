"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { useOrderStatuses } from "../hooks/use-order-statuses";
import { useUpdateOrderStatus } from "../hooks/use-update-order-status";
import { useCancelOrder } from "../hooks/use-cancel-order";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import {
  OrderWithRelations,
  orderStatusUpdateSchema,
  cancelOrderSchema,
} from "../types";

// Define form schemas with Zod for client-side validation
const statusUpdateFormSchema = z.object({
  order_status_id: z.string().min(1, "Vui lòng chọn trạng thái"),
});

const cancelOrderFormSchema = z.object({
  reason: z.string().min(5, "Vui lòng nhập lý do hủy đơn (ít nhất 5 ký tự)"),
});

interface OrderStatusUpdateProps {
  order: OrderWithRelations;
  onSuccess: () => void;
}

export function OrderStatusUpdate({
  order,
  onSuccess,
}: OrderStatusUpdateProps) {
  const toast = useSonnerToast();
  const [showCancelForm, setShowCancelForm] = useState(false);

  const { data: statusesData, isLoading: isStatusesLoading } =
    useOrderStatuses();
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const cancelOrderMutation = useCancelOrder();

  const statuses = statusesData?.data || [];
  const currentStatusId = order?.order_status_id;
  const currentStatus = statuses.find((s) => s.id === currentStatusId);

  // Status update form
  const statusForm = useForm<z.infer<typeof statusUpdateFormSchema>>({
    resolver: zodResolver(statusUpdateFormSchema),
    defaultValues: {
      order_status_id: currentStatusId?.toString() || "",
    },
  });

  // Reset status form when order changes
  useEffect(() => {
    statusForm.reset({ order_status_id: currentStatusId?.toString() || "" });
  }, [currentStatusId, statusForm]);

  // Cancel order form
  const cancelForm = useForm<z.infer<typeof cancelOrderFormSchema>>({
    resolver: zodResolver(cancelOrderFormSchema),
    defaultValues: {
      reason: "",
    },
  });

  // Handle status update
  const onStatusUpdate = async (
    values: z.infer<typeof statusUpdateFormSchema>
  ) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        id: order.id,
        data: { order_status_id: Number.parseInt(values.order_status_id) },
      });

      toast.success("Cập nhật trạng thái đơn hàng thành công");
      onSuccess();
    } catch (error) {
      toast.error(
        `Lỗi khi cập nhật trạng thái: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Handle order cancellation
  const onCancelOrder = async (
    values: z.infer<typeof cancelOrderFormSchema>
  ) => {
    try {
      await cancelOrderMutation.mutateAsync({
        id: order.id,
        reason: values.reason,
      });

      toast.success("Hủy đơn hàng thành công");
      onSuccess();
    } catch (error) {
      toast.error(
        `Lỗi khi hủy đơn hàng: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Check if order is already cancelled
  const isOrderCancelled = currentStatus?.name === "Đã hủy";

  // Check if order is completed
  const isOrderCompleted = currentStatus?.name === "Đã hoàn thành";

  // Filter out invalid status transitions
  const getValidNextStatuses = () => {
    if (!currentStatus) return statuses;

    // Define valid transitions based on current status
    const validTransitions: Record<string, number[]> = {
      "Chờ xác nhận": statuses
        .filter((s) => ["Đã xác nhận", "Đã hủy"].includes(s.name))
        .map((s) => s.id),
      "Đã xác nhận": statuses
        .filter((s) => ["Đang xử lý", "Đã hủy"].includes(s.name))
        .map((s) => s.id),
      "Đang xử lý": statuses
        .filter((s) => ["Đang giao", "Đã hủy"].includes(s.name))
        .map((s) => s.id),
      "Đang giao": statuses
        .filter((s) => ["Đã giao", "Đã hủy"].includes(s.name))
        .map((s) => s.id),
      "Đã giao": statuses
        .filter((s) => ["Đã hoàn thành", "Đã hủy"].includes(s.name))
        .map((s) => s.id),
      "Đã hoàn thành": statuses
        .filter((s) => ["Đã hủy"].includes(s.name))
        .map((s) => s.id),
      "Đã hủy": [], // No valid transitions from cancelled state
    };

    const validStatusIds = validTransitions[currentStatus.name] || [];
    return statuses.filter((s) => validStatusIds.includes(s.id));
  };

  const validNextStatuses = getValidNextStatuses();

  if (isOrderCancelled) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Đơn hàng đã bị hủy</AlertTitle>
        <AlertDescription>
          Đơn hàng này đã bị hủy và không thể thay đổi trạng thái.
          {order.cancellation_reason && (
            <div className="mt-2">
              <strong>Lý do hủy:</strong> {order.cancellation_reason}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (isOrderCompleted) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Đơn hàng đã hoàn thành</AlertTitle>
          <AlertDescription>
            Đơn hàng này đã hoàn thành. Bạn chỉ có thể hủy đơn hàng nếu cần
            thiết.
          </AlertDescription>
        </Alert>

        <Button
          variant="destructive"
          onClick={() => setShowCancelForm(true)}
          className="w-full"
        >
          Hủy đơn hàng
        </Button>

        {showCancelForm && (
          <Form {...cancelForm}>
            <form
              onSubmit={cancelForm.handleSubmit(onCancelOrder)}
              className="space-y-4"
            >
              <FormField
                control={cancelForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do hủy đơn</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập lý do hủy đơn hàng"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Vui lòng cung cấp lý do hủy đơn hàng.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCancelForm(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={cancelOrderMutation.isPending}
                >
                  {cancelOrderMutation.isPending
                    ? "Đang xử lý..."
                    : "Xác nhận hủy đơn"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showCancelForm ? (
        <>
          <Form {...statusForm}>
            <form
              onSubmit={statusForm.handleSubmit(onStatusUpdate)}
              className="space-y-4"
            >
              <FormField
                control={statusForm.control}
                name="order_status_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái đơn hàng</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isStatusesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {validNextStatuses.map((status) => (
                          <SelectItem
                            key={status.id}
                            value={status.id.toString()}
                          >
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Chọn trạng thái mới cho đơn hàng.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={updateOrderStatusMutation.isPending}
              >
                {updateOrderStatusMutation.isPending
                  ? "Đang cập nhật..."
                  : "Cập nhật trạng thái"}
              </Button>
            </form>
          </Form>

          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              onClick={() => setShowCancelForm(true)}
              className="w-full"
            >
              Hủy đơn hàng
            </Button>
          </div>
        </>
      ) : (
        <Form {...cancelForm}>
          <form
            onSubmit={cancelForm.handleSubmit(onCancelOrder)}
            className="space-y-4"
          >
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Cảnh báo</AlertTitle>
              <AlertDescription>
                Hủy đơn hàng là hành động không thể hoàn tác. Vui lòng xác nhận
                kỹ trước khi thực hiện.
              </AlertDescription>
            </Alert>

            <FormField
              control={cancelForm.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do hủy đơn</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập lý do hủy đơn hàng"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Vui lòng cung cấp lý do hủy đơn hàng.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCancelForm(false)}
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={cancelOrderMutation.isPending}
              >
                {cancelOrderMutation.isPending
                  ? "Đang xử lý..."
                  : "Xác nhận hủy đơn"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
