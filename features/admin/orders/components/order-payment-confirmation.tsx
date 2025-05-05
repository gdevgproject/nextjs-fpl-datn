"use client";

import { useState } from "react";
import { useConfirmCodPayment } from "../hooks/use-confirm-cod-payment";
import { OrderWithRelations } from "../types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Banknote,
  Loader2,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { formatCurrency } from "@/lib/utils/format";

interface OrderPaymentConfirmationProps {
  order: OrderWithRelations;
  onSuccess?: () => void;
}

export function OrderPaymentConfirmation({
  order,
  onSuccess,
}: OrderPaymentConfirmationProps) {
  const toast = useSonnerToast();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { confirmCodPayment, isUpdating, error, canConfirmPayment } =
    useConfirmCodPayment();

  // Kiểm tra xem đơn hàng có phải COD đã giao không
  const isCodOrder = order.payment_methods?.name?.toLowerCase().includes("cod");
  const isDelivered = order.order_statuses?.name === "Đã giao";
  const isPending = order.payment_status === "Pending";
  const isPaid = order.payment_status === "Paid";
  const isEligibleForConfirmation = canConfirmPayment(order);

  // Xử lý xác nhận thanh toán
  const handleConfirmPayment = async () => {
    try {
      await confirmCodPayment(order.id);
      toast.success("Xác nhận thanh toán COD thành công", {
        description: `Đơn hàng #${order.id} đã được đánh dấu là đã thanh toán`,
      });
      setShowConfirmation(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(
        `Lỗi khi xác nhận thanh toán: ${
          error instanceof Error ? error.message : "Đã có lỗi xảy ra"
        }`
      );
    }
  };

  // Nếu không phải đơn hàng COD, hiển thị thông báo
  if (!isCodOrder) {
    return (
      <div className="py-4">
        <Alert variant="default" className="bg-muted/50">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Không phải đơn hàng COD</AlertTitle>
          <AlertDescription>
            Đơn hàng này sử dụng phương thức thanh toán{" "}
            <Badge variant="outline">
              {order.payment_methods?.name || "Không xác định"}
            </Badge>{" "}
            nên không thể xác nhận COD.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Nếu đơn hàng đã được thanh toán
  if (isPaid) {
    return (
      <div className="py-4">
        <Alert
          variant="success"
          className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900 text-green-800 dark:text-green-300"
        >
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertTitle>Đã thanh toán COD</AlertTitle>
          <AlertDescription>
            <p>
              Đơn hàng này đã được xác nhận thanh toán thành công. Số tiền:{" "}
              <span className="font-semibold">
                {formatCurrency(order.total_amount)}
              </span>
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Nếu đơn hàng chưa được giao
  if (!isDelivered) {
    return (
      <div className="py-4">
        <Alert
          variant="warning"
          className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900 text-yellow-800 dark:text-yellow-300"
        >
          <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle>Chưa thể xác nhận thanh toán COD</AlertTitle>
          <AlertDescription>
            <p>
              Đơn hàng COD này chưa được giao tới khách hàng. Bạn chỉ có thể xác nhận thanh toán sau khi đơn hàng ở trạng thái "Đã giao".
            </p>
            <div className="mt-2 flex items-center gap-1">
              <span>Trạng thái hiện tại: </span>
              <Badge variant="outline" className="ml-1">
                {order.order_statuses?.name || "Không xác định"}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Trường hợp có thể xác nhận thanh toán COD
  return (
    <div className="space-y-4 py-4">
      <Alert
        variant={showConfirmation ? "destructive" : "warning"}
        className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900 text-yellow-800 dark:text-yellow-300"
      >
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Chờ xác nhận thanh toán COD</AlertTitle>
        <AlertDescription>
          <p>
            Đơn hàng này sử dụng phương thức thanh toán COD (Tiền mặt khi giao
            hàng) và đã được giao tới khách hàng. Vui lòng xác nhận đã nhận được
            tiền từ khách hàng.
          </p>
          <p className="mt-2 font-semibold">
            Số tiền cần thu: {formatCurrency(order.total_amount)}
          </p>
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-5 w-5" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showConfirmation ? (
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xác nhận đã thu tiền COD cho đơn hàng này?
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={isUpdating}
              variant="success"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Xác nhận đã thu tiền
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowConfirmation(true)}
          className="w-full"
          variant="outline"
          size="lg"
        >
          <Banknote className="h-4 w-4 mr-2" />
          Xác nhận đã thu tiền COD
        </Button>
      )}
    </div>
  );
}
