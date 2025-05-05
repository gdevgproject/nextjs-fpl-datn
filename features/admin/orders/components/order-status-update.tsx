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
  RefreshCw,
  AlertOctagon,
  BanIcon,
  InfoIcon,
  CircleArrowRight,
  Loader2,
  ArrowLeft,
  Clipboard,
} from "lucide-react";
import { useOrderStatuses } from "../hooks/use-order-statuses";
import { useUpdateOrderStatus } from "../hooks/use-update-order-status";
import { useCancelOrder } from "../hooks/use-cancel-order";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Để ngăn chặn lỗi "Illegal constructor" khi server-side rendering
// Chúng ta sẽ thêm kiểm tra để đảm bảo các component UI như Tooltip chỉ chạy ở client
const isBrowser = typeof window !== "undefined";

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
    });
    setSelectedStatusId(currentStatusId?.toString());
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
      const newStatusId = Number.parseInt(values.order_status_id);
      // Tìm trạng thái mới trong danh sách trạng thái
      const newStatus = statuses.find((s) => s.id === newStatusId);

      // Hiển thị trạng thái đang xử lý trực tiếp trong UI thay vì dùng toast loading
      await updateOrderStatusMutation.updateOrderStatus({
        id: order.id,
        data: {
          order_status_id: newStatusId,
        },
        order,
        allStatuses: statuses,
      });

      // Hiển thị thông báo thành công
      toast.success("Cập nhật trạng thái đơn hàng thành công", {
        description: `Đơn hàng #${order.id} đã được cập nhật thành công thành "${newStatus?.name || "trạng thái mới"}"`,
      });

      // Thực hiện ngay callback onSuccess để cập nhật UI ngay lập tức
      // mà không đợi re-render từ parent component
      if (onSuccess) {
        onSuccess();
      }
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

      toast.success("Hủy đơn hàng thành công", {
        description: `Đơn hàng #${
          order.id
        } đã được hủy thành công với lý do: "${values.reason.substring(0, 30)}${
          values.reason.length > 30 ? "..." : ""
        }"`,
      });

      // Thông báo thành công nhưng KHÔNG đóng dialog
      if (onSuccess) {
        // Gọi onSuccess nhưng không đóng dialog
        onSuccess();
      }

      // Reset form sau khi hủy thành công
      cancelForm.reset({
        reason: "",
      });

      // Chuyển về tab cập nhật trạng thái sau khi hủy thành công
      setActiveTab("update");
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

  // Status workflow visualization - redesigned to match the image example
  const StatusWorkflowVisualization = () => {
    // Define full status flow for visualization
    const statusFlow = [
      { id: "pending", name: "Chờ xác nhận" },
      { id: "confirmed", name: "Đã xác nhận" },
      { id: "processing", name: "Đang xử lý" },
      { id: "shipping", name: "Đang giao" },
      { id: "delivered", name: "Đã giao" },
      { id: "completed", name: "Đã hoàn thành" },
    ];

    // Find current status in the workflow
    const currentStatusIndex = currentStatus
      ? statusFlow.findIndex((s) => s.name === currentStatus.name)
      : -1;

    return (
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div className="text-sm font-medium text-foreground/90">
            Trạng thái hiện tại:
          </div>
          <div>
            {currentStatus && (
              <Badge
                variant={getStatusBadgeVariant(currentStatus.name)}
                className="px-3 py-1 h-6 text-xs"
              >
                <span className="w-2 h-2 mr-1.5 rounded-full bg-current inline-block animate-pulse" />
                {currentStatus.name}
              </Badge>
            )}
          </div>
        </div>

        <div className="bg-muted/10 dark:bg-background/20 rounded-md border relative p-4">
          <div className="w-full overflow-x-auto scrollbar-thin pb-2">
            <div className="flex justify-between min-w-[500px]">
              {statusFlow.map((status, index) => {
                const isCurrentStatus = currentStatus?.name === status.name;
                const isCompleted = currentStatusIndex > index;
                const isDisabled = currentStatusIndex < index - 1;

                return (
                  <div
                    key={status.id}
                    className="relative flex flex-col items-center"
                  >
                    {/* Status dot */}
                    <div
                      className={cn(
                        "w-3 h-3 sm:w-4 sm:h-4 rounded-full z-10 mb-1.5",
                        isCurrentStatus
                          ? "bg-primary ring-4 ring-primary/20"
                          : isCompleted
                          ? "bg-primary"
                          : isDisabled
                          ? "bg-muted-foreground/30"
                          : "bg-muted-foreground/70"
                      )}
                    />

                    {/* Status Label */}
                    <span
                      className={cn(
                        "text-[10px] sm:text-xs whitespace-nowrap px-1 text-center",
                        isCurrentStatus
                          ? "font-medium text-primary"
                          : isDisabled
                          ? "text-muted-foreground/50"
                          : "text-muted-foreground"
                      )}
                    >
                      {status.name}
                    </span>

                    {/* Connection line */}
                    {index < statusFlow.length - 1 && (
                      <div
                        className={cn(
                          "absolute top-1.5 sm:top-2 h-0.5 w-[calc(100%-1rem)]",
                          "left-[50%] -translate-x-0",
                          index < currentStatusIndex
                            ? "bg-primary"
                            : "bg-muted-foreground/30"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workflow description */}
          <div className="mt-5 pt-3 border-t border-dashed">
            <div className="flex items-center text-xs text-muted-foreground gap-1 mb-2">
              <InfoIcon className="h-3.5 w-3.5" />
              <span className="font-medium">Quy trình xử lý đơn hàng</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {currentStatus && (
                <Badge variant="outline" className="text-[10px] h-5">
                  {currentStatus.name}
                </Badge>
              )}
              {validNextStatuses.map((status) => (
                <Badge
                  key={status.id}
                  variant="secondary"
                  className="text-[10px] h-5 bg-secondary/40"
                  onClick={() => {
                    statusForm.setValue(
                      "order_status_id",
                      status.id.toString()
                    );
                    setSelectedStatusId(status.id.toString());
                  }}
                >
                  → {status.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render for cancelled orders - more compact
  if (isOrderCancelled) {
    return (
      <div className="py-6 px-4 sm:px-6 space-y-4 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-2">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">
            Thông tin trạng thái đơn hàng #{order.id}
          </h3>
          <Badge variant="destructive" className="text-sm h-7 px-3 py-1">
            Đã hủy
          </Badge>
        </div>

        <Alert variant="destructive" className="py-4 px-5">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-base">Đơn hàng này đã bị hủy</AlertTitle>
          <AlertDescription>
            {order.cancellation_reason && (
              <div className="mt-2 space-y-1">
                <p className="font-medium">Lý do hủy đơn:</p>
                <p className="text-sm bg-destructive/10 rounded-md p-2">
                  {order.cancellation_reason}
                </p>
              </div>
            )}

            {order.cancelled_by && (
              <div className="mt-3 text-sm flex items-center gap-2">
                <span>Người hủy đơn:</span>
                <span className="font-medium">
                  {order.cancelled_by === "user"
                    ? "Khách hàng"
                    : "Nhân viên quản trị"}
                </span>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render for completed orders - more compact
  if (isOrderCompleted) {
    return (
      <div className="py-6 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">
            Thông tin trạng thái đơn hàng #{order.id}
          </h3>
          <Badge
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-sm h-7 px-3 py-1"
          >
            Đã hoàn thành
          </Badge>
        </div>

        <Alert className="py-4 px-5 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-800 dark:text-green-300">
          <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-base text-green-700 dark:text-green-300">
            Đơn hàng đã hoàn thành
          </AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-400">
            <p>
              Đơn hàng này đã hoàn thành vào{" "}
              <span className="font-semibold">
                {order.completed_at
                  ? format(new Date(order.completed_at), "HH:mm, dd/MM/yyyy")
                  : "thời điểm không xác định"}
              </span>
            </p>

            <p className="text-sm mt-2">
              Đơn hàng đã hoàn thành không thể thay đổi trạng thái hoặc hủy. Nếu
              có vấn đề, vui lòng liên hệ với quản trị viên hệ thống.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Regular order status update view - optimized layout
  return (
    <div className="relative flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
          <Clipboard className="h-5 w-5 text-primary" />
          <span>Quản lý đơn hàng #{order.id}</span>
        </h3>
        {currentStatus && (
          <Badge
            variant={getStatusBadgeVariant(currentStatus.name)}
            className="text-sm h-7 px-3 py-1"
          >
            {currentStatus.name}
          </Badge>
        )}
      </div>

      {/* Replace internal ScrollArea with a div to avoid nested scrolling */}
      <div className="pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-11 sticky top-0 z-10">
            <TabsTrigger value="update" className="text-sm py-2.5">
              <RefreshCw className="h-4 w-4 mr-2" /> Cập nhật trạng thái
            </TabsTrigger>
            <TabsTrigger value="cancel" className="text-sm py-2.5">
              <AlertOctagon className="h-4 w-4 mr-2" /> Hủy đơn hàng
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="update" className="space-y-6 mt-0">
              <StatusWorkflowVisualization />

              <Form {...statusForm}>
                <form
                  onSubmit={statusForm.handleSubmit(onStatusUpdate)}
                  className="space-y-5 relative"
                >
                  {/* Loading overlay khi cập nhật trạng thái */}
                  {updateOrderStatusMutation.isUpdating && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 dark:bg-black/40 rounded-md">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}

                  {/* Căn giữa UI chọn trạng thái mới */}
                  <div className="flex justify-center">
                    <div className="w-full max-w-xl">
                      <FormField
                        control={statusForm.control}
                        name="order_status_id"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <FormLabel className="text-base">
                                Chọn trạng thái mới
                              </FormLabel>
                              <Badge
                                variant={
                                  validNextStatuses.length > 0
                                    ? "outline"
                                    : "destructive"
                                }
                                className="ml-2"
                              >
                                {validNextStatuses.length} lựa chọn hợp lệ
                              </Badge>
                            </div>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={
                                isStatusesLoading ||
                                updateOrderStatusMutation.isUpdating ||
                                validNextStatuses.length === 0
                              }
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 text-base">
                                  <SelectValue placeholder="Chọn trạng thái mới cho đơn hàng" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <ScrollArea className="h-[240px]">
                                  {validNextStatuses.map((status) => (
                                    <SelectItem
                                      key={status.id}
                                      value={status.id.toString()}
                                      className="py-3"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Badge
                                          variant={getStatusBadgeVariant(
                                            status.name
                                          )}
                                          className="shrink-0 px-2.5 py-1"
                                        >
                                          {status.name}
                                        </Badge>
                                        {status.description && (
                                          <span className="text-xs text-muted-foreground line-clamp-1">
                                            {status.description}
                                          </span>
                                        )}
                                      </div>
                                    </SelectItem>
                                  ))}
                                  {validNextStatuses.length === 0 && (
                                    <div className="p-4 text-center text-muted-foreground">
                                      <BanIcon className="h-5 w-5 mx-auto mb-2 opacity-50" />
                                      <p className="text-sm">
                                        Không có trạng thái hợp lệ tiếp theo
                                      </p>
                                    </div>
                                  )}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                            {validNextStatuses.length === 0 && (
                              <p className="text-xs text-muted-foreground mt-1.5">
                                Đơn hàng này không thể chuyển sang trạng thái
                                khác
                              </p>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {statusForm.watch("order_status_id") &&
                    statusForm.watch("order_status_id") !==
                      currentStatusId?.toString() &&
                    statuses.find(
                      (s) =>
                        s.id.toString() === statusForm.watch("order_status_id")
                    )?.name === "Đã hủy" && (
                      <div className="py-3">
                        <Alert
                          variant="warning"
                          className="py-3 px-4 flex items-start"
                        >
                          <AlertTriangle className="h-5 w-5 mt-0.5" />
                          <div className="ml-3">
                            <AlertTitle className="text-base font-medium">
                              Cảnh báo
                            </AlertTitle>
                            <AlertDescription className="text-sm">
                              <p>
                                Bạn đã chọn hủy đơn hàng. Vui lòng chuyển sang
                                tab "Hủy đơn hàng" để cung cấp lý do hủy chi
                                tiết.
                              </p>
                              <div className="mt-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setActiveTab("cancel")}
                                  className="text-sm gap-2"
                                >
                                  <ArrowRight className="h-4 w-4" />
                                  Chuyển đến hủy đơn hàng
                                </Button>
                              </div>
                            </AlertDescription>
                          </div>
                        </Alert>
                      </div>
                    )}

                  <div className="flex items-center justify-between pt-2 border-t mt-6">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <InfoIcon className="h-4 w-4 mr-1.5" />
                      <span>
                        Đơn hàng chỉ có thể được chuyển sang các trạng thái hợp
                        lệ tiếp theo
                      </span>
                    </div>

                    <Button
                      type="submit"
                      className="gap-2"
                      disabled={
                        updateOrderStatusMutation.isUpdating ||
                        statusForm.watch("order_status_id") ===
                          currentStatusId?.toString() ||
                        validNextStatuses.length === 0 ||
                        statuses.find(
                          (s) =>
                            s.id.toString() ===
                            statusForm.watch("order_status_id")
                        )?.name === "Đã hủy"
                      }
                    >
                      {updateOrderStatusMutation.isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Cập nhật trạng thái
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>

              {/* Status transition info */}
              <div className="border rounded-md p-4 bg-muted/30 dark:bg-muted/10">
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <span className="font-medium">Quy trình xử lý đơn hàng</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CircleArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span>Chờ xác nhận → Đã xác nhận → Đang xử lý</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span>Đang xử lý → Đang giao → Đã giao</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span>Đã giao → Đã hoàn thành</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span>Có thể hủy đơn ở bất kỳ trạng thái nào</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cancel" className="space-y-5 mt-0">
              <Alert variant="warning" className="py-4 px-5 mb-4">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="text-base">Cảnh báo</AlertTitle>
                <AlertDescription className="text-sm">
                  <p>
                    Hành động hủy đơn hàng sẽ không thể hoàn tác. Đơn hàng sau
                    khi hủy sẽ không thể khôi phục lại trạng thái trước đó.
                  </p>

                  <p className="mt-2 font-medium">
                    Nếu đơn hàng đã thanh toán, khách hàng sẽ được hoàn tiền
                    theo chính sách của cửa hàng.
                  </p>
                </AlertDescription>
              </Alert>

              <Form {...cancelForm}>
                <form
                  onSubmit={cancelForm.handleSubmit(onCancelOrder)}
                  className="space-y-5"
                >
                  <FormField
                    control={cancelForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-base flex items-center gap-1.5">
                          Lý do hủy đơn
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Vui lòng nhập lý do hủy đơn hàng (tối thiểu 5 ký tự)"
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Lý do hủy đơn sẽ được sử dụng để thống kê và cải thiện
                          dịch vụ
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("update")}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" /> Quay lại
                    </Button>

                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={cancelOrderMutation.isPending}
                      className="gap-2"
                    >
                      {cancelOrderMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <BanIcon className="h-4 w-4" />
                          Xác nhận hủy đơn hàng
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
