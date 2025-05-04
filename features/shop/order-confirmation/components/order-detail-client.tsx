"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Ban, Loader2, CheckCircle } from "lucide-react";
import { CancelOrderModal } from "./cancel-order-modal";
import { ConfirmReceiptModal } from "./confirm-receipt-modal";
import { useRouter } from "next/navigation";

interface OrderDetailClientProps {
    orderId?: number;
    token?: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
}

// Các trạng thái cho phép hủy đơn
const CANCELLABLE_STATUSES = ["Chờ xác nhận", "Đã xác nhận"];
// Trạng thái cho phép xác nhận đã nhận hàng
const RECEIVABLE_STATUS = "Đã giao";

export function OrderDetailClient({ orderId, token, status, paymentStatus, paymentMethod }: OrderDetailClientProps) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showConfirmReceiptModal, setShowConfirmReceiptModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const router = useRouter();

    // Kiểm tra đơn hàng có thể hủy không
    const canCancel = CANCELLABLE_STATUSES.includes(status);

    // Kiểm tra đơn hàng có thể xác nhận đã nhận không
    const canConfirmReceipt = status === RECEIVABLE_STATUS;

    // Kiểm tra xem đơn đã thanh toán online chưa
    const isPaidOnline = paymentStatus === "Paid" && paymentMethod !== "COD";

    // Xử lý sau khi có hành động thành công
    const handleActionSuccess = useCallback(() => {
        setIsRefreshing(true);

        // Refresh trang để cập nhật trạng thái
        router.refresh();

        // Đặt timeout để tránh hiệu ứng nhấp nháy khi refresh quá nhanh
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    }, [router]);

    if (status === "Đã hủy") {
        return (
            <div className="flex items-center justify-between py-2 px-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                <div className="flex items-center gap-2">
                    <Ban className="h-5 w-5" />
                    <span className="font-medium">Đơn hàng đã bị hủy</span>
                </div>
            </div>
        );
    }

    if (status === "Đã hoàn thành") {
        return (
            <div className="flex items-center justify-between py-2 px-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 border border-green-200 dark:border-green-900/50 rounded-md">
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Đơn hàng đã hoàn thành</span>
                </div>
            </div>
        );
    }

    if (!canCancel && !canConfirmReceipt) {
        return null; // Không hiển thị gì nếu không thể thực hiện hành động
    }

    if (isPaidOnline && canCancel) {
        return (
            <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                    <Ban className="h-5 w-5" />
                    <span className="text-sm">Đơn hàng đã thanh toán online không thể hủy trực tiếp. Vui lòng liên hệ hỗ trợ.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-3">
            {isRefreshing ? (
                <div className="flex items-center justify-center py-2 px-3 bg-muted rounded-md">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Đang cập nhật...</span>
                </div>
            ) : (
                <>
                    {canCancel && (
                        <Button
                            variant="outline"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setShowCancelModal(true)}
                        >
                            <Ban className="h-4 w-4 mr-2" />
                            Hủy đơn hàng
                        </Button>
                    )}

                    {canConfirmReceipt && (
                        <Button
                            variant="outline"
                            className="text-primary border-primary/30 hover:bg-primary/10 hover:text-primary"
                            onClick={() => setShowConfirmReceiptModal(true)}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Xác nhận đã nhận hàng
                        </Button>
                    )}
                </>
            )}

            <CancelOrderModal open={showCancelModal} onOpenChange={setShowCancelModal} orderId={orderId} token={token} onCancelled={handleActionSuccess} />

            <ConfirmReceiptModal
                open={showConfirmReceiptModal}
                onOpenChange={setShowConfirmReceiptModal}
                orderId={orderId}
                token={token}
                onConfirmed={handleActionSuccess}
            />
        </div>
    );
}
