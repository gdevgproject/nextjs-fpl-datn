// Server Component for Order Detail Page
import { notFound } from "next/navigation";
import OrderDetailsView from "@/features/admin/order-management/components/order-details-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getUserRoleFromMetadata } from "@/lib/utils/auth-utils";
import { OrderDetailsClientWrapper } from "@/features/admin/order-management/components/order-details-client-wrapper";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Server-side data fetching
async function getOrderData(orderId: number) {
  // Import server-side actions
  const { getOrderDetails, getOrderStatuses, getOrderActivityLog } =
    await import("@/features/admin/order-management/actions");

  try {
    // Get current user and verify admin/staff role
    const supabase = await getSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { error: "Unauthorized", isAdmin: false };
    }

    // Check user role
    const role = getUserRoleFromMetadata(session.user);
    const isAdmin = role === "admin";

    if (role !== "admin" && role !== "staff") {
      return { error: "Forbidden", isAdmin };
    }

    // Fetch data in parallel
    const [orderDetailsResult, orderStatusesResult, activityLogResult] =
      await Promise.all([
        getOrderDetails(orderId),
        getOrderStatuses(),
        getOrderActivityLog(orderId),
      ]);

    return {
      orderDetails: orderDetailsResult.data,
      orderStatuses: orderStatusesResult.data || [],
      activityLog: activityLogResult.data || [],
      error: orderDetailsResult.error,
      isAdmin,
    };
  } catch (error) {
    console.error("Error fetching order data:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to load order details",
      isAdmin: false,
    };
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const orderId = parseInt(params.orderId);

  if (isNaN(orderId)) {
    notFound();
  }

  // Fetch data on the server
  const { orderDetails, orderStatuses, activityLog, error, isAdmin } =
    await getOrderData(orderId);

  // Show error state
  if (error || !orderDetails) {
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <OrderDetailsClientWrapper
        order={orderDetails}
        orderStatuses={orderStatuses}
        activityLog={activityLog}
        isAdmin={isAdmin}
      />
    </div>
  );
}
