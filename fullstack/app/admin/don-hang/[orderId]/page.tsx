"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import {
  useOrderDetails,
  useOrderActivityLog,
  useOrderStatuses,
  useUpdateOrderStatus,
  useUpdateOrderTracking,
  useUpdatePaymentStatus,
} from "@/features/admin/order-management/queries";
import OrderDetailsView from "@/features/admin/order-management/components/order-details-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getUserRoleFromMetadata } from "@/lib/utils/auth-utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = parseInt(params.orderId as string);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user role
  useEffect(() => {
    const checkUserRole = async () => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const role = getUserRoleFromMetadata(session.user);
        setIsAdmin(role === "admin");
      }

      setIsLoading(false);
    };

    checkUserRole();
  }, []);

  // Fetch order details, order statuses, and activity log
  const {
    data: orderDetails,
    isLoading: isLoadingOrder,
    isError,
    error,
  } = useOrderDetails(orderId);

  const { data: orderStatuses = [] } = useOrderStatuses();
  const { data: activityLog = [] } = useOrderActivityLog(orderId);

  // Mutation hooks
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const updateOrderTrackingMutation = useUpdateOrderTracking();
  const updatePaymentStatusMutation = useUpdatePaymentStatus();

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId: number, statusId: number) => {
    return updateOrderStatusMutation.mutateAsync({ orderId, statusId });
  };

  // Handle tracking number update
  const handleUpdateTracking = async (
    orderId: number,
    trackingNumber: string
  ) => {
    return updateOrderTrackingMutation.mutateAsync({ orderId, trackingNumber });
  };

  // Handle payment status update
  const handleUpdatePaymentStatus = async (
    orderId: number,
    paymentStatus: any
  ) => {
    return updatePaymentStatusMutation.mutateAsync({ orderId, paymentStatus });
  };

  // Show loading state while checking authentication and fetching order
  if (isLoading || isLoadingOrder) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !orderDetails) {
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message ||
              "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <OrderDetailsView
        order={orderDetails}
        orderStatuses={orderStatuses}
        activityLog={activityLog}
        isAdmin={isAdmin}
        updateOrderStatus={handleUpdateOrderStatus}
        updateOrderTracking={handleUpdateTracking}
        updatePaymentStatus={handleUpdatePaymentStatus}
      />
    </div>
  );
}
