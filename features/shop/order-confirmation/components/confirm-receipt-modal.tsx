"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { confirmOrderReceived, confirmOrderReceivedByToken } from "../actions";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConfirmReceiptModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId?: number;
    token?: string;
    onConfirmed: () => void;
}

export function ConfirmReceiptModal({ open, onOpenChange, orderId, token, onConfirmed }: ConfirmReceiptModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useSonnerToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            let response;

            // Xử lý xác nhận đơn hàng dựa trên loại đơn (token đối với khách vãng lai, orderId đối với người dùng đã đăng nhập)
            if (token) {
                response = await confirmOrderReceivedByToken(token);
            } else if (orderId) {
                response = await confirmOrderReceived(orderId);
            } else {
                throw new Error("Thiếu thông tin đơn hàng");
            }

            if (!response.success) {
                setError("error" in response ? response.error : "Có lỗi xảy ra khi xác nhận đơn hàng");
                return;
            }

            toast("Xác nhận thành công", {
                description: "Cảm ơn bạn đã xác nhận đã nhận hàng",
            });

            onOpenChange(false);
            onConfirmed();
        } catch (error) {
            setError("Có lỗi xảy ra khi xác nhận đơn hàng. Vui lòng thử lại sau.");
            console.error("Error confirming order receipt:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Xác nhận đã nhận hàng</DialogTitle>
                        <DialogDescription>Khi xác nhận đã nhận hàng, đơn hàng của bạn sẽ được chuyển sang trạng thái "Đã hoàn thành".</DialogDescription>
                    </DialogHeader>

                    <div className="my-6 space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Alert variant="default" className="bg-primary/10">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <AlertDescription className="text-primary">
                                Vui lòng xác nhận bạn đã nhận được hàng, kiểm tra đầy đủ và hài lòng với đơn hàng.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isSubmitting}>
                                Hủy
                            </Button>
                        </DialogClose>
                        <Button type="submit" variant="default" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý
                                </>
                            ) : (
                                "Xác nhận đã nhận hàng"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
