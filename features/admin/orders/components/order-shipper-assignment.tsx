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
import {
  AlertCircle,
  Truck,
  UserX,
  UserCheck,
  Phone,
  Mail,
  Loader2,
  Info,
  PackageSearch,
} from "lucide-react";
import { useShippers } from "../hooks/use-shippers";
import { useAssignShipper } from "../hooks/use-assign-shipper";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { OrderWithRelations, assignShipperSchema } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

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

  const {
    data: shippersData,
    isLoading: isShippersLoading,
    error: shippersError,
  } = useShippers();

  // Log để debug
  console.log("Shippers data:", shippersData);
  console.log("Shippers loading:", isShippersLoading);
  console.log("Shippers error:", shippersError);

  const assignShipperMutation = useAssignShipper();

  const shippers = shippersData?.data || [];
  const currentShipperId = order?.assigned_shipper_id;

  // Khai báo thêm state để lưu shipper đã chọn
  const [selectedShipper, setSelectedShipper] = useState<any>(
    shippers.find((s) => s.id === currentShipperId)
  );

  // Cập nhật selectedShipper khi danh sách shippers thay đổi
  useEffect(() => {
    if (currentShipperId && shippers.length > 0) {
      setSelectedShipper(shippers.find((s) => s.id === currentShipperId));
    }
  }, [currentShipperId, shippers]);

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

      // Tìm thông tin shipper để hiển thị thông báo chi tiết
      let shipperInfo = "";
      if (values.assigned_shipper_id && values.assigned_shipper_id !== "none") {
        const shipper = shippers.find(
          (s) => s.id === values.assigned_shipper_id
        );
        shipperInfo = shipper ? ` (${shipper.name})` : "";
      }

      toast.success(
        values.assigned_shipper_id && values.assigned_shipper_id !== "none"
          ? `Gán người giao hàng${shipperInfo} thành công`
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

  // Special case: Đang giao - can't change shipper but can view current
  const isShipping = order?.order_statuses?.name === "Đang giao";

  // Render loading state if still loading data
  if (isShippersLoading && !shippersData) {
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-full flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-center text-muted-foreground">
          Đang tải danh sách người giao hàng...
        </p>
      </div>
    );
  }

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
          {order.assigned_shipper_id && order.shipper_profile && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <div className="font-medium mb-1">
                Shipper đã xử lý đơn hàng này:
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={order.shipper_profile.avatar_url || ""}
                    alt={order.shipper_profile.display_name}
                  />
                  <AvatarFallback>
                    {order.shipper_profile.display_name?.[0] || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {order.shipper_profile.display_name}
                  </div>
                  {order.shipper_profile.phone_number && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.shipper_profile.phone_number}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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

  // Hiển thị thông tin shipper hiện tại
  const CurrentShipperInfo = () => {
    if (!currentShipperId) return null;

    const currentShipper = shippers.find((s) => s.id === currentShipperId);

    if (!currentShipper && !order.shipper_profile) return null;

    return (
      <Card className="mb-5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="font-medium">Shipper hiện tại</div>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      currentShipper?.avatar_url ||
                      order.shipper_profile?.avatar_url ||
                      ""
                    }
                    alt={
                      currentShipper?.name ||
                      order.shipper_profile?.display_name ||
                      "Shipper"
                    }
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {(currentShipper?.name && currentShipper.name.charAt(0)) ||
                      (order.shipper_profile?.display_name &&
                        order.shipper_profile.display_name.charAt(0)) ||
                      "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {currentShipper?.name ||
                      order.shipper_profile?.display_name ||
                      "Shipper"}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {(currentShipper?.email ||
                      order.shipper_profile?.email) && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        {currentShipper?.email || order.shipper_profile?.email}
                      </div>
                    )}
                    {(currentShipper?.phone_number ||
                      order.shipper_profile?.phone_number) && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        {currentShipper?.phone_number ||
                          order.shipper_profile?.phone_number}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isShipping && (
                <Alert variant="warning" className="mt-3">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Không thể thay đổi shipper khi đơn hàng đang trong quá trình
                    giao.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hiển thị thông tin shipper hiện tại nếu có */}
      <CurrentShipperInfo />

      {!isShipping && (
        <>
          <Alert>
            <Truck className="h-4 w-4" />
            <AlertTitle>Gán người giao hàng</AlertTitle>
            <AlertDescription>
              Chọn người giao hàng cho đơn hàng này. Shipper sẽ có quyền cập
              nhật trạng thái đơn hàng.
              {shippersError && (
                <div className="mt-2 text-destructive">
                  Lỗi tải danh sách shipper: {shippersError.message}
                </div>
              )}
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
                    <FormLabel className="text-base">Chọn shipper</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Cập nhật selectedShipper khi chọn
                        if (value === "none") {
                          setSelectedShipper(null);
                        } else {
                          setSelectedShipper(
                            shippers.find((s) => s.id === value)
                          );
                        }
                      }}
                      value={field.value}
                      disabled={
                        isShippersLoading || assignShipperMutation.isPending
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Chọn người giao hàng">
                            {field.value &&
                              field.value !== "none" &&
                              selectedShipper && (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6 flex-shrink-0">
                                    <AvatarImage
                                      src={selectedShipper.avatar_url || ""}
                                      alt={selectedShipper.name || "Shipper"}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="text-xs">
                                      {selectedShipper.name
                                        ? selectedShipper.name.charAt(0)
                                        : "S"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">
                                    {selectedShipper.name || "Shipper"}
                                  </span>
                                </div>
                              )}
                            {field.value === "none" && "Không gán shipper"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none" className="py-3">
                          <div className="flex items-center gap-2">
                            <UserX className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>Không gán shipper</span>
                          </div>
                        </SelectItem>

                        <Separator className="my-2" />

                        {isShippersLoading ? (
                          <div className="p-4 text-center">
                            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Đang tải danh sách...
                            </p>
                          </div>
                        ) : shippers.length === 0 ? (
                          <div className="p-4 text-center">
                            <PackageSearch className="h-5 w-5 mx-auto mb-2 opacity-50" />
                            <p className="text-sm text-muted-foreground">
                              Không có shipper nào
                            </p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[240px]">
                            {shippers.map((shipper) => (
                              <SelectItem
                                key={shipper.id}
                                value={shipper.id}
                                className="py-3"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage
                                      src={shipper.avatar_url || ""}
                                      alt={shipper.name || "Shipper"}
                                      className="object-cover"
                                    />
                                    <AvatarFallback>
                                      {shipper.name
                                        ? shipper.name.charAt(0)
                                        : "S"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="font-medium truncate">
                                      {shipper.name}
                                    </div>
                                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                                      {shipper.email && (
                                        <div className="flex items-center gap-1">
                                          <Mail className="h-3 w-3 flex-shrink-0" />
                                          <span className="truncate">
                                            {shipper.email}
                                          </span>
                                        </div>
                                      )}
                                      {shipper.phone_number && (
                                        <div className="flex items-center gap-1">
                                          <Phone className="h-3 w-3 flex-shrink-0" />
                                          <span className="truncate">
                                            {shipper.phone_number}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {field.value === "none" || !field.value
                        ? "Đơn hàng sẽ không được gán cho shipper nào."
                        : "Shipper được chọn sẽ thấy đơn hàng trong dashboard của họ."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="submit"
                  disabled={
                    assignShipperMutation.isPending ||
                    form.getValues("assigned_shipper_id") ===
                      currentShipperId ||
                    (form.getValues("assigned_shipper_id") === "none" &&
                      !currentShipperId)
                  }
                  className="gap-2"
                >
                  {assignShipperMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4" />
                      {currentShipperId
                        ? form.getValues("assigned_shipper_id") === "none"
                          ? "Hủy gán shipper"
                          : "Cập nhật shipper"
                        : "Gán shipper"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
