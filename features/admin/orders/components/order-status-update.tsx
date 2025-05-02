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
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  ClipboardList,
  X,
} from "lucide-react";
import { useOrderStatuses } from "../hooks/use-order-statuses";
import { useUpdateOrderStatus } from "../hooks/use-update-order-status";
import { useCancelOrder } from "../hooks/use-cancel-order";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  OrderWithRelations,
  orderStatusUpdateSchema,
  cancelOrderSchema,
} from "../types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

// Define form schemas with Zod for client-side validation
const statusUpdateFormSchema = z.object({
  order_status_id: z.string().min(1, "Vui lòng chọn trạng thái"),
  notify_customer: z.boolean().default(true),
});

const cancelOrderFormSchema = z.object({
  reason: z.string().min(5, "Vui lòng nhập lý do hủy đơn (ít nhất 5 ký tự)"),
  notify_customer: z.boolean().default(true),
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
  const [activeTab, setActiveTab] = useState<string>("update");
  const [selectedStatusId, setSelectedStatusId] = useState<
    string | undefined
  >();

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
      notify_customer: true,
    },
  });

  // Watch for form value changes
  const watchedStatusId = statusForm.watch("order_status_id");

  // Update selected status when form value changes
  useEffect(() => {
    setSelectedStatusId(watchedStatusId);
  }, [watchedStatusId]);

  // Reset status form when order changes
  useEffect(() => {
    statusForm.reset({
      order_status_id: currentStatusId?.toString() || "",
      notify_customer: true,
    });
    setSelectedStatusId(currentStatusId?.toString());
  }, [currentStatusId, statusForm]);

  // Cancel order form
  const cancelForm = useForm<z.infer<typeof cancelOrderFormSchema>>({
    resolver: zodResolver(cancelOrderFormSchema),
    defaultValues: {
      reason: "",
      notify_customer: true,
    },
  });

  // Handle status update
  const onStatusUpdate = async (
    values: z.infer<typeof statusUpdateFormSchema>
  ) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        id: order.id,
        data: {
          order_status_id: Number.parseInt(values.order_status_id),
          notify_customer: values.notify_customer,
        },
      });

      toast.success("Cập nhật trạng thái đơn hàng thành công", {
        description: `Đơn hàng #${order.id} đã được cập nhật thành công.`,
      });
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
        notify_customer: values.notify_customer,
      });

      toast.success("Hủy đơn hàng thành công", {
        description: `Đơn hàng #${order.id} đã được hủy thành công.`,
      });
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

  // Define status workflow - status names and their valid transitions
  const statusWorkflow: Record<string, string[]> = {
    "Chờ xác nhận": ["Đã xác nhận", "Đã hủy"],
    "Đã xác nhận": ["Đang xử lý", "Đã hủy"],
    "Đang xử lý": ["Đang giao", "Đã hủy"],
    "Đang giao": ["Đã giao", "Đã hủy"],
    "Đã giao": ["Đã hoàn thành", "Đã hủy"],
    "Đã hoàn thành": ["Đã hủy"],
    "Đã hủy": [],
  };

  // Get valid next statuses based on current status
  const getValidNextStatuses = () => {
    if (!currentStatus) return [];

    // Trạng thái đơn hàng phải tuân theo một quy trình nhất định
    const validStatusNames = statusWorkflow[currentStatus.name] || [];
    const validStatuses = statuses.filter((s) =>
      validStatusNames.includes(s.name)
    );

    return validStatuses;
  };

  const validNextStatuses = getValidNextStatuses();

  // Get status badge variant based on name
  const getStatusBadgeVariant = (statusName: string) => {
    switch (statusName) {
      case "Chờ xác nhận":
        return "outline";
      case "Đã xác nhận":
        return "secondary";
      case "Đang xử lý":
        return "primary";
      case "Đang giao":
        return "warning";
      case "Đã giao":
        return "success";
      case "Đã hoàn thành":
        return "default";
      case "Đã hủy":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Check if a status is a valid next status
  const isValidNextStatus = (statusName: string) => {
    if (!currentStatus) return true;
    return statusWorkflow[currentStatus.name]?.includes(statusName) || false;
  };

  // Status visualization component - now more compact
  const StatusWorkflowVisualization = () => {
    // Define full status flow for visualization
    const fullStatusFlow = [
      "Chờ xác nhận",
      "Đã xác nhận",
      "Đang xử lý",
      "Đang giao",
      "Đã giao",
      "Đã hoàn thành",
    ];

    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <div className="text-xs font-medium">Tiến trình xử lý đơn hàng:</div>
          <div className="text-xs font-semibold text-primary">
            {currentStatus && (
              <div className="flex items-center gap-1">
                <span>Hiện tại:</span>
                <Badge
                  variant={getStatusBadgeVariant(currentStatus.name)}
                  className="px-2 py-0 text-[10px] h-5"
                >
                  {currentStatus.name}
                </Badge>
              </div>
            )}
          </div>
        </div>
        <div className="w-full overflow-auto thin-scrollbar pb-2">
          <div className="flex items-center gap-1.5 min-w-max">
            {fullStatusFlow.map((statusName, index) => {
              const isCurrentStatus = currentStatus?.name === statusName;
              const statusObj = statuses.find((s) => s.name === statusName);
              const isSelected =
                selectedStatusId &&
                statuses.find((s) => s.id.toString() === selectedStatusId)
                  ?.name === statusName;

              return (
                <div key={statusName} className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Badge
                            variant={
                              isSelected
                                ? "default"
                                : isCurrentStatus
                                ? getStatusBadgeVariant(statusName)
                                : "outline"
                            }
                            className={cn(
                              "cursor-default h-6 px-2 gap-1 whitespace-nowrap text-xs",
                              isCurrentStatus &&
                                "border-2 border-primary font-semibold shadow-sm",
                              isSelected &&
                                !isCurrentStatus &&
                                "border-primary/50",
                              !isValidNextStatus(statusName) &&
                                !isCurrentStatus &&
                                "opacity-50"
                            )}
                          >
                            {isCurrentStatus && (
                              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                            )}
                            {statusName}
                            {isSelected && !isCurrentStatus && (
                              <Check className="h-3 w-3" />
                            )}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        align="center"
                        className="max-w-[200px] text-center"
                        sideOffset={2}
                      >
                        <p className="text-xs">
                          {statusObj?.description || statusName}
                        </p>
                        {isCurrentStatus && (
                          <p className="text-xs font-semibold text-primary mt-1">
                            Trạng thái hiện tại
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {index < fullStatusFlow.length - 1 && (
                    <ArrowRight className="h-3 w-3 mx-0.5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render for cancelled orders - more compact
  if (isOrderCancelled) {
    return (
      <Card className="w-full max-w-full border-red-200 dark:border-red-900/40 shadow-sm">
        <CardContent className="p-3 space-y-3">
          <Alert variant="destructive" className="py-2 px-3">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertTitle className="text-sm">Đơn hàng đã bị hủy</AlertTitle>
            <AlertDescription className="text-xs">
              {order.cancellation_reason && (
                <div className="mt-1">
                  <strong>Lý do:</strong> {order.cancellation_reason}
                </div>
              )}
            </AlertDescription>
          </Alert>

          {order.cancelled_by && (
            <div className="text-xs text-muted-foreground">
              <p>
                Hủy bởi:{" "}
                <span className="font-medium">
                  {order.cancelled_by === "user"
                    ? "Khách hàng"
                    : "Quản trị viên"}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Render for completed orders - more compact
  if (isOrderCompleted) {
    return (
      <Card className="w-full border-green-200 dark:border-green-900/40 shadow-sm">
        <CardContent className="p-3">
          <div className="space-y-3 max-h-[60vh] overflow-auto thin-scrollbar pr-1">
            <Alert className="py-2 px-3">
              <AlertCircle className="h-3.5 w-3.5 text-green-500" />
              <AlertTitle className="text-sm">
                Đơn hàng đã hoàn thành
              </AlertTitle>
              <AlertDescription className="text-xs">
                Đơn hàng này đã hoàn thành vào{" "}
                {order.completed_at
                  ? format(new Date(order.completed_at), "HH:mm, dd/MM/yyyy")
                  : "thời điểm không xác định"}
                . Bạn chỉ có thể hủy đơn hàng nếu cần thiết.
              </AlertDescription>
            </Alert>

            <Form {...cancelForm}>
              <form
                onSubmit={cancelForm.handleSubmit(onCancelOrder)}
                className="space-y-3"
              >
                <FormField
                  control={cancelForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Lý do hủy đơn</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập lý do hủy đơn hàng"
                          className="resize-none text-sm min-h-0"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={cancelForm.control}
                  name="notify_customer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-2.5">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <div className="space-y-0.5 leading-none">
                        <FormLabel className="text-xs">
                          Thông báo cho khách hàng
                        </FormLabel>
                        <FormDescription className="text-[10px]">
                          Gửi email thông báo về việc hủy đơn hàng
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={cancelOrderMutation.isPending}
                  >
                    {cancelOrderMutation.isPending
                      ? "Đang xử lý..."
                      : "Xác nhận hủy đơn"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Regular order status update view - optimized layout
  return (
    <Card className="w-full max-w-full border shadow-sm">
      <CardContent className="p-0">
        <div className="max-h-[70vh] overflow-auto thin-scrollbar">
          <div className="p-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-2 h-8">
                <TabsTrigger value="update" className="text-xs py-1.5">
                  Cập nhật trạng thái
                </TabsTrigger>
                <TabsTrigger value="cancel" className="text-xs py-1.5">
                  Hủy đơn hàng
                </TabsTrigger>
              </TabsList>

              <div className="mt-3">
                <TabsContent value="update" className="space-y-3 mt-0">
                  <StatusWorkflowVisualization />

                  <Form {...statusForm}>
                    <form
                      onSubmit={statusForm.handleSubmit(onStatusUpdate)}
                      className="space-y-3"
                    >
                      <FormField
                        control={statusForm.control}
                        name="order_status_id"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <div className="flex justify-between items-center">
                              <FormLabel className="text-xs">
                                Trạng thái mới
                              </FormLabel>
                              <FormDescription className="text-[10px] m-0">
                                {validNextStatuses.length} lựa chọn
                              </FormDescription>
                            </div>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={
                                isStatusesLoading ||
                                updateOrderStatusMutation.isPending ||
                                validNextStatuses.length === 0
                              }
                            >
                              <FormControl>
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Chọn trạng thái mới" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <ScrollArea className="h-[180px]">
                                  {validNextStatuses.map((status) => (
                                    <SelectItem
                                      key={status.id}
                                      value={status.id.toString()}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant={getStatusBadgeVariant(
                                            status.name
                                          )}
                                          className="shrink-0"
                                        >
                                          {status.name}
                                        </Badge>
                                        {status.name === "Đã hủy" ? (
                                          <span className="text-destructive text-xs">
                                            (Chuyển đến hủy đơn hàng)
                                          </span>
                                        ) : null}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {statusForm.watch("order_status_id") &&
                        statusForm.watch("order_status_id") !==
                          currentStatusId?.toString() &&
                        statuses.find(
                          (s) =>
                            s.id.toString() ===
                            statusForm.watch("order_status_id")
                        )?.name === "Đã hủy" && (
                          <div className="py-1">
                            <Alert variant="warning" className="py-2 px-3">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <AlertTitle className="text-xs font-medium">
                                Cảnh báo
                              </AlertTitle>
                              <AlertDescription className="text-xs">
                                Bạn đã chọn hủy đơn hàng. Vui lòng chuyển sang
                                tab "Hủy đơn hàng" để cung cấp lý do hủy chi
                                tiết.
                              </AlertDescription>
                            </Alert>
                            <div className="mt-2 text-center">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab("cancel")}
                                size="sm"
                                className="h-7 text-xs"
                              >
                                Chuyển đến hủy đơn hàng
                              </Button>
                            </div>
                          </div>
                        )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={statusForm.control}
                          name="notify_customer"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-2.5">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="mt-0.5"
                                />
                              </FormControl>
                              <div className="space-y-0.5 leading-none">
                                <FormLabel className="text-xs">
                                  Thông báo cho khách
                                </FormLabel>
                                <FormDescription className="text-[10px]">
                                  Gửi email thông báo trạng thái mới
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          type="submit"
                          size="sm"
                          className="h-8 text-xs"
                          disabled={
                            updateOrderStatusMutation.isPending ||
                            statusForm.watch("order_status_id") ===
                              currentStatusId?.toString() ||
                            statuses.find(
                              (s) =>
                                s.id.toString() ===
                                statusForm.watch("order_status_id")
                            )?.name === "Đã hủy"
                          }
                        >
                          {updateOrderStatusMutation.isPending
                            ? "Đang cập nhật..."
                            : "Cập nhật trạng thái"}
                        </Button>
                      </div>
                    </form>
                  </Form>

                  {/* Workflow info - now in a more compact horizontal layout */}
                  <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <ClipboardList className="h-3 w-3" />
                      <span className="font-medium">Quy trình đơn hàng:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px]">
                          • Chỉ được chuyển đến các trạng thái hợp lệ
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px]">
                          • Đơn hàng đã hủy không thể thay đổi trạng thái
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cancel" className="space-y-3 mt-0">
                  <Alert variant="warning" className="py-2 px-3 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <AlertTitle className="text-xs font-medium">
                      Cảnh báo
                    </AlertTitle>
                    <AlertDescription className="text-xs">
                      Hủy đơn hàng là hành động không thể hoàn tác.
                    </AlertDescription>
                  </Alert>

                  <Form {...cancelForm}>
                    <form
                      onSubmit={cancelForm.handleSubmit(onCancelOrder)}
                      className="space-y-3"
                    >
                      <FormField
                        control={cancelForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">
                              Lý do hủy đơn
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Nhập lý do hủy đơn hàng"
                                className="resize-none text-sm min-h-0"
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={cancelForm.control}
                          name="notify_customer"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-2.5">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="mt-0.5"
                                />
                              </FormControl>
                              <div className="space-y-0.5 leading-none">
                                <FormLabel className="text-xs">
                                  Thông báo cho khách
                                </FormLabel>
                                <FormDescription className="text-[10px]">
                                  Gửi email thông báo về việc hủy đơn
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("update")}
                          size="sm"
                          className="h-8 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" /> Quay lại
                        </Button>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={cancelOrderMutation.isPending}
                          size="sm"
                          className="h-8 text-xs"
                        >
                          {cancelOrderMutation.isPending
                            ? "Đang xử lý..."
                            : "Xác nhận hủy đơn"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add these styles to your global CSS or a component CSS file
// for thin scrollbars that look good across browsers
/* 
.thin-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.thin-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.thin-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.thin-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 20px;
  border: transparent;
}
*/
