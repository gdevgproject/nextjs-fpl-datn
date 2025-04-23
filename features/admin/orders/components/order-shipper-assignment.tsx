"use client";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Truck } from "lucide-react";
import { useShippers } from "../hooks/use-shippers";
import { useAssignShipper } from "../hooks/use-assign-shipper";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { OrderWithRelations, assignShipperSchema } from "../types";

// Define the form schema with Zod for client-side validation
const shipperAssignmentFormSchema = z.object({
  assigned_shipper_id: z.string().optional(),
});

interface OrderShipperAssignmentProps {
  order: OrderWithRelations;
  onSuccess: () => void;
}

export function OrderShipperAssignment({
  order,
  onSuccess,
}: OrderShipperAssignmentProps) {
  const toast = useSonnerToast();

  const { data: shippersData, isLoading: isShippersLoading } = useShippers();
  const assignShipperMutation = useAssignShipper();

  const shippers = shippersData?.data || [];
  const currentShipperId = order?.assigned_shipper_id;

  // Shipper assignment form
  const form = useForm<z.infer<typeof shipperAssignmentFormSchema>>({
    resolver: zodResolver(shipperAssignmentFormSchema),
    defaultValues: {
      assigned_shipper_id: currentShipperId || "",
    },
  });

  // Handle shipper assignment
  const onAssignShipper = async (
    values: z.infer<typeof shipperAssignmentFormSchema>
  ) => {
    try {
      await assignShipperMutation.mutateAsync({
        id: order.id,
        assigned_shipper_id:
          values.assigned_shipper_id === "none"
            ? null
            : values.assigned_shipper_id || null,
      });

      toast.success(
        values.assigned_shipper_id && values.assigned_shipper_id !== "none"
          ? "Gán người giao hàng thành công"
          : "Đã bỏ gán người giao hàng"
      );
      onSuccess();
    } catch (error) {
      toast.error(
        `Lỗi khi gán người giao hàng: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Check if order is cancelled
  const isOrderCancelled = order?.order_statuses?.name === "Đã hủy";

  // Check if order is completed
  const isOrderCompleted = order?.order_statuses?.name === "Đã hoàn thành";

  // Check if order status allows shipper assignment
  const canAssignShipper = ["Đã xác nhận", "Đang xử lý", "Đang giao"].includes(
    order?.order_statuses?.name
  );

  if (isOrderCancelled) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Đơn hàng đã bị hủy</AlertTitle>
        <AlertDescription>
          Đơn hàng này đã bị hủy và không thể gán người giao hàng.
        </AlertDescription>
      </Alert>
    );
  }

  if (isOrderCompleted) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Đơn hàng đã hoàn thành</AlertTitle>
        <AlertDescription>
          Đơn hàng này đã hoàn thành và không cần gán người giao hàng.
        </AlertDescription>
      </Alert>
    );
  }

  if (!canAssignShipper) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Không thể gán người giao hàng</AlertTitle>
        <AlertDescription>
          Chỉ có thể gán người giao hàng cho đơn hàng ở trạng thái "Đã xác
          nhận", "Đang xử lý" hoặc "Đang giao".
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Truck className="h-4 w-4" />
        <AlertTitle>Gán người giao hàng</AlertTitle>
        <AlertDescription>
          Chọn người giao hàng cho đơn hàng này. Người giao hàng sẽ có quyền cập
          nhật trạng thái đơn hàng.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onAssignShipper)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="assigned_shipper_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Người giao hàng</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isShippersLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn người giao hàng" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Không gán</SelectItem>
                    {shippers.map((shipper) => (
                      <SelectItem key={shipper.id} value={shipper.id}>
                        {shipper.name || shipper.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {field.value && field.value !== "none"
                    ? "Bỏ chọn để hủy gán người giao hàng."
                    : "Chọn người giao hàng từ danh sách."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={assignShipperMutation.isPending}>
            {assignShipperMutation.isPending ? "Đang xử lý..." : "Lưu thay đổi"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
