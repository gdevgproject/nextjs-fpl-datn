"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderDetailClient } from "./order-detail-client";

interface OrderLookupClientProps {
  order: any; // Thông tin đơn hàng từ server component
}

export function OrderLookupClient({ order }: OrderLookupClientProps) {
  if (!order) return null;

  return (
    <>
      {/* Nút hủy đơn hàng */}
      <div className="mt-6 flex justify-between items-center">
        <OrderDetailClient
          orderId={order.id}
          token={order.access_token}
          status={order.status}
          paymentStatus={order.payment_status}
          paymentMethod={order.payment_method}
        />

        {/* Các nút điều hướng khác */}
        <div className="flex gap-4">
          {order.access_token ? (
            <Button asChild>
              <Link href="/san-pham">Tiếp tục mua sắm</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/tai-khoan/don-hang">Xem đơn hàng của tôi</Link>
              </Button>
              <Button asChild>
                <Link href="/san-pham">Tiếp tục mua sắm</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
