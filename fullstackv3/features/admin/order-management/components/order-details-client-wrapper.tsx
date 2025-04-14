"use client"
import OrderDetailsView from "./order-details-view"
import type { OrderDetails, OrderActivityLog } from "../types"
import type { PaymentStatus } from "@/features/orders/types"
import { useUpdateOrderStatus, useUpdateOrderTracking, useUpdatePaymentStatus } from "../queries"

interface OrderDetailsClientWrapperProps {
  order: OrderDetails
  orderStatuses: Array<{ id: number; name: string }>
  activityLog: OrderActivityLog[]
  isAdmin: boolean
}

export function OrderDetailsClientWrapper({
  order,
  orderStatuses,
  activityLog,
  isAdmin,
}: OrderDetailsClientWrapperProps) {
  // Mutation hooks
  const updateOrderStatusMutation = useUpdateOrderStatus()
  const updateOrderTrackingMutation = useUpdateOrderTracking()
  const updatePaymentStatusMutation = useUpdatePaymentStatus()

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId: number, statusId: number) => {
    return updateOrderStatusMutation.mutateAsync({ orderId, statusId })
  }

  // Handle tracking number update
  const handleUpdateTracking = async (orderId: number, trackingNumber: string) => {
    return updateOrderTrackingMutation.mutateAsync({ orderId, trackingNumber })
  }

  // Handle payment status update
  const handleUpdatePaymentStatus = async (orderId: number, paymentStatus: PaymentStatus) => {
    return updatePaymentStatusMutation.mutateAsync({ orderId, paymentStatus })
  }

  return (
    <OrderDetailsView
      order={order}
      orderStatuses={orderStatuses}
      activityLog={activityLog}
      isAdmin={isAdmin}
      updateOrderStatus={handleUpdateOrderStatus}
      updateOrderTracking={handleUpdateTracking}
      updatePaymentStatus={handleUpdatePaymentStatus}
    />
  )
}

